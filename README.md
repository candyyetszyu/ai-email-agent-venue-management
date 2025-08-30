# AI-Powered Email Agent for Venue Management

A comprehensive email automation system that uses AI to analyze booking inquiries and generate intelligent responses for venue management businesses. The system integrates with Gmail, Outlook, and Google Calendar to provide seamless email handling and venue availability checking.

## 🚀 Features

### Core Functionality
- **AI-Powered Email Analysis**: Automatically analyzes incoming emails for booking inquiries
- **Bilingual Support**: Handles emails in both English and Chinese with intelligent language detection
- **Smart Response Generation**: Creates personalized, context-aware responses
- **Venue Availability Integration**: Checks Google Calendar for real-time availability
- **Multi-Provider Support**: Works with both Gmail and Outlook email accounts
- **Batch Processing**: Process multiple emails simultaneously
- **Attachment Support**: Handle email attachments including downloads

### User Interface
- **Modern React Dashboard**: Clean, intuitive interface for managing emails
- **Real-time Statistics**: Track email processing metrics
- **Email Preview**: Detailed view of original emails with AI analysis
- **Response Editor**: Edit AI-generated responses before sending
- **Filtering & Search**: Advanced filtering and search capabilities

### Security & Reliability
- **OAuth 2.0 Authentication**: Secure authentication with Google and Microsoft
- **Token Management**: Automatic token refresh and session handling
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: Built-in protection against API rate limits
- **Data Validation**: Input validation and sanitization throughout

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Google Cloud Console Account** (for Gmail and Calendar APIs)
- **Microsoft Azure Account** (for Outlook Graph API)
- **OpenRoute AI API Key** (for AI processing)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd email-agent
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Optional - for production)
DATABASE_URL=your_database_url

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:5000/auth/microsoft/callback

# OpenRoute AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Session Configuration
SESSION_SECRET=your_random_session_secret
COOKIE_SECRET=your_random_cookie_secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend/` directory:

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. OAuth Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Gmail API
   - Google Calendar API
   - Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
5. Copy Client ID and Client Secret to your `.env` file

#### Microsoft OAuth Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create new registration:
   - Name: Email Agent
   - Supported account types: Any
   - Redirect URI: `http://localhost:5000/auth/microsoft/callback`
4. Add API permissions:
   - Microsoft Graph > Mail.ReadWrite
   - Microsoft Graph > Mail.Send
   - Microsoft Graph > Calendars.Read
5. Copy Application (client) ID and Client Secret to your `.env` file

### 5. OpenRoute AI Setup
1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account and generate API key
3. Add the API key to your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```

#### Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Production Backend
```bash
cd backend
npm start
```

## 📊 API Documentation

### Authentication Endpoints

#### Google OAuth
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/google/logout` - Logout from Google

#### Microsoft OAuth
- `GET /auth/microsoft` - Initiate Microsoft OAuth flow
- `GET /auth/microsoft/callback` - Microsoft OAuth callback
- `POST /auth/microsoft/logout` - Logout from Microsoft

### Email Endpoints

#### Gmail Endpoints
- `GET /api/email/gmail/recent` - Get recent Gmail messages
- `POST /api/email/gmail/send` - Send Gmail message
- `GET /api/email/gmail/:id` - Get specific Gmail message
- `GET /api/email/gmail/:id/attachments/:attachmentId` - Download attachment
- `POST /api/email/gmail/webhook` - Gmail webhook endpoint

#### Outlook Endpoints
- `GET /api/email/outlook/recent` - Get recent Outlook messages
- `POST /api/email/outlook/send` - Send Outlook message
- `GET /api/email/outlook/:id` - Get specific Outlook message
- `GET /api/email/outlook/:id/attachments/:attachmentId` - Download attachment
- `POST /api/email/outlook/webhook` - Outlook webhook endpoint

### AI Endpoints
- `POST /api/ai/analyze` - Analyze email content
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/batch-process` - Process multiple emails
- `GET /api/ai/models` - Get available AI models
- `GET /api/ai/health` - Check AI service health

### Statistics Endpoints
- `GET /api/email/stats` - Get email processing statistics
- `GET /api/email/search` - Search emails with filters

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    depends_on:
      - backend
```

2. Build and run:
```bash
docker-compose up --build
```

### Manual Docker Setup

#### Backend Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 Production Deployment

### Heroku Deployment

1. Install Heroku CLI and login
2. Create Heroku apps:
```bash
heroku create email-agent-backend
heroku create email-agent-frontend
```

3. Set environment variables:
```bash
heroku config:set GOOGLE_CLIENT_ID=your_client_id -a email-agent-backend
# ... set all required environment variables
```

4. Deploy:
```bash
git push heroku main
```

### AWS Deployment

#### Using AWS Elastic Beanstalk
1. Install EB CLI
2. Initialize application:
```bash
eb init -p node.js email-agent
```
3. Deploy:
```bash
eb create production
```

#### Using AWS EC2 with PM2
1. Launch EC2 instance
2. Install Node.js and PM2
3. Clone repository and install dependencies
4. Start with PM2:
```bash
pm2 start backend/index.js --name "email-agent"
pm2 save
pm2 startup
```

### DigitalOcean Deployment

1. Create Droplet with Node.js
2. Clone repository
3. Install dependencies and start with PM2
4. Configure Nginx reverse proxy

## 🔍 Monitoring & Logging

### Health Checks
- Backend health: `GET /api/health`
- AI service health: `GET /api/ai/health`
- Email service health: `GET /api/email/health`

### Logging Configuration
Backend logs are configured with Winston:
- Development: Console logging with colors
- Production: File logging with rotation
- Log levels: error, warn, info, debug

### Error Monitoring
Set up error monitoring with services like:
- Sentry
- LogRocket
- DataDog
- New Relic

## 🛡️ Security Best Practices

### Environment Security
- Never commit `.env` files
- Use environment variables for all sensitive data
- Implement rate limiting
- Use HTTPS in production
- Enable CORS with specific origins

### API Security
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting per IP

### Authentication Security
- Secure session management
- Token refresh mechanisms
- OAuth scope limitations
- Secure cookie settings

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

#### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Test Coverage
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Security tests for authentication

## 📞 Support & Troubleshooting

### Common Issues

#### OAuth Issues
- **Invalid redirect URI**: Ensure redirect URIs match exactly in OAuth console
- **Insufficient permissions**: Check API permissions in Google/Microsoft console
- **Token expired**: Tokens auto-refresh, check refresh token validity

#### AI Service Issues
- **Rate limiting**: Check OpenRouter API usage and limits
- **Invalid API key**: Verify API key in environment variables
- **Model unavailable**: Check OpenRouter service status

#### Email Integration Issues
- **Gmail API disabled**: Enable Gmail API in Google Cloud Console
- **Outlook permissions**: Ensure correct Microsoft Graph permissions
- **Attachment issues**: Check file size limits (25MB for Gmail)

### Getting Help
1. Check logs: `tail -f logs/app.log`
2. Review error messages in browser console
3. Verify environment variables
4. Check API service status pages
5. Review OAuth console for errors

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Gmail and Outlook integration
- AI-powered email analysis
- Bilingual support (English/Chinese)
- Google Calendar integration
- Modern React dashboard
- Docker support
- Comprehensive API documentation