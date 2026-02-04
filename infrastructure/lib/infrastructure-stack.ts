import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
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
  }
}
