#!/bin/sh
# Creates a dedicated IAM user for Vercel with DynamoDB access.
# Run once, then paste the output keys into Vercel Environment Variables.

set -e

echo "=== Creating IAM user: vercel-boutique-bot ==="
aws iam create-user \
  --user-name vercel-boutique-bot \
  --profile bmdecor

echo ""
echo "=== Attaching DynamoDB Full Access policy ==="
aws iam attach-user-policy \
  --user-name vercel-boutique-bot \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess \
  --profile bmdecor

echo ""
echo "=== Generating access keys ==="
aws iam create-access-key \
  --user-name vercel-boutique-bot \
  --profile bmdecor

echo ""
echo "=== Done. Paste the AccessKeyId and SecretAccessKey into Vercel. ==="
