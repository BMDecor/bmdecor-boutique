import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';

/**
 * BM Decoracion Boutique Infrastructure Stack
 *
 * Deploys to AWS Account 450284264313 in eu-west-1 (Ireland)
 * Uses the bmdecor AWS profile for deployments
 */
export class InfrastructureStack extends cdk.Stack {
  public readonly productsTable: dynamodb.Table;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─────────────────────────────────────────────────────
    // DynamoDB Single-Table Design
    // ─────────────────────────────────────────────────────

    this.productsTable = new dynamodb.Table(this, 'BmDecorProducts', {
      tableName: 'BmDecorProducts',
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
    });

    // GSI for filtering products by brand (BM | FB | LG)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'GSI-Brand',
      partitionKey: {
        name: 'brand',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying entities by type (orders, etc.)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'GSI-EntityType',
      partitionKey: {
        name: 'entityType',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ─────────────────────────────────────────────────────
    // Cognito User Pool
    // ─────────────────────────────────────────────────────

    this.userPool = new cognito.UserPool(this, 'BmDecorUserPool', {
      userPoolName: 'BmDecorUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      customAttributes: {
        display_name: new cognito.StringAttribute({ mutable: true }),
        consent_timestamp: new cognito.StringAttribute({ mutable: true }),
        consent_version: new cognito.StringAttribute({ mutable: true }),
      },
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
        emailSubject: 'BM Decoracion — Verify Your Email',
        emailBody: [
          '<div style="background-color:#1a1a1a;padding:40px 20px;font-family:Georgia,serif;">',
          '<div style="max-width:480px;margin:0 auto;text-align:center;">',
          '<h1 style="color:#c5a065;font-size:28px;margin-bottom:8px;">BM Decoraci&oacute;n</h1>',
          '<p style="color:#e0e0e0;font-size:16px;margin-bottom:24px;">Welcome to BM Decoracion</p>',
          '<p style="color:#cccccc;font-size:14px;margin-bottom:16px;">Your secure access code is:</p>',
          '<div style="background-color:#2a2a2a;border:2px solid #c5a065;border-radius:8px;padding:20px;margin:0 auto 24px;display:inline-block;">',
          '<span style="color:#c5a065;font-size:36px;letter-spacing:8px;font-family:monospace;font-weight:bold;">{####}</span>',
          '</div>',
          '<p style="color:#999999;font-size:12px;">This code expires in 10 minutes.</p>',
          '<hr style="border:none;border-top:1px solid #333;margin:24px 0;" />',
          '<p style="color:#666666;font-size:11px;">BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella, Spain</p>',
          '<p style="color:#666666;font-size:11px;"><a href="https://bmdecor.es/privacy" style="color:#c5a065;">Privacy Policy</a></p>',
          '</div></div>',
        ].join(''),
      },
    });

    // Web client (public SPA — no client secret)
    this.userPoolClient = new cognito.UserPoolClient(this, 'BmDecorWebClient', {
      userPool: this.userPool,
      userPoolClientName: 'BmDecorWebClient',
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // Cognito Groups: Admin, Employee, Customer
    for (const groupName of ['Admin', 'Employee', 'Customer']) {
      new cognito.CfnUserPoolGroup(this, `Group${groupName}`, {
        userPoolId: this.userPool.userPoolId,
        groupName,
        description: `${groupName} group for BM Decoracion`,
      });
    }

    // ─────────────────────────────────────────────────────
    // Post-Confirmation Lambda (Welcome Email via SES)
    // ─────────────────────────────────────────────────────

    const postConfirmationFn = new NodejsFunction(this, 'PostConfirmationFn', {
      functionName: 'BmDecor-PostConfirmation',
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../backend/functions/auth/post-confirmation/index.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        SENDER_EMAIL: 'derfischer1778@gmail.com',
      },
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'node22',
      },
    });

    postConfirmationFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    );

    postConfirmationFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:AdminAddUserToGroup'],
        resources: [`arn:aws:cognito-idp:eu-west-1:450284264313:userpool/eu-west-1_JxtlXtf30`],
      })
    );

    this.userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmationFn
    );

    // ─────────────────────────────────────────────────────
    // Stack Outputs
    // ─────────────────────────────────────────────────────

    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
      description: 'DynamoDB table for unified paint product catalog',
    });

    new cdk.CfnOutput(this, 'ProductsTableArn', {
      value: this.productsTable.tableArn,
      description: 'ARN of the products table',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'PostConfirmationFnArn', {
      value: postConfirmationFn.functionArn,
      description: 'Post-confirmation Lambda ARN for welcome emails',
    });
  }
}
