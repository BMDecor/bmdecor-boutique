import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

/**
 * CertificateStack — provisions an ACM cert for the CloudFront distribution
 * in us-east-1 (CloudFront requirement), DNS-validated against the
 * `bmdecor.es` hosted zone.
 *
 * This stack MUST be deployed with env.region = us-east-1. The FrontendStack
 * (which lives in eu-west-1) imports the cert by ARN via CDK context.
 */
export interface CertificateStackProps extends cdk.StackProps {
  readonly domainName: string;
  readonly hostedZoneId: string;
  readonly hostedZoneName: string;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificateArn: string;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    if (props.env?.region !== 'us-east-1') {
      throw new Error(
        `CertificateStack must be deployed to us-east-1 (CloudFront requirement). Got ${props.env?.region}`
      );
    }

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    const cert = new acm.Certificate(this, 'Certificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    this.certificateArn = cert.certificateArn;

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: cert.certificateArn,
      exportName: `${id}-certificateArn`,
    });
  }
}
