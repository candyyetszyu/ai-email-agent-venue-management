#!/bin/bash

# 🚀 Complete Email Agent Setup Script
# This script guides you through GitHub setup and Cloudflare deployment

set -e

echo "🎉 Welcome to Email Agent Complete Setup!"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
    print_error "Please run this script from the Email Agent project root directory"
    exit 1
fi

print_step "Starting complete project setup..."

# Step 1: Git Setup
print_step "Setting up Git repository..."
if [[ ! -d ".git" ]]; then
    git init
    git add .
    git commit -m "feat: AI-powered email agent for venue management - complete setup"
    print_step "Git repository initialized"
else
    print_warning "Git repository already exists"
fi

# Step 2: GitHub Repository Creation
print_step "Creating GitHub repository..."
echo "Choose an option:"
echo "1. Create repository using GitHub CLI (recommended)"
echo "2. Manual repository creation"
echo "3. Skip GitHub setup"

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        if command -v gh &> /dev/null; then
            read -p "Enter repository name (default: email-agent-venue-management): " repo_name
            repo_name=${repo_name:-email-agent-venue-management}
            
            read -p "Make repository private? (y/n, default: y): " private_repo
            private_flag="--private"
            if [[ $private_repo == "n" ]]; then
                private_flag="--public"
            fi
            
            gh repo create "$repo_name" $private_flag --description "AI-powered email agent for venue management with Gmail/Outlook integration"
            git remote add origin "https://github.com/$(gh auth status 2>&1 | grep 'Logged in to github.com as' | cut -d' ' -f7)/$repo_name.git"
            git branch -M main
            git push -u origin main
            print_step "GitHub repository created and code pushed"
        else
            print_warning "GitHub CLI not found. Installing..."
            brew install gh || echo "Please install GitHub CLI manually: https://cli.github.com/"
        fi
        ;;
    2)
        echo "Manual setup instructions:"
        echo "1. Go to https://github.com/new"
        echo "2. Create repository: email-agent-venue-management"
        echo "3. Follow the instructions to push existing code"
        echo "4. Run: git remote add origin YOUR_REPO_URL"
        echo "5. Run: git push -u origin main"
        ;;
    3)
        print_warning "Skipping GitHub setup"
        ;;
esac

# Step 3: Cloudflare Setup
print_step "Setting up Cloudflare deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_step "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    print_step "Logging in to Cloudflare..."
    wrangler login
fi

# Step 4: Create KV Namespace
print_step "Creating KV namespace for sessions..."
if ! wrangler kv:namespace list | grep -q "SESSIONS"; then
    wrangler kv:namespace create SESSIONS --env production
    print_step "KV namespace created"
else
    print_warning "KV namespace already exists"
fi

# Step 5: Environment Configuration
print_step "Environment configuration..."
echo ""
echo "⚙️  Please set your environment variables:"
echo ""
echo "Run these commands to set your secrets:"
echo ""
echo "cd backend"
echo "wrangler secret put GOOGLE_CLIENT_ID --env production"
echo "wrangler secret put GOOGLE_CLIENT_SECRET --env production"
echo "wrangler secret put MICROSOFT_CLIENT_ID --env production"
echo "wrangler secret put MICROSOFT_CLIENT_SECRET --env production"
echo "wrangler secret put OPENROUTE_API_KEY --env production"
echo "wrangler secret put JWT_SECRET --env production"
echo "wrangler secret put FRONTEND_URL --env production"
echo ""

# Step 6: Build and Test
print_step "Building and testing..."

# Backend build test
cd backend
npm install
print_step "Backend dependencies installed"

cd ../frontend
npm install
npm run build
print_step "Frontend built successfully"

cd ..

# Step 7: Final Instructions
print_step "Setup Complete! 🎉"
echo ""
echo "📋 Final Steps:"
echo "1. Set your environment variables using the commands above"
echo "2. Update OAuth redirect URIs in Google/Microsoft consoles"
echo "3. Run: ./deploy-cloudflare.sh"
echo "4. Test your deployed application"
echo ""
echo "🔗 URLs after deployment:"
echo "   Frontend: https://email-agent-frontend.pages.dev"
echo "   Backend: https://email-agent-backend.your-subdomain.workers.dev"
echo ""
echo "📖 Documentation:"
echo "   - GITHUB_SETUP.md: Detailed GitHub setup"
echo "   - DEPLOYMENT_CHECKLIST.md: Complete deployment guide"
echo "   - README.md: Project overview"
echo ""
echo "Happy deploying! 🚀"

# Make the deployment script executable
chmod +x deploy-cloudflare.sh
chmod +x setup-complete.sh

print_step "All scripts are now executable"