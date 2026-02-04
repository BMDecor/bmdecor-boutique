#!/bin/bash
# Setup Vercel environment variables for BM Decoracion
# Run this script from the frontend directory after Vercel CLI is installed

echo "Setting NEXT_PUBLIC_BASE_URL for all environments..."

# Production
vercel env add NEXT_PUBLIC_BASE_URL production <<< "https://frontend-five-beige-41.vercel.app"

# Preview
vercel env add NEXT_PUBLIC_BASE_URL preview <<< "https://frontend-five-beige-41.vercel.app"

# Development
vercel env add NEXT_PUBLIC_BASE_URL development <<< "http://localhost:3000"

echo "Done! Environment variables set for production, preview, and development."
echo "Redeploy to apply: vercel --prod"
