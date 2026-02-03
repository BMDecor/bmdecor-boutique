/**
 * AWS Absolute Resource Audit v2
 *
 * Comprehensive READ-ONLY audit of all AWS resources in eu-west-1
 * for the BmDecor project (Account 450284264313).
 *
 * STRICT EXCLUSION: No IAM Roles, Users, or Policies are scanned.
 *
 * Services Audited:
 * - Amplify (Apps, Branches, Custom Domains)
 * - Cognito (User Pools, Identity Pools)
 * - DynamoDB (Tables)
 * - S3 (Buckets)
 * - Secrets Manager (Secrets)
 * - Lambda (Functions)
 * - EC2 (Instances, Elastic IPs)
 * - API Gateway (REST & HTTP APIs)
 * - VPC (NAT Gateways, Internet Gateways)
 * - CloudFormation (Stacks)
 */

import { fromIni } from '@aws-sdk/credential-providers';

// Service Clients
import { AmplifyClient, ListAppsCommand, ListBranchesCommand, ListDomainAssociationsCommand } from '@aws-sdk/client-amplify';
import { CognitoIdentityProviderClient, ListUserPoolsCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient, ListIdentityPoolsCommand } from '@aws-sdk/client-cognito-identity';
import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListBucketsCommand, GetBucketTaggingCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import { SecretsManagerClient, ListSecretsCommand } from '@aws-sdk/client-secrets-manager';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { EC2Client, DescribeInstancesCommand, DescribeAddressesCommand, DescribeNatGatewaysCommand, DescribeInternetGatewaysCommand, DescribeVpcsCommand } from '@aws-sdk/client-ec2';
import { APIGatewayClient, GetRestApisCommand } from '@aws-sdk/client-api-gateway';
import { ApiGatewayV2Client, GetApisCommand } from '@aws-sdk/client-apigatewayv2';
import { CloudFormationClient, ListStacksCommand, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

// Configuration
const CONFIG = {
  AWS_PROFILE: 'bmdecor',
  AWS_REGION: 'eu-west-1',
  AWS_ACCOUNT: '450284264313',
  // Project identifiers for AUTHORIZED flagging
  PROJECT_PATTERNS: ['BmDecor', 'bmdecor', 'CDKToolkit', 'bmdeckor', 'Bmdecor'],
};

// Resource entry type
interface ResourceEntry {
  service: string;
  resourceName: string;
  idOrArn: string;
  status: string;
  projectAssociation: 'AUTHORIZED' | 'SUSPECTED BLOAT';
  alert?: string;
}

// Initialize credentials
const credentials = fromIni({ profile: CONFIG.AWS_PROFILE });
const clientConfig = { region: CONFIG.AWS_REGION, credentials };

// Service clients
const amplifyClient = new AmplifyClient(clientConfig);
const cognitoIdpClient = new CognitoIdentityProviderClient(clientConfig);
const cognitoIdentityClient = new CognitoIdentityClient(clientConfig);
const dynamoClient = new DynamoDBClient(clientConfig);
const s3Client = new S3Client(clientConfig);
const secretsClient = new SecretsManagerClient(clientConfig);
const lambdaClient = new LambdaClient(clientConfig);
const ec2Client = new EC2Client(clientConfig);
const apiGatewayClient = new APIGatewayClient(clientConfig);
const apiGatewayV2Client = new ApiGatewayV2Client(clientConfig);
const cfnClient = new CloudFormationClient(clientConfig);

/**
 * Check if a resource name matches project patterns
 */
function isAuthorized(name: string): boolean {
  const lowerName = name.toLowerCase();
  return CONFIG.PROJECT_PATTERNS.some(pattern =>
    lowerName.includes(pattern.toLowerCase())
  );
}

/**
 * Audit Amplify Apps, Branches, and Custom Domains
 */
async function auditAmplify(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  try {
    const appsResponse = await amplifyClient.send(new ListAppsCommand({}));
    const apps = appsResponse.apps || [];

    for (const app of apps) {
      resources.push({
        service: 'Amplify App',
        resourceName: app.name || 'Unknown',
        idOrArn: app.appArn || app.appId || '',
        status: app.productionBranch ? 'DEPLOYED' : 'CONFIGURED',
        projectAssociation: isAuthorized(app.name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });

      // List branches
      try {
        const branchesResponse = await amplifyClient.send(new ListBranchesCommand({ appId: app.appId }));
        for (const branch of branchesResponse.branches || []) {
          resources.push({
            service: 'Amplify Branch',
            resourceName: `${app.name}/${branch.branchName}`,
            idOrArn: branch.branchArn || '',
            status: branch.activeJobId ? 'BUILDING' : 'READY',
            projectAssociation: isAuthorized(app.name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
          });
        }
      } catch (e) { /* ignore branch errors */ }

      // List custom domains
      try {
        const domainsResponse = await amplifyClient.send(new ListDomainAssociationsCommand({ appId: app.appId }));
        for (const domain of domainsResponse.domainAssociations || []) {
          resources.push({
            service: 'Amplify Domain',
            resourceName: domain.domainName || 'Unknown',
            idOrArn: domain.domainAssociationArn || '',
            status: domain.domainStatus || 'UNKNOWN',
            projectAssociation: isAuthorized(app.name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
          });
        }
      } catch (e) { /* ignore domain errors */ }
    }
  } catch (error) {
    console.log('  Amplify: No resources or access denied');
  }

  return resources;
}

/**
 * Audit Cognito User Pools and Identity Pools
 */
async function auditCognito(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  // User Pools
  try {
    const userPoolsResponse = await cognitoIdpClient.send(new ListUserPoolsCommand({ MaxResults: 60 }));
    for (const pool of userPoolsResponse.UserPools || []) {
      resources.push({
        service: 'Cognito User Pool',
        resourceName: pool.Name || 'Unknown',
        idOrArn: pool.Id || '',
        status: pool.Status || 'ACTIVE',
        projectAssociation: isAuthorized(pool.Name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  Cognito User Pools: No resources or access denied');
  }

  // Identity Pools
  try {
    const identityPoolsResponse = await cognitoIdentityClient.send(new ListIdentityPoolsCommand({ MaxResults: 60 }));
    for (const pool of identityPoolsResponse.IdentityPools || []) {
      resources.push({
        service: 'Cognito Identity Pool',
        resourceName: pool.IdentityPoolName || 'Unknown',
        idOrArn: pool.IdentityPoolId || '',
        status: 'ACTIVE',
        projectAssociation: isAuthorized(pool.IdentityPoolName || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  Cognito Identity Pools: No resources or access denied');
  }

  return resources;
}

/**
 * Audit DynamoDB Tables
 */
async function auditDynamoDB(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  try {
    const tablesResponse = await dynamoClient.send(new ListTablesCommand({}));
    for (const tableName of tablesResponse.TableNames || []) {
      try {
        const describeResponse = await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
        const table = describeResponse.Table;
        resources.push({
          service: 'DynamoDB Table',
          resourceName: tableName,
          idOrArn: table?.TableArn || '',
          status: table?.TableStatus || 'UNKNOWN',
          projectAssociation: isAuthorized(tableName) ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
        });
      } catch (e) {
        resources.push({
          service: 'DynamoDB Table',
          resourceName: tableName,
          idOrArn: 'N/A',
          status: 'UNKNOWN',
          projectAssociation: isAuthorized(tableName) ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
        });
      }
    }
  } catch (error) {
    console.log('  DynamoDB: No resources or access denied');
  }

  return resources;
}

/**
 * Audit S3 Buckets (highlight orphaned buckets)
 */
async function auditS3(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  try {
    const bucketsResponse = await s3Client.send(new ListBucketsCommand({}));
    for (const bucket of bucketsResponse.Buckets || []) {
      const bucketName = bucket.Name || 'Unknown';
      let region = 'unknown';
      let tags: string[] = [];

      // Get bucket location
      try {
        const locationResponse = await s3Client.send(new GetBucketLocationCommand({ Bucket: bucketName }));
        region = locationResponse.LocationConstraint || 'us-east-1';
      } catch (e) { /* ignore */ }

      // Get bucket tags
      try {
        const tagsResponse = await s3Client.send(new GetBucketTaggingCommand({ Bucket: bucketName }));
        tags = (tagsResponse.TagSet || []).map(t => `${t.Key}=${t.Value}`);
      } catch (e) { /* no tags */ }

      const authorized = isAuthorized(bucketName) || tags.some(t => isAuthorized(t));
      const isOrphaned = !authorized && !bucketName.includes('cdk') && !bucketName.includes('amplify');

      resources.push({
        service: 'S3 Bucket',
        resourceName: bucketName,
        idOrArn: `arn:aws:s3:::${bucketName}`,
        status: `Region: ${region}`,
        projectAssociation: authorized ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
        alert: isOrphaned ? '⚠️ POTENTIAL ORPHANED BUCKET' : undefined,
      });
    }
  } catch (error) {
    console.log('  S3: No resources or access denied');
  }

  return resources;
}

/**
 * Audit Secrets Manager
 */
async function auditSecretsManager(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  try {
    const secretsResponse = await secretsClient.send(new ListSecretsCommand({}));
    for (const secret of secretsResponse.SecretList || []) {
      resources.push({
        service: 'Secrets Manager',
        resourceName: secret.Name || 'Unknown',
        idOrArn: secret.ARN || '',
        status: secret.DeletedDate ? 'SCHEDULED_DELETE' : 'ACTIVE',
        projectAssociation: isAuthorized(secret.Name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  Secrets Manager: No resources or access denied');
  }

  return resources;
}

/**
 * Audit Lambda Functions
 */
async function auditLambda(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  try {
    const functionsResponse = await lambdaClient.send(new ListFunctionsCommand({}));
    for (const func of functionsResponse.Functions || []) {
      resources.push({
        service: 'Lambda Function',
        resourceName: func.FunctionName || 'Unknown',
        idOrArn: func.FunctionArn || '',
        status: func.State || 'Active',
        projectAssociation: isAuthorized(func.FunctionName || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  Lambda: No resources or access denied');
  }

  return resources;
}

/**
 * Audit EC2 Instances and Elastic IPs
 */
async function auditEC2(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  // EC2 Instances
  try {
    const instancesResponse = await ec2Client.send(new DescribeInstancesCommand({}));
    for (const reservation of instancesResponse.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        const nameTag = instance.Tags?.find(t => t.Key === 'Name')?.Value || 'No Name';
        const authorized = isAuthorized(nameTag) || instance.Tags?.some(t => isAuthorized(t.Value || ''));

        resources.push({
          service: 'EC2 Instance',
          resourceName: nameTag,
          idOrArn: instance.InstanceId || '',
          status: instance.State?.Name || 'unknown',
          projectAssociation: authorized ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
        });
      }
    }
  } catch (error) {
    console.log('  EC2 Instances: No resources or access denied');
  }

  // Elastic IPs
  try {
    const eipsResponse = await ec2Client.send(new DescribeAddressesCommand({}));
    for (const eip of eipsResponse.Addresses || []) {
      const nameTag = eip.Tags?.find(t => t.Key === 'Name')?.Value || 'No Name';
      const authorized = isAuthorized(nameTag) || eip.Tags?.some(t => isAuthorized(t.Value || ''));
      const isOrphaned = !eip.AssociationId;

      resources.push({
        service: 'Elastic IP',
        resourceName: nameTag,
        idOrArn: eip.AllocationId || eip.PublicIp || '',
        status: eip.AssociationId ? 'ASSOCIATED' : 'UNASSOCIATED',
        projectAssociation: authorized ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
        alert: isOrphaned ? '⚠️ UNASSOCIATED EIP (INCURRING CHARGES)' : undefined,
      });
    }
  } catch (error) {
    console.log('  Elastic IPs: No resources or access denied');
  }

  return resources;
}

/**
 * Audit VPC NAT Gateways and Internet Gateways
 */
async function auditVPC(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  // NAT Gateways ($$$ ALERT)
  try {
    const natResponse = await ec2Client.send(new DescribeNatGatewaysCommand({}));
    for (const nat of natResponse.NatGateways || []) {
      const nameTag = nat.Tags?.find(t => t.Key === 'Name')?.Value || 'No Name';
      const authorized = isAuthorized(nameTag) || nat.Tags?.some(t => isAuthorized(t.Value || ''));

      resources.push({
        service: 'NAT Gateway',
        resourceName: nameTag,
        idOrArn: nat.NatGatewayId || '',
        status: nat.State || 'unknown',
        projectAssociation: authorized ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
        alert: nat.State === 'available' ? '💰 HIGH COST RESOURCE (~$32/month)' : undefined,
      });
    }
  } catch (error) {
    console.log('  NAT Gateways: No resources or access denied');
  }

  // Internet Gateways
  try {
    const igwResponse = await ec2Client.send(new DescribeInternetGatewaysCommand({}));
    for (const igw of igwResponse.InternetGateways || []) {
      const nameTag = igw.Tags?.find(t => t.Key === 'Name')?.Value || 'No Name';
      const authorized = isAuthorized(nameTag) || igw.Tags?.some(t => isAuthorized(t.Value || ''));
      const attachedVpc = igw.Attachments?.[0]?.VpcId || 'DETACHED';

      resources.push({
        service: 'Internet Gateway',
        resourceName: nameTag,
        idOrArn: igw.InternetGatewayId || '',
        status: attachedVpc === 'DETACHED' ? 'DETACHED' : `Attached: ${attachedVpc}`,
        projectAssociation: authorized ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  Internet Gateways: No resources or access denied');
  }

  // VPCs (for reference)
  try {
    const vpcResponse = await ec2Client.send(new DescribeVpcsCommand({}));
    for (const vpc of vpcResponse.Vpcs || []) {
      const nameTag = vpc.Tags?.find(t => t.Key === 'Name')?.Value || 'Default/Unnamed';
      const authorized = isAuthorized(nameTag) || vpc.Tags?.some(t => isAuthorized(t.Value || '')) || vpc.IsDefault;

      resources.push({
        service: 'VPC',
        resourceName: nameTag,
        idOrArn: vpc.VpcId || '',
        status: vpc.State || 'unknown',
        projectAssociation: authorized || vpc.IsDefault ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  VPCs: No resources or access denied');
  }

  return resources;
}

/**
 * Audit API Gateway (REST & HTTP APIs)
 */
async function auditAPIGateway(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  // REST APIs
  try {
    const restApisResponse = await apiGatewayClient.send(new GetRestApisCommand({}));
    for (const api of restApisResponse.items || []) {
      resources.push({
        service: 'API Gateway (REST)',
        resourceName: api.name || 'Unknown',
        idOrArn: api.id || '',
        status: api.createdDate ? 'ACTIVE' : 'UNKNOWN',
        projectAssociation: isAuthorized(api.name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  API Gateway REST: No resources or access denied');
  }

  // HTTP APIs (v2)
  try {
    const httpApisResponse = await apiGatewayV2Client.send(new GetApisCommand({}));
    for (const api of httpApisResponse.Items || []) {
      resources.push({
        service: 'API Gateway (HTTP)',
        resourceName: api.Name || 'Unknown',
        idOrArn: api.ApiId || '',
        status: api.ProtocolType || 'UNKNOWN',
        projectAssociation: isAuthorized(api.Name || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  API Gateway HTTP: No resources or access denied');
  }

  return resources;
}

/**
 * Audit CloudFormation Stacks
 */
async function auditCloudFormation(): Promise<ResourceEntry[]> {
  const resources: ResourceEntry[] = [];

  try {
    const stacksResponse = await cfnClient.send(new ListStacksCommand({
      StackStatusFilter: [
        'CREATE_COMPLETE', 'UPDATE_COMPLETE', 'ROLLBACK_COMPLETE',
        'CREATE_IN_PROGRESS', 'UPDATE_IN_PROGRESS', 'DELETE_IN_PROGRESS',
        'UPDATE_ROLLBACK_COMPLETE'
      ]
    }));

    for (const stack of stacksResponse.StackSummaries || []) {
      resources.push({
        service: 'CloudFormation Stack',
        resourceName: stack.StackName || 'Unknown',
        idOrArn: stack.StackId || '',
        status: stack.StackStatus || 'UNKNOWN',
        projectAssociation: isAuthorized(stack.StackName || '') ? 'AUTHORIZED' : 'SUSPECTED BLOAT',
      });
    }
  } catch (error) {
    console.log('  CloudFormation: No resources or access denied');
  }

  return resources;
}

/**
 * Print formatted table
 */
function printTable(resources: ResourceEntry[]): void {
  // Column widths
  const cols = {
    service: 22,
    name: 40,
    id: 45,
    status: 20,
    association: 18,
  };

  // Header
  console.log('┌' + '─'.repeat(cols.service) + '┬' + '─'.repeat(cols.name) + '┬' + '─'.repeat(cols.id) + '┬' + '─'.repeat(cols.status) + '┬' + '─'.repeat(cols.association) + '┐');
  console.log(
    '│' + ' Service'.padEnd(cols.service) +
    '│' + ' Resource Name'.padEnd(cols.name) +
    '│' + ' ID/ARN'.padEnd(cols.id) +
    '│' + ' Status'.padEnd(cols.status) +
    '│' + ' Project'.padEnd(cols.association) + '│'
  );
  console.log('├' + '─'.repeat(cols.service) + '┼' + '─'.repeat(cols.name) + '┼' + '─'.repeat(cols.id) + '┼' + '─'.repeat(cols.status) + '┼' + '─'.repeat(cols.association) + '┤');

  // Data rows
  for (const r of resources) {
    const service = (' ' + r.service).slice(0, cols.service).padEnd(cols.service);
    const name = (' ' + r.resourceName).slice(0, cols.name).padEnd(cols.name);
    const id = (' ' + r.idOrArn).slice(0, cols.id).padEnd(cols.id);
    const status = (' ' + r.status).slice(0, cols.status).padEnd(cols.status);
    const assoc = (' ' + r.projectAssociation).slice(0, cols.association).padEnd(cols.association);

    console.log(`│${service}│${name}│${id}│${status}│${assoc}│`);

    if (r.alert) {
      console.log(`│${''.padEnd(cols.service)}│ ${r.alert.padEnd(cols.name + cols.id + cols.status + cols.association + 2)}│`);
    }
  }

  console.log('└' + '─'.repeat(cols.service) + '┴' + '─'.repeat(cols.name) + '┴' + '─'.repeat(cols.id) + '┴' + '─'.repeat(cols.status) + '┴' + '─'.repeat(cols.association) + '┘');
}

/**
 * Main audit execution
 */
async function main(): Promise<void> {
  console.log('═'.repeat(150));
  console.log('AWS ABSOLUTE RESOURCE AUDIT v2 - READ ONLY');
  console.log('═'.repeat(150));
  console.log(`Account: ${CONFIG.AWS_ACCOUNT}`);
  console.log(`Region: ${CONFIG.AWS_REGION}`);
  console.log(`Profile: ${CONFIG.AWS_PROFILE}`);
  console.log(`Project Patterns: ${CONFIG.PROJECT_PATTERNS.join(', ')}`);
  console.log('STRICT EXCLUSION: IAM Roles, Users, Policies are NOT scanned');
  console.log('═'.repeat(150));

  const allResources: ResourceEntry[] = [];
  const alerts: ResourceEntry[] = [];

  // Run all audits
  console.log('\n[Scanning Services...]\n');

  console.log('  → Amplify...');
  const amplifyResources = await auditAmplify();
  allResources.push(...amplifyResources);

  console.log('  → Cognito...');
  const cognitoResources = await auditCognito();
  allResources.push(...cognitoResources);

  console.log('  → DynamoDB...');
  const dynamoResources = await auditDynamoDB();
  allResources.push(...dynamoResources);

  console.log('  → S3...');
  const s3Resources = await auditS3();
  allResources.push(...s3Resources);

  console.log('  → Secrets Manager...');
  const secretsResources = await auditSecretsManager();
  allResources.push(...secretsResources);

  console.log('  → Lambda...');
  const lambdaResources = await auditLambda();
  allResources.push(...lambdaResources);

  console.log('  → EC2...');
  const ec2Resources = await auditEC2();
  allResources.push(...ec2Resources);

  console.log('  → VPC (NAT Gateways, IGWs)...');
  const vpcResources = await auditVPC();
  allResources.push(...vpcResources);

  console.log('  → API Gateway...');
  const apiResources = await auditAPIGateway();
  allResources.push(...apiResources);

  console.log('  → CloudFormation...');
  const cfnResources = await auditCloudFormation();
  allResources.push(...cfnResources);

  // Collect alerts
  for (const r of allResources) {
    if (r.alert) {
      alerts.push(r);
    }
  }

  // Print main table
  console.log('\n' + '═'.repeat(150));
  console.log('RESOURCE INVENTORY');
  console.log('═'.repeat(150));
  printTable(allResources);

  // Summary statistics
  const authorized = allResources.filter(r => r.projectAssociation === 'AUTHORIZED').length;
  const bloat = allResources.filter(r => r.projectAssociation === 'SUSPECTED BLOAT').length;

  console.log('\n' + '═'.repeat(150));
  console.log('SUMMARY');
  console.log('═'.repeat(150));
  console.log(`  Total Resources Scanned: ${allResources.length}`);
  console.log(`  AUTHORIZED (BmDecor/CDKToolkit): ${authorized}`);
  console.log(`  SUSPECTED BLOAT: ${bloat}`);

  // Financial alerts
  if (alerts.length > 0) {
    console.log('\n' + '!'.repeat(150));
    console.log('FINANCIAL HIGH-ALERT');
    console.log('!'.repeat(150));
    for (const alert of alerts) {
      console.log(`  ${alert.service}: ${alert.resourceName}`);
      console.log(`    ${alert.alert}`);
      console.log(`    ID: ${alert.idOrArn}`);
      console.log('');
    }
  } else {
    console.log('\n  ✓ No financial alerts detected.');
  }

  // Bloat breakdown
  if (bloat > 0) {
    console.log('\n' + '─'.repeat(150));
    console.log('SUSPECTED BLOAT RESOURCES (Review Required)');
    console.log('─'.repeat(150));
    const bloatResources = allResources.filter(r => r.projectAssociation === 'SUSPECTED BLOAT');
    for (const r of bloatResources) {
      console.log(`  [${r.service}] ${r.resourceName} (${r.idOrArn})`);
    }
  }

  console.log('\n' + '═'.repeat(150));
  console.log('AUDIT COMPLETE - READ ONLY (No changes made)');
  console.log('═'.repeat(150));
}

// Run the audit
main().catch(console.error);
