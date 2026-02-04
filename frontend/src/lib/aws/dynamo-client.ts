import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Use BMDECOR_-prefixed env vars to avoid Vercel/Lambda runtime overrides,
// then fall back to standard AWS_ names for local dev.
const REGION = process.env.BMDECOR_AWS_REGION || process.env.AWS_REGION || 'eu-west-1';

function getCredentials() {
  // Vercel / production: use BMDECOR_-prefixed environment variables
  const accessKeyId = process.env.BMDECOR_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BMDECOR_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
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

export const TABLE_NAME = process.env.BMDECOR_DYNAMODB_TABLE || process.env.DYNAMODB_TABLE || 'BmDecorProducts';
