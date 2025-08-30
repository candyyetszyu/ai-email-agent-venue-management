# Deployment Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- MongoDB (if using database persistence)
- Google Cloud Platform account with API credentials
- Microsoft Azure account with API credentials
- OpenAI API key
- Domain name (optional, for production deployment)

## Deployment Options

This guide covers four deployment options:

1. **Manual Deployment**: Traditional server setup
2. **Docker Deployment**: Containerized deployment
3. **Cloud Platform Deployment**: Using services like Heroku, AWS, or Google Cloud
4. **Cloudflare Deployment**: Using Cloudflare Workers and Pages (recommended for performance and cost)

## Environment Configuration

Before deploying, ensure you have configured all necessary environment variables:

1. Create a `.env` file in the backend directory based on `.env.example`
2. Set all required variables with production values
3. Ensure you're using secure, unique values for secrets and keys

## Manual Deployment

### Backend Deployment

1. Clone the repository on your server:
   ```bash
   git clone <repository-url>
   cd Email-Agent
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install --production
   ```

3. Create and configure your `.env` file with production values

4. Start the server:
   ```bash
   # Using Node directly
   node server.js
   
   # Using PM2 (recommended for production)
   npm install -g pm2
   pm2 start server.js --name email-agent-backend
   ```

### Frontend Deployment

1. Build the frontend for production:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

2. The build process creates a `build` directory with optimized static files

3. These files can be served by:
   - The Express backend (already configured in `server.js`)
   - A dedicated web server like Nginx or Apache
   - A static file hosting service

### Nginx Configuration (Optional)

If using Nginx to serve the frontend and proxy API requests:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/Email-Agent/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Deployment

### Using Docker Compose

1. Create a `docker-compose.yml` file in the project root:

```yaml
version: '3'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      # Add all other environment variables here
    restart: always

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: always
```

2. Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

3. Create a `Dockerfile` in the frontend directory:

```dockerfile
# Build stage
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

4. Create an `nginx.conf` file in the frontend directory:

```
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. Build and run the containers:
```

## Cloudflare Deployment (Recommended)

Cloudflare deployment offers excellent performance, global CDN, and generous free tier. This setup uses Cloudflare Workers for the backend API and Cloudflare Pages for the frontend.

### Prerequisites for Cloudflare Deployment

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Cloudflare Workers**: Enable in your Cloudflare dashboard
3. **Cloudflare Pages**: Enable in your Cloudflare dashboard
4. **Wrangler CLI**: Install globally with `npm install -g wrangler`
5. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

### Backend Deployment with Cloudflare Workers

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Create Wrangler Configuration**:
   Create `wrangler.toml` in the backend directory:
   ```toml
   name = "email-agent-backend"
   main = "server.js"
   compatibility_date = "2024-01-01"
   
   [env.production]
   name = "email-agent-backend-prod"
   
   [build]
   command = "npm install"
   
   [[env.production.vars]]
   NODE_ENV = "production"
   PORT = "8080"
   
   # Add your environment variables here
   # MONGODB_URI = "your-mongodb-uri"
   # JWT_SECRET = "your-jwt-secret"
   # GOOGLE_CLIENT_ID = "your-google-client-id"
   # etc.
   ```

3. **Modify Backend for Cloudflare Workers**:
   Create `backend/worker.js` for Cloudflare Workers compatibility:
   ```javascript
   import { handle } from 'h3'
   import app from './server.js'
   
   export default {
     async fetch(request, env, ctx) {
       // Set environment variables from Cloudflare
       Object.keys(env).forEach(key => {
         process.env[key] = env[key]
       })
       
       return handle(app)(request)
     }
   }
   ```

4. **Deploy Backend**:
   ```bash
   cd backend
   wrangler login
   wrangler deploy
   ```

### Frontend Deployment with Cloudflare Pages

1. **Prepare Frontend for Production**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Create Pages Configuration**:
   Create `frontend/_redirects` file:
   ```
   /api/* https://email-agent-backend.your-subdomain.workers.dev/:splat 200
   /* /index.html 200
   ```

3. **Deploy via Git Integration**:
   - Go to [Cloudflare Pages dashboard](https://dash.cloudflare.com/pages)
   - Click "Create a project"
   - Connect your Git repository
   - Configure build settings:
     - Build command: `npm run build`
     - Build output directory: `build`
     - Root directory: `frontend`

4. **Set Environment Variables**:
   In Cloudflare Pages dashboard:
   - Go to your project settings
   - Navigate to "Environment variables"
   - Add your production environment variables

### Environment Variables for Cloudflare

**For Cloudflare Workers (Backend)**:
- `NODE_ENV`: `production`
- `JWT_SECRET`: Your JWT secret key
- `MONGODB_URI`: MongoDB connection string (use MongoDB Atlas)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `MICROSOFT_CLIENT_ID`: Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key
- `REDIRECT_URI`: `https://your-domain.pages.dev/auth/callback`

**For Cloudflare Pages (Frontend)**:
- `REACT_APP_API_URL`: `https://email-agent-backend.your-subdomain.workers.dev`
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID for frontend

### Custom Domain Setup

1. **Add Custom Domain to Pages**:
   - In Cloudflare Pages dashboard
   - Go to your project settings
   - Click "Custom domains"
   - Add your domain

2. **Update OAuth Redirect URIs**:
   - Update Google OAuth redirect URI in Google Cloud Console
   - Update Microsoft OAuth redirect URI in Azure Portal
   - Use your custom domain: `https://yourdomain.com/auth/callback`

### Advanced Cloudflare Features

#### KV Storage for Session Management

1. **Create KV Namespace**:
   ```bash
   wrangler kv:namespace create SESSIONS
   wrangler kv:namespace create SESSIONS --preview
   ```

2. **Update wrangler.toml**:
   ```toml
   [[kv_namespaces]]
   binding = "SESSIONS"
   id = "your-kv-namespace-id"
   preview_id = "your-preview-kv-namespace-id"
   ```

#### D1 Database (Alternative to MongoDB)

1. **Create D1 Database**:
   ```bash
   wrangler d1 create email-agent-db
   ```

2. **Update wrangler.toml**:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "email-agent-db"
   database_id = "your-database-id"
   ```

#### R2 Storage for File Uploads

1. **Create R2 Bucket**:
   ```bash
   wrangler r2 bucket create email-agent-files
   ```

2. **Update wrangler.toml**:
   ```toml
   [[r2_buckets]]
   binding = "FILES"
   bucket_name = "email-agent-files"
   ```

### Monitoring and Analytics

1. **Enable Cloudflare Analytics**:
   - Go to Cloudflare dashboard
   - Navigate to "Analytics" for both Workers and Pages
   - Monitor performance, errors, and usage

2. **Set Up Alerts**:
   - Configure email notifications for errors
   - Set up usage alerts for API limits

### Cost Considerations

**Cloudflare Free Tier**:
- 100,000 requests/day for Workers
- 500 build minutes/month for Pages
- Unlimited bandwidth on CDN
- 1 GB KV storage
- 100 MB D1 database

**Estimated Monthly Cost**: $0 for most small to medium applications

### Troubleshooting Common Issues

1. **CORS Issues**: Ensure proper CORS configuration in your backend
2. **Environment Variables**: Double-check all environment variables are set
3. **OAuth Redirects**: Verify redirect URIs match your deployment URLs
4. **Database Connections**: Use MongoDB Atlas for external database access
5. **Build Failures**: Check build logs in Cloudflare Pages dashboard

### Quick Start Script

Create `deploy-cloudflare.sh` for easy deployment:

```bash
#!/bin/bash

echo "Deploying Email Agent to Cloudflare..."

# Backend deployment
echo "Deploying backend to Cloudflare Workers..."
cd backend
wrangler deploy

# Frontend deployment
echo "Building frontend..."
cd ../frontend
npm run build

# Trigger Pages deployment via git
git add .
git commit -m "Deploy to Cloudflare"
git push origin main

echo "Deployment complete! Check Cloudflare dashboard for status."
```

Make it executable:
```bash
chmod +x deploy-cloudflare.sh
```bash
docker-compose up -d
```

## Cloud Platform Deployment

### Heroku Deployment

1. Create a `Procfile` in the backend directory:
   ```
   web: node server.js
   ```

2. Initialize Git repositories in both frontend and backend directories

3. Create two Heroku apps (one for frontend, one for backend):
   ```bash
   # Backend
   cd backend
   heroku create email-agent-backend
   heroku config:set NODE_ENV=production
   # Set all other environment variables
   git push heroku main
   
   # Frontend
   cd ../frontend
   heroku create email-agent-frontend
   heroku config:set REACT_APP_API_URL=https://email-agent-backend.herokuapp.com/api
   npm run build
   # Use a buildpack for React apps
   heroku buildpacks:set mars/create-react-app
   git push heroku main
   ```

### AWS Elastic Beanstalk

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB in the project root:
   ```bash
   eb init
   ```

3. Follow the prompts to configure your application

4. Create an environment and deploy:
   ```bash
   eb create email-agent-production
   ```

5. Configure environment variables through the AWS Console

## Security Considerations

### HTTPS Configuration

Always use HTTPS in production. You can:

1. Use a service like Let's Encrypt for free SSL certificates
2. Configure SSL in Nginx or your web server
3. Use a load balancer with SSL termination

### API Keys and Secrets

1. Never commit sensitive information to your repository
2. Use environment variables for all secrets
3. Rotate keys and secrets regularly
4. Use a secrets management service for production

### OAuth Configuration

1. Update OAuth redirect URIs to match your production domain
2. Use separate OAuth credentials for development and production
3. Restrict OAuth scopes to only what's necessary

## Monitoring and Maintenance

### Logging

Implement a logging solution:

1. Use a service like Loggly, Papertrail, or CloudWatch
2. Log important events and errors
3. Set up alerts for critical issues

### Performance Monitoring

1. Use a service like New Relic, Datadog, or Prometheus
2. Monitor API response times and error rates
3. Set up alerts for performance degradation

### Backup Strategy

If using a database:

1. Set up regular automated backups
2. Test backup restoration periodically
3. Store backups in a secure, separate location

## Scaling Considerations

### Horizontal Scaling

1. Use a load balancer to distribute traffic
2. Deploy multiple instances of the backend
3. Use a CDN for static frontend assets

### Vertical Scaling

1. Increase server resources as needed
2. Monitor resource usage to anticipate scaling needs

### Database Scaling

If using a database:

1. Implement connection pooling
2. Consider read replicas for high-traffic applications
3. Implement caching for frequently accessed data

## Troubleshooting

### Common Deployment Issues

1. **CORS Errors**: Ensure CORS configuration matches your production domains
2. **OAuth Errors**: Verify redirect URIs are correctly configured
3. **Environment Variables**: Check all required variables are set
4. **API Rate Limits**: Implement retry logic and caching

### Debugging Production Issues

1. Check server logs for errors
2. Use monitoring tools to identify performance bottlenecks
3. Implement feature flags for risky changes

## Continuous Integration/Deployment

Consider setting up CI/CD pipelines using:

1. GitHub Actions
2. Jenkins
3. CircleCI
4. GitLab CI

A basic CI/CD pipeline should:

1. Run tests on every pull request
2. Build the application
3. Deploy to staging for verification
4. Deploy to production after approval