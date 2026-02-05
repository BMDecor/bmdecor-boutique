#!/usr/bin/env node
/**
 * BM Decoración - S3 Asset Bucket Provisioning
 *
 * Creates a dedicated S3 bucket for the project with:
 * - CORS policy for PUT uploads
 * - Public read policy for serving images
 *
 * Usage: node scripts/provision-s3.js
 */

const {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-providers');

const REGION = process.env.AWS_REGION || 'eu-west-1';
const BUCKET_BASE = 'bmdecor-assets';

async function getClient() {
  // Try environment variables first
  const accessKeyId = process.env.BMDECOR_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BMDECOR_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return new S3Client({
      region: REGION,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  // Fall back to profile
  return new S3Client({
    region: REGION,
    credentials: fromIni({ profile: 'bmdecor' }),
  });
}

async function bucketExists(client, bucketName) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    // Bucket exists but we don't have access, or other error
    throw err;
  }
}

function generateSuffix() {
  return Math.random().toString(36).substring(2, 8);
}

async function createBucket(client, bucketName) {
  const params = {
    Bucket: bucketName,
    // For eu-west-1, we need LocationConstraint
    CreateBucketConfiguration: {
      LocationConstraint: REGION,
    },
  };

  // us-east-1 doesn't use LocationConstraint
  if (REGION === 'us-east-1') {
    delete params.CreateBucketConfiguration;
  }

  await client.send(new CreateBucketCommand(params));
  console.log(`✓ Bucket created: ${bucketName}`);
}

async function applyCorsPolicy(client, bucketName) {
  const corsConfig = {
    CORSRules: [
      {
        AllowedOrigins: ['*'], // Allow from Vercel, localhost, and any deployment
        AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3600,
      },
    ],
  };

  await client.send(new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: corsConfig,
  }));
  console.log('✓ CORS policy applied');
}

async function applyPublicReadPolicy(client, bucketName) {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`,
      },
    ],
  };

  await client.send(new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(policy),
  }));
  console.log('✓ Public read policy applied');
}

async function main() {
  console.log('🎨 BM Decoración S3 Asset Bucket Provisioning\n');
  console.log(`Region: ${REGION}`);
  console.log(`Target bucket base: ${BUCKET_BASE}\n`);

  const client = await getClient();
  let bucketName = BUCKET_BASE;

  // Check if base bucket name is available
  const baseExists = await bucketExists(client, bucketName);

  if (baseExists) {
    console.log(`ℹ Bucket "${bucketName}" already exists.`);
    console.log('  Checking if we own it...\n');

    // If we can access it, it's ours - just ensure policies are set
    try {
      await applyCorsPolicy(client, bucketName);
      await applyPublicReadPolicy(client, bucketName);
      console.log('\n✅ Existing bucket configured successfully!');
      console.log(`\nBucket: ${bucketName}`);
      console.log(`\nAdd to your .env file:`);
      console.log(`BMDECOR_S3_BUCKET=${bucketName}`);
      return;
    } catch (err) {
      // Don't have access, need a different name
      console.log('  Bucket exists but is owned by another account.');
      bucketName = `${BUCKET_BASE}-${generateSuffix()}`;
      console.log(`  Trying: ${bucketName}\n`);
    }
  }

  // Try to create the bucket (with suffix if needed)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await createBucket(client, bucketName);
      break;
    } catch (err) {
      if (err.name === 'BucketAlreadyExists' || err.name === 'BucketAlreadyOwnedByYou') {
        bucketName = `${BUCKET_BASE}-${generateSuffix()}`;
        attempts++;
        console.log(`  Name taken, trying: ${bucketName}`);
      } else {
        throw err;
      }
    }
  }

  // Apply CORS and public read policies
  await applyCorsPolicy(client, bucketName);
  await applyPublicReadPolicy(client, bucketName);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Bucket provisioned successfully!');
  console.log('='.repeat(50));
  console.log(`\nBucket Name: ${bucketName}`);
  console.log(`Region: ${REGION}`);
  console.log(`Public URL: https://${bucketName}.s3.${REGION}.amazonaws.com/`);
  console.log('\n📝 Add this to your .env file:');
  console.log(`BMDECOR_S3_BUCKET=${bucketName}`);
  console.log('\n💡 Folder structure:');
  console.log('  /journal  - Article featured images');
  console.log('  /heroes   - Hero banners and homepage images');
  console.log('  /branding - Brand logos and assets');
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
