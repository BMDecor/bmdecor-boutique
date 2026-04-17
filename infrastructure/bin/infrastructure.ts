#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { CertificateStack } from '../lib/certificate-stack';

const app = new cdk.App();

const ACCOUNT = '450284264313';
const HOSTED_ZONE_ID = 'Z0888304370ICLTMQOITD';
const HOSTED_ZONE_NAME = 'bmdecor.es';
const DOMAIN_NAME = (app.node.tryGetContext('domainName') as string | undefined) ?? 'preview.bmdecor.es';

// ─────────────────────────────────────────────────────
// Backend infrastructure (eu-west-1)
// DynamoDB, Cognito, backend Lambdas — unchanged
// ─────────────────────────────────────────────────────
new InfrastructureStack(app, 'BmDecorBoutiqueStack', {
  env: { account: ACCOUNT, region: 'eu-west-1' },
  description: 'BM Decoracion - Premium paint boutique backend infrastructure',
});

// ─────────────────────────────────────────────────────
// Frontend ACM cert (us-east-1 — CloudFront requires this region)
// ─────────────────────────────────────────────────────
const certStack = new CertificateStack(app, 'BmDecorFrontendCertStack', {
  env: { account: ACCOUNT, region: 'us-east-1' },
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID,
  hostedZoneName: HOSTED_ZONE_NAME,
  crossRegionReferences: true,
  description: `ACM cert for ${DOMAIN_NAME} (CloudFront requires us-east-1)`,
});

// ─────────────────────────────────────────────────────
// Frontend (eu-west-1) — Next.js on CloudFront + Lambda + S3
// ─────────────────────────────────────────────────────
// Lambda env mirrors the Vercel production set. Each value comes from
// the `env:<NAME>` CDK context (set via cdk.context.json, --context flags,
// or the GHA workflow).
const requiredEnvKeys = [
  'PRELAUNCH_MODE',
  'PRELAUNCH_BYPASS_TOKEN',
  'ADMIN_API_KEY',
  'BMDECOR_AWS_ACCESS_KEY_ID',
  'BMDECOR_AWS_REGION',
  'BMDECOR_AWS_SECRET_ACCESS_KEY',
  'BMDECOR_DYNAMODB_TABLE',
  'BMDECOR_S3_BUCKET',
  'NEXT_PUBLIC_COGNITO_CLIENT_ID',
  'NEXT_PUBLIC_COGNITO_REGION',
  'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
  'NEXT_PUBLIC_BASE_URL',
];

const lambdaEnv: Record<string, string> = {};
const missing: string[] = [];
for (const k of requiredEnvKeys) {
  const v = app.node.tryGetContext(`env:${k}`);
  if (typeof v === 'string' && v.length > 0) {
    lambdaEnv[k] = v;
  } else {
    missing.push(k);
  }
}
if (missing.length > 0 && app.node.tryGetContext('allowMissingEnv') !== 'true') {
  // eslint-disable-next-line no-console
  console.warn(
    `[FrontendStack] missing env context values: ${missing.join(', ')}. ` +
      `Populate cdk.context.json or pass --context env:NAME=value for each.`
  );
}

const frontendStack = new FrontendStack(app, 'BmDecorFrontendStack', {
  env: { account: ACCOUNT, region: 'eu-west-1' },
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID,
  hostedZoneName: HOSTED_ZONE_NAME,
  lambdaEnv,
  crossRegionReferences: true,
  description: `BM Decoracion frontend — ${DOMAIN_NAME}`,
});

frontendStack.addDependency(certStack);

// Cross-region cert ARN reference. `crossRegionReferences: true` above
// wires CloudFormation to import this across regions automatically.
app.node.setContext('certArnUsEast1', certStack.certificateArn);
