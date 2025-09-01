#!/bin/bash

echo "🚀 Deploying AI Email Agent Frontend to Cloudflare Pages..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
npx wrangler pages deploy build --project-name=ai-email-agent-frontend

echo "✅ Frontend deployment completed!"
echo "🌍 Your frontend should be available at: https://ai-email-agent-frontend.pages.dev"
