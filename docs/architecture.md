# System Architecture

## Overview

The Email Agent for Venue Booking System is a web application designed to streamline the process of responding to venue booking inquiries. The system integrates with email providers (Gmail and Outlook), Google Calendar for venue availability, and uses AI to analyze emails and generate appropriate responses.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Frontend (React)│◄────┤  Backend (Node) │◄────┤  External APIs  │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │                      ▲
         │                       │                      │
         │                       │                      │
         │                       │                      │
         ▼                       ▼                      │
┌─────────────────┐     ┌─────────────────┐            │
│                 │     │                 │            │
│    User         │     │   Database      │────────────┘
│  Interaction    │     │  (Optional)     │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Component Architecture

### Frontend Architecture

The frontend is built using React.js with a component-based architecture:

```
┌─────────────────────────────────────────────────────┐
│                     App                              │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  AuthContext                         │
└───────────────────────┬─────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
┌───────────────────┐     ┌─────────────────────┐
│    Public Routes   │     │   Private Routes    │
│  (Login, Callback) │     │ (Dashboard, Email)  │
└───────────────────┘     └──────────┬──────────┘
                                     │
                 ┌───────────────────┴───────────────┐
                 │                                   │
                 ▼                                   ▼
        ┌─────────────────┐               ┌─────────────────┐
        │    Dashboard    │               │  EmailResponse  │
        └────────┬────────┘               └────────┬────────┘
                 │                                 │
        ┌────────┴────────┐               ┌────────┴────────┐
        │                 │               │                 │
        ▼                 ▼               ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  EmailCard  │  │  EventCard  │  │ EmailDetail │  │ ResponseForm│
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### Backend Architecture

The backend follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    Express App                       │
└───────────────────────┬─────────────────────────────┘
                        │
            ┌───────────┼───────────┬───────────┐
            │           │           │           │
            ▼           ▼           ▼           ▼
┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Auth Routes  │ │ Calendar │ │  Email   │ │    AI    │
│               │ │  Routes  │ │  Routes  │ │  Routes  │
└───────┬───────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
        │              │            │            │
        ▼              ▼            ▼            ▼
┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│     Auth      │ │ Calendar │ │  Email   │ │    AI    │
│  Controllers  │ │Controllers│ │Controllers│ │Controllers│
└───────────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Data Flow

### Authentication Flow

1. User initiates authentication with Google or Microsoft
2. User is redirected to OAuth provider
3. Provider redirects back with authorization code
4. Backend exchanges code for access and refresh tokens
5. Backend generates JWT token for the user
6. Frontend stores JWT token and uses it for subsequent requests

```
┌──────┐    ┌────────┐    ┌─────────────┐    ┌──────────┐
│ User │───►│Frontend│───►│OAuth Provider│◄───┤ Backend  │
└──────┘    └────┬───┘    └──────┬──────┘    └──────────┘
                 │               │                 ▲
                 │               ▼                 │
                 │         ┌──────────┐           │
                 └────────►│ Backend  │◄──────────┘
                           └──────────┘
                                │
                                ▼
                           ┌──────────┐
                           │ Frontend │
                           └──────────┘
```

### Email Response Flow

1. User selects an email from the dashboard
2. Frontend requests email details from backend
3. Backend fetches email from Gmail/Outlook API
4. Frontend sends email content to AI analysis endpoint
5. Backend uses OpenAI to extract booking information
6. Frontend requests venue availability from backend
7. Backend checks Google Calendar for conflicts
8. Frontend requests AI-generated response
9. Backend generates response based on availability
10. User reviews and sends the response

```
┌──────┐    ┌────────┐    ┌──────────┐    ┌─────────────┐
│ User │───►│Frontend│───►│ Backend  │───►│ Email APIs  │
└──────┘    └────┬───┘    └────┬─────┘    └─────────────┘
                 │              │
                 │              ▼
                 │        ┌──────────┐    ┌─────────────┐
                 │        │ Backend  │───►│ OpenAI API  │
                 │        └────┬─────┘    └─────────────┘
                 │              │
                 │              ▼
                 │        ┌──────────┐    ┌─────────────┐
                 │        │ Backend  │───►│Calendar API │
                 │        └────┬─────┘    └─────────────┘
                 │              │
                 ▼              ▼
            ┌────────┐    ┌──────────┐
            │Frontend│◄───┤ Backend  │
            └────┬───┘    └──────────┘
                 │
                 ▼
            ┌──────┐
            │ User │
            └──────┘
```

## Technology Stack

### Frontend

- **React.js**: UI library for building component-based interfaces
- **React Router**: For client-side routing
- **Material UI**: Component library for consistent design
- **Axios**: HTTP client for API requests
- **Context API**: For state management

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Passport.js**: Authentication middleware
- **JWT**: For secure authentication tokens
- **Axios**: For HTTP requests to external APIs

### External APIs

- **Google APIs**:
  - Gmail API for email integration
  - Google Calendar API for venue availability
  - Google OAuth for authentication

- **Microsoft Graph API**:
  - Outlook Mail API for email integration
  - Microsoft OAuth for authentication

- **OpenAI API**:
  - For email analysis and response generation

## Security Architecture

### Authentication and Authorization

- **OAuth 2.0**: For secure authentication with Google and Microsoft
- **JWT**: For maintaining session state and authorizing API requests
- **Middleware**: For protecting routes and validating tokens

### Data Protection

- **HTTPS**: For secure data transmission
- **Environment Variables**: For storing sensitive credentials
- **Input Validation**: To prevent injection attacks

## Scalability Considerations

### Horizontal Scaling

- Stateless backend design allows for multiple instances
- Frontend can be deployed to CDN for global distribution

### Performance Optimization

- Caching strategies for API responses
- Optimized React rendering with memoization
- Efficient API request batching

## Deployment Architecture

### Development Environment

- Local Node.js server for backend
- React development server for frontend
- Environment variables for configuration

### Production Environment

- Node.js backend deployed to cloud platform
- Static frontend files served from CDN or web server
- Proper environment configuration for production settings

## Future Architecture Considerations

### Potential Enhancements

- **Database Integration**: For storing user preferences and application state
- **Webhook Support**: For real-time email notifications
- **Microservices Architecture**: Splitting backend into specialized services
- **WebSocket Integration**: For real-time updates and notifications

### Monitoring and Observability

- Logging infrastructure for tracking system behavior
- Performance monitoring for identifying bottlenecks
- Error tracking for quick issue resolution