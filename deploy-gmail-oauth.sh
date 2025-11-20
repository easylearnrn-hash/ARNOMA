#!/bin/bash

# Gmail OAuth Edge Functions Deployment Script
# Run this after setting Supabase secrets

set -e

echo "🚀 Deploying Gmail OAuth Edge Functions..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "📋 Checking Supabase link..."
supabase link --project-ref zlvnxvrzotamhpezqedr || {
    echo "❌ Not linked to Supabase project"
    echo "   Run: supabase login && supabase link --project-ref zlvnxvrzotamhpezqedr"
    exit 1
}

echo ""
echo "🔑 Make sure you've set these secrets:"
echo "   supabase secrets set GMAIL_CLIENT_ID=\"your-client-id\""
echo "   supabase secrets set GMAIL_CLIENT_SECRET=\"your-client-secret\""
echo ""
read -p "Have you set the secrets? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please set secrets first, then run this script again"
    exit 1
fi

echo ""
echo "📦 Deploying gmail-oauth-callback..."
supabase functions deploy gmail-oauth-callback

echo ""
echo "📦 Deploying gmail-get-token..."
supabase functions deploy gmail-get-token

echo ""
echo "📦 Deploying gmail-refresh-token..."
supabase functions deploy gmail-refresh-token

echo ""
echo "✅ All Edge Functions deployed successfully!"
echo ""
echo "⚠️  IMPORTANT: Add this redirect URI to Google Cloud Console:"
echo "   https://zlvnxvrzotamhpezqedr.supabase.co/functions/v1/gmail-oauth-callback"
echo ""
echo "📖 See GMAIL_OAUTH_DEPLOYMENT_GUIDE.md for testing instructions"
