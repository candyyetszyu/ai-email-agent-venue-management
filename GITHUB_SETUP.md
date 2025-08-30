# GitHub Setup & Cloudflare Deployment Guide

## 📋 Project Audit Summary

### ✅ Project Structure - Complete
Your AI-powered email agent project has a comprehensive structure:

**Backend (`/backend/`)**
- ✅ RESTful API with Express.js
- ✅ Google/Microsoft OAuth authentication
- ✅ Gmail & Outlook integration
- ✅ Google Calendar API
- ✅ AI integration (OpenRoute/OpenAI)
- ✅ Security middleware & JWT tokens
- ✅ Cloudflare Workers ready (`wrangler.toml`)

**Frontend (`/frontend/`)**
- ✅ React 18 with Material-UI
- ✅ Context-based state management
- ✅ Responsive design
- ✅ OAuth integration
- ✅ Build optimized for Cloudflare Pages

**Documentation**
- ✅ Comprehensive README.md
- ✅ API documentation
- ✅ Architecture docs
- ✅ Security best practices
- ✅ Deployment guides

## 🚀 GitHub Setup Instructions

### 1. Initialize Git Repository
```bash
cd "/Users/judyyip/Downloads/Email Agent"
git init
git add .
git commit -m "Initial commit: AI-powered email agent for venue management"
```

### 2. Create GitHub Repository

#### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
brew install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create email-agent-venue-management --private --description "AI-powered email agent for venue management with Gmail/Outlook integration" --source=.
git push origin main
```

#### Option B: Using GitHub Web Interface
1. Go to https://github.com/new
2. Create new repository: `email-agent-venue-management`
3. Don't initialize with README (you already have one)
4. Follow the instructions to push existing repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/email-agent-venue-management.git
git branch -M main
git push -u origin main
```

### 3. Set Repository Secrets for GitHub Actions

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Required Secrets
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
OPENROUTE_API_KEY=your_openroute_api_key
JWT_SECRET=your_jwt_secret_key
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

#### Optional Secrets
```
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

## 🌍 Cloudflare Deployment

### Prerequisites
1. Cloudflare account (https://dash.cloudflare.com/sign-up)
2. Wrangler CLI installed
3. Domain (optional, for custom domain)

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Configure Environment Variables

#### Backend Configuration (`backend/wrangler.toml`)
```toml
name = "email-agent-backend"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production.vars]
NODE_ENV = "production"
FRONTEND_URL = "https://your-domain.pages.dev"
GOOGLE_CALLBACK_URL = "https://email-agent-backend.your-subdomain.workers.dev/api/auth/google/callback"
MICROSOFT_CALLBACK_URL = "https://email-agent-backend.your-subdomain.workers.dev/api/auth/microsoft/callback"

# Add your secrets via wrangler secrets
# wrangler secret put GOOGLE_CLIENT_ID --env production
# wrangler secret put GOOGLE_CLIENT_SECRET --env production
# ... and so on for all secrets
```

### 4. Deploy Using Provided Script

The `deploy-cloudflare.sh` script is ready to use:

```bash
# Make script executable
chmod +x deploy-cloudflare.sh

# Run deployment
./deploy-cloudflare.sh
```

### 5. Manual Deployment Steps

#### Backend (Cloudflare Workers)
```bash
cd backend
npm install
wrangler deploy
```

#### Frontend (Cloudflare Pages)
```bash
cd frontend
npm install
npm run build

# Deploy to Pages
wrangler pages deploy build --project-name=email-agent-frontend
```

### 6. Update OAuth Redirect URIs

After deployment, update your OAuth apps:

#### Google OAuth Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://email-agent-backend.your-subdomain.workers.dev/api/auth/google/callback`

#### Microsoft Azure Portal
1. Go to https://portal.azure.com → Azure Active Directory → App registrations
2. Add redirect URIs:
   - `https://email-agent-backend.your-subdomain.workers.dev/api/auth/microsoft/callback`

## 🔧 Post-Deployment Checklist

### Backend Health Check
```bash
curl https://email-agent-backend.your-subdomain.workers.dev/api/health
```

### Frontend Testing
Visit your deployed frontend URL and test:
- [ ] OAuth login with Google
- [ ] OAuth login with Microsoft
- [ ] Email fetching
- [ ] AI response generation
- [ ] Calendar integration

### Environment Variables Verification
Run these commands to verify secrets are set:

```bash
# Check backend secrets
cd backend
wrangler secret list

# Check frontend environment
# Ensure your frontend build includes the correct API URLs
```

## 📊 Monitoring & Analytics

### Cloudflare Analytics
- Visit Cloudflare Dashboard → Analytics for performance metrics
- Set up alerts for error rates

### Application Monitoring
Add these to your backend:
```bash
wrangler secret put SENTRY_DSN --env production  # For error tracking
wrangler secret put LOG_LEVEL --env production   # Set to 'info' or 'error'
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for automatic deployment:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Backend
        run: |
          cd backend
          npm install
          wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          wrangler pages deploy build --project-name=email-agent-frontend
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` matches your deployed frontend
2. **OAuth Redirect Mismatch**: Verify redirect URIs in OAuth consoles
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Verify all secrets are set via `wrangler secret`

### Debug Commands
```bash
# Check wrangler logs
wrangler tail --env production

# Test locally
wrangler dev

# Verify secrets
wrangler secret list --env production
```

## 📞 Support

- **Cloudflare Docs**: https://developers.cloudflare.com
- **GitHub Issues**: Create issues in your repository
- **Community**: Cloudflare Discord and GitHub Discussions

---

**Ready to deploy?** Start with:
1. `git init && git add . && git commit -m "Initial commit"`
2. Create GitHub repository
3. Run `./deploy-cloudflare.sh`