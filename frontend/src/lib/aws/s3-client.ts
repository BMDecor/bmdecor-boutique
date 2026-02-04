import { S3Client } from '@aws-sdk/client-s3';

const REGION = process.env.BMDECOR_AWS_REGION || process.env.AWS_REGION || 'eu-west-1';

function getCredentials() {
  const accessKeyId = process.env.BMDECOR_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BMDECOR_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fromIni } = require('@aws-sdk/credential-providers');
    const provider = fromIni({ profile: 'bmdecor' });
    return async () => {
      try { return await provider(); } catch {
        console.warn('Running without AWS credentials.');
        return { accessKeyId: '', secretAccessKey: '' };
      }
    };
  } catch {
    return undefined;
  }
}

export const s3Client = new S3Client({
  region: REGION,
  credentials: getCredentials(),
});

export const BUCKET_NAME = process.env.BMDECOR_S3_BUCKET || process.env.S3_BUCKET || 'bmdecor-images';
