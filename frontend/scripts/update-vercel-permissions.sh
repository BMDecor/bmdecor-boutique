#!/bin/sh
# Updates IAM policies for the Vercel deployment bot.
# Run once after the initial gen-keys setup, or whenever new AWS services are added.
#
# Services detected in codebase:
#   - DynamoDB          (lib/aws/dynamo-client.ts, 14+ API routes)
#   - Cognito IDP       (api/user/profile/route.ts — AdminDeleteUser)
#   - Secrets Manager   (lib/api/benjamin-moore.ts — BM API keys)

set -e

USER="vercel-boutique-bot"
PROFILE="bmdecor"

echo "=== Updating IAM policies for $USER ==="
echo ""

# 1. DynamoDB — core data access (confirm/re-attach)
echo "→ Attaching AmazonDynamoDBFullAccess..."
aws iam attach-user-policy \
  --user-name "$USER" \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess \
  --profile "$PROFILE" 2>/dev/null || true

# 2. Cognito — user auth, GDPR account deletion
echo "→ Attaching AmazonCognitoPowerUser..."
aws iam attach-user-policy \
  --user-name "$USER" \
  --policy-arn arn:aws:iam::aws:policy/AmazonCognitoPowerUser \
  --profile "$PROFILE" 2>/dev/null || true

# 3. Secrets Manager — Benjamin Moore API credentials
echo "→ Attaching SecretsManagerReadWrite..."
aws iam attach-user-policy \
  --user-name "$USER" \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
  --profile "$PROFILE" 2>/dev/null || true

echo ""
echo "=== Done. Policies attached to $USER ==="
echo ""
echo "Attached policies:"
aws iam list-attached-user-policies \
  --user-name "$USER" \
  --profile "$PROFILE" \
  --output table
