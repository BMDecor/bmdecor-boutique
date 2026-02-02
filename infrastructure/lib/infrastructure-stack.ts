import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

/**
 * BM Decoracion Boutique Infrastructure Stack
 *
 * Deploys to AWS Account 450284264313 in eu-west-1 (Ireland)
 * Uses the bmdecor AWS profile for deployments
 */
export class InfrastructureStack extends cdk.Stack {
  public readonly productsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Single-Table Design for unified product catalog
    // Supports Benjamin Moore, Farrow & Ball, and Little Greene products
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

    // Stack outputs
    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
      description: 'DynamoDB table for unified paint product catalog',
    });

    new cdk.CfnOutput(this, 'ProductsTableArn', {
      value: this.productsTable.tableArn,
      description: 'ARN of the products table',
    });
  }
}
