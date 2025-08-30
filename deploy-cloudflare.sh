#!/bin/bash

# Email Agent Cloudflare Deployment Script
# This script helps deploy the Email Agent application to Cloudflare

echo "🚀 Starting Email Agent deployment to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    wrangler login
fi

# Backend deployment
echo "📦 Deploying backend to Cloudflare Workers..."
cd backend

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install

# Deploy backend
echo "🚀 Deploying backend..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
else
    echo "❌ Backend deployment failed. Check the error above."
    exit 1
fi

cd ..

# Frontend deployment
echo "🎨 Preparing frontend for deployment..."
cd frontend

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
else
    echo "❌ Frontend build failed. Check the error above."
    exit 1
fi

# Create _redirects file if it doesn't exist
if [ ! -f "_redirects" ]; then
    echo "📝 Creating _redirects file..."
    cat > _redirects << 'EOF'
/api/* https://email-agent-backend.your-subdomain.workers.dev/:splat 200
/* /index.html 200
EOF
fi

cd ..

# Git operations for Pages deployment
echo "📤 Triggering Pages deployment..."
git add .
git commit -m "Deploy to Cloudflare - $(date)" || echo "No changes to commit"
git push origin main

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Check Cloudflare dashboard for deployment status"
echo "2. Update your OAuth redirect URIs in Google and Microsoft consoles"
echo "3. Set environment variables in Cloudflare dashboard"
echo "4. Test your deployed application"
echo ""
echo "🔗 Your application will be available at:"
echo "   Frontend: https://your-project.pages.dev"
echo "   Backend API: https://email-agent-backend.your-subdomain.workers.dev"