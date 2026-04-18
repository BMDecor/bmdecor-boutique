#!/usr/bin/env bash
# Farrow & Ball product-can imagery — point DynamoDB PRODUCT.imageUrl at S3.
#
# Before: fb-* products had imageUrl="/images/products/fb-*.jpg" (broken, no such files)
# After:  fb-* products point at S3-hosted Farrow & Ball "just tin" photography.
#
# Runs against account 450284264313, eu-west-1, table BmDecorProducts, via the
# bmdecor SSO profile. Requires `aws sso login --profile bmdecor` first.
#
# Safe to re-run — every update is idempotent (same key, same value).
#
# Follow-up: fb-modern-emulsion currently reuses the estate-emulsion asset
# (matte tins look identical to the customer). Replace with real modern-emulsion
# photography when a client asset lands.
#
# Little Greene products (lg-absolute-matt, lg-intelligent-matt,
# lg-intelligent-satin) are NOT updated here — LG assets weren't part of the
# client's drop. Tracked separately.

set -euo pipefail

PROFILE=bmdecor
TABLE=BmDecorProducts
BASE="https://bmdecor-images.s3.eu-west-1.amazonaws.com"

declare -A M=(
  [fb-estate-eggshell]='brands/farrow-ball/cans/estate-eggshell/All%20White%202005%202.5l%20%28EEgg%29.jpg'
  [fb-estate-emulsion]='brands/farrow-ball/cans/estate-emulsion/Bamboozle%20No.304%20EEM%205L_just%20tin.jpg'
  [fb-exterior-masonry]='brands/farrow-ball/cans/exterior-masonry/Beverly%20No.310%20EXM%205L_just%20tin.jpg'
  [fb-full-gloss]='brands/farrow-ball/cans/full-gloss/Kittiwake%20No.307%20FG%202.5L_just%20tin.jpg'
  [fb-modern-emulsion]='brands/farrow-ball/cans/estate-emulsion/Bamboozle%20No.304%20EEM%205L_just%20tin.jpg'
)

for product in "${!M[@]}"; do
  url="${BASE}/${M[$product]}"
  aws --profile "$PROFILE" dynamodb update-item \
    --table-name "$TABLE" \
    --key "{\"PK\":{\"S\":\"PRODUCT#CAN#${product}\"},\"SK\":{\"S\":\"METADATA\"}}" \
    --update-expression 'SET imageUrl = :u' \
    --expression-attribute-values "{\":u\":{\"S\":\"${url}\"}}" \
    --return-values NONE >/dev/null
  echo "updated ${product}"
done
