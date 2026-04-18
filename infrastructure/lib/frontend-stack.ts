import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { readFileSync, existsSync } from 'fs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

/**
 * Frontend Stack — deploys the Next.js 16 app to AWS using OpenNext build
 * output. Comprises:
 *
 *   - S3 bucket for static assets + public/ files (_next/static/*, public/*)
 *   - Lambda function running the OpenNext server handler (SSR + API routes)
 *   - Lambda function URL fronting the SSR function (CloudFront can't call
 *     Lambda directly for dynamic traffic without a URL or API Gateway;
 *     Function URL is simplest)
 *   - Lambda function for OpenNext image optimization
 *   - CloudFront distribution with two origins (Lambda URL + S3), behaviours
 *     split so static paths short-circuit to S3 and dynamic paths go to
 *     Lambda
 *   - ACM certificate for the custom domain — provisioned in us-east-1
 *     (CloudFront requirement) via the cross-region cert construct
 *   - Route 53 ALIAS record for `preview.bmdecor.es` pointing at CloudFront
 *
 * OpenNext build must have been run in frontend/ before `cdk synth`/`cdk
 * deploy`, so `.open-next/open-next.output.json` exists and describes the
 * assets + bundles to deploy.
 */
export interface FrontendStackProps extends cdk.StackProps {
  /** e.g. 'preview.bmdecor.es' */
  readonly domainName: string;
  /** Parent hosted zone — e.g. 'bmdecor.es' at Z0888304370ICLTMQOITD */
  readonly hostedZoneId: string;
  readonly hostedZoneName: string;
  /**
   * Environment variables to inject into the SSR Lambda. These mirror the
   * Vercel production env set (DynamoDB table, Cognito pool, etc.) plus
   * the new pre-launch gate vars.
   */
  readonly lambdaEnv: Record<string, string>;
  /**
   * Path from this stack's source file to the Next.js app root where
   * `.open-next/` lives. Defaults to `../../frontend`.
   */
  readonly openNextDir?: string;
  /**
   * ARN of the ACM certificate in us-east-1 (CloudFront requirement).
   * Pass `certStack.certificateArn` directly — combined with
   * `crossRegionReferences: true` this resolves across regions.
   */
  readonly certArnUsEast1: string;
}

interface OpenNextOutput {
  origins: Record<string, OpenNextOrigin>;
  behaviors: Array<{
    pattern: string;
    origin?: string;
    edgeFunction?: string;
  }>;
  additionalProps?: {
    disableIncrementalCache?: boolean;
    disableTagCache?: boolean;
  };
}

type OpenNextOrigin =
  | { type: 's3'; originPath?: string; copy: Array<{ from: string; to: string; cached: boolean }> }
  | { type: 'function'; handler: string; bundle: string; streaming?: boolean };

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly assetBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // openNextDir points at the Next.js app root (frontend/), not the .open-next
    // sub-dir. The paths in open-next.output.json (copy.from, bundle) already
    // include the ".open-next/" prefix, so joining them with the app root
    // resolves correctly.
    const openNextDir = path.resolve(
      __dirname,
      props.openNextDir ?? '../../frontend'
    );
    const outputFile = path.join(openNextDir, '.open-next', 'open-next.output.json');
    if (!existsSync(outputFile)) {
      throw new Error(
        `OpenNext output not found at ${outputFile}. Run "npx open-next build" in frontend/ before cdk deploy.`
      );
    }
    const output: OpenNextOutput = JSON.parse(readFileSync(outputFile, 'utf-8'));

    // ─────────────────────────────────────────────────────
    // S3 bucket for static assets (files under `_next/static`, `public/`)
    // ─────────────────────────────────────────────────────
    this.assetBucket = new s3.Bucket(this, 'AssetBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
      versioned: false,
      lifecycleRules: [
        { noncurrentVersionExpiration: cdk.Duration.days(7) },
      ],
    });

    // Deploy the static files from open-next's S3 origin(s)
    const s3Origin = output.origins.s3;
    if (s3Origin && s3Origin.type === 's3') {
      const bases: Array<{ from: string; to: string }> = [];
      for (const copy of s3Origin.copy) {
        bases.push({ from: path.join(openNextDir, copy.from), to: copy.to });
      }
      // Single deployment grouping reduces Lambda-backed deployment concurrency
      new s3deploy.BucketDeployment(this, 'AssetsDeploy', {
        sources: bases.map((b) => s3deploy.Source.asset(b.from)),
        destinationBucket: this.assetBucket,
        destinationKeyPrefix: bases[0]?.to ?? '',
        prune: false,
        memoryLimit: 1024,
      });
    }

    // ─────────────────────────────────────────────────────
    // SSR Lambda (default origin handler from OpenNext)
    // ─────────────────────────────────────────────────────
    const defaultOrigin = output.origins.default;
    if (!defaultOrigin || defaultOrigin.type !== 'function') {
      throw new Error('OpenNext output has no `default` function origin');
    }

    const ssrFunction = new lambda.Function(this, 'SsrFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: defaultOrigin.handler,
      code: lambda.Code.fromAsset(path.join(openNextDir, defaultOrigin.bundle)),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        ...props.lambdaEnv,
        NODE_ENV: 'production',
      },
      architecture: lambda.Architecture.ARM_64,
    });

    const ssrUrl = ssrFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      invokeMode: defaultOrigin.streaming
        ? lambda.InvokeMode.RESPONSE_STREAM
        : lambda.InvokeMode.BUFFERED,
    });

    // ─────────────────────────────────────────────────────
    // Optional: Image Optimization Lambda (OpenNext emits an
    // `imageOptimizer` origin if image optimization is enabled)
    // ─────────────────────────────────────────────────────
    let imageFunctionUrl: lambda.FunctionUrl | undefined;
    const imageOrigin = output.origins.imageOptimizer;
    if (imageOrigin && imageOrigin.type === 'function') {
      const imageFn = new lambda.Function(this, 'ImageOptimizerFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: imageOrigin.handler,
        code: lambda.Code.fromAsset(path.join(openNextDir, imageOrigin.bundle)),
        memorySize: 2048,
        timeout: cdk.Duration.seconds(30),
        environment: {
          BUCKET_NAME: this.assetBucket.bucketName,
          BUCKET_KEY_PREFIX: 'assets',
        },
        architecture: lambda.Architecture.ARM_64,
      });
      this.assetBucket.grantRead(imageFn);
      imageFunctionUrl = imageFn.addFunctionUrl({
        authType: lambda.FunctionUrlAuthType.NONE,
      });
    }

    // ─────────────────────────────────────────────────────
    // ACM cert in us-east-1 (CloudFront requirement)
    // ─────────────────────────────────────────────────────
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    // Cross-region cert: CertificateStack lives in us-east-1 (CloudFront
    // requirement) and passes its cert ARN here via props. Combined with
    // crossRegionReferences: true on both stacks, CDK handles the actual
    // cross-region import (via a short-lived SSM Parameter).
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', props.certArnUsEast1);

    // ─────────────────────────────────────────────────────
    // CloudFront distribution
    // ─────────────────────────────────────────────────────
    const ssrHttpOrigin = new origins.HttpOrigin(
      cdk.Fn.select(2, cdk.Fn.split('/', ssrUrl.url)),
      {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }
    );
    const s3BucketOrigin = origins.S3BucketOrigin.withOriginAccessControl(
      this.assetBucket,
      {}
    );

    const additionalBehaviors: Record<string, cloudfront.BehaviorOptions> = {
      '_next/static/*': {
        origin: s3BucketOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      },
      'static/*': {
        origin: s3BucketOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      },
    };

    if (imageFunctionUrl) {
      additionalBehaviors['_next/image*'] = {
        origin: new origins.HttpOrigin(
          cdk.Fn.select(2, cdk.Fn.split('/', imageFunctionUrl.url)),
          { protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      };
    }

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [props.domainName],
      certificate,
      defaultBehavior: {
        origin: ssrHttpOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      },
      additionalBehaviors,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enableLogging: false,
      defaultRootObject: '',
      comment: `Next.js frontend — ${props.domainName}`,
    });

    // Public-read via CloudFront OAC — grant distribution access to bucket
    this.assetBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [`${this.assetBucket.bucketArn}/*`],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    );

    // ─────────────────────────────────────────────────────
    // Route 53 ALIAS for preview.bmdecor.es
    // ─────────────────────────────────────────────────────
    new route53.ARecord(this, 'AliasRecord', {
      zone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    });

    // ─────────────────────────────────────────────────────
    // Useful outputs
    // ─────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront domain (used for custom domain ALIAS)',
    });
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${props.domainName}`,
    });
    new cdk.CfnOutput(this, 'AssetBucketName', {
      value: this.assetBucket.bucketName,
    });
  }
}
