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
  // fromIni returns a lazy provider — it won't throw until credentials are
  // actually resolved. Wrap it so resolution errors are caught and surfaced
  // as a warning instead of crashing the build.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fromIni } = require('@aws-sdk/credential-providers');
    const provider = fromIni({ profile: 'bmdecor' });

    // Return a wrapper that catches resolution errors
    return async () => {
      try {
        return await provider();
      } catch {
        console.warn('Running without AWS credentials. Data will be empty.');
        return { accessKeyId: '', secretAccessKey: '' };
      }
    };
  } catch {
    console.warn('Running without AWS credentials. Data will be empty.');
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
