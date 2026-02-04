import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'eu-west-1';

function getCredentials() {
  // Vercel / production: use environment variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  // Local development: use AWS profile
  try {
    // Dynamic import to avoid bundling @aws-sdk/credential-providers in production
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fromIni } = require('@aws-sdk/credential-providers');
    return fromIni({ profile: 'bmdecor' });
  } catch (err) {
    console.warn('AWS credentials: No env vars and fromIni failed. Falling back to default chain.', err);
    return undefined;
  }
}

export const ddbClient = new DynamoDBClient({
  region: REGION,
  credentials: getCredentials(),
});

export const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'BmDecorProducts';
