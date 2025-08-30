# Installation Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- Google Cloud Platform account with Gmail and Calendar API enabled
- Microsoft Azure account with Microsoft Graph API enabled
- OpenAI API key

## Setting Up API Keys and Credentials

### Google Cloud Platform Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs:
   - Gmail API
   - Google Calendar API
   - Google People API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" and select "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized JavaScript origins (e.g., `http://localhost:3000`)
   - Add authorized redirect URIs (e.g., `http://localhost:5000/api/auth/google/callback`)
   - Download the credentials JSON file

### Microsoft Azure Setup

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Register a new application in Azure Active Directory
3. Add the following API permissions:
   - Microsoft Graph > Mail.Read
   - Microsoft Graph > Mail.Send
   - Microsoft Graph > Calendars.Read
   - Microsoft Graph > User.Read
4. Configure authentication:
   - Add a platform (Web)
   - Set redirect URIs (e.g., `http://localhost:5000/api/auth/microsoft/callback`)
   - Enable implicit grant flow for access tokens
5. Note your Application (client) ID and create a client secret

### OpenAI API Setup

1. Create an account on [OpenAI](https://openai.com/)
2. Generate an API key from your account dashboard

## Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Email-Agent
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your API keys and credentials:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/email-agent
   JWT_SECRET=your_jwt_secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Microsoft OAuth
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # URLs
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000
   ```

6. Start the backend server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file:
   ```bash
   touch .env
   ```

4. Add the backend API URL to the `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the frontend development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Accessing the Application

Once both the backend and frontend servers are running, you can access the application at `http://localhost:3000`.

## Troubleshooting

### CORS Issues

If you encounter CORS issues, ensure that:

1. The `FRONTEND_URL` in the backend `.env` file matches your frontend URL
2. The `REACT_APP_API_URL` in the frontend `.env` file matches your backend API URL

### Authentication Issues

If you encounter authentication issues:

1. Verify that your Google and Microsoft OAuth credentials are correct
2. Ensure that the redirect URIs in your OAuth providers match the ones in your application
3. Check that your application has the necessary API permissions

### API Rate Limits

Both Google and Microsoft APIs have rate limits. If you encounter rate limit issues:

1. Implement caching mechanisms
2. Add retry logic with exponential backoff
3. Consider upgrading to a higher tier if available

## Production Deployment

For production deployment, consider:

1. Using environment variables for sensitive information
2. Setting up a production database
3. Configuring HTTPS
4. Implementing proper error handling and logging
5. Setting up monitoring and alerting