# API Documentation

## Base URL

```
http://localhost:5000/api
```

In production, this will be your deployed backend URL.

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Google OAuth Authentication

```
GET /auth/google
```

Initiates Google OAuth flow.

#### Google OAuth Callback

```
GET /auth/google/callback
```

Callback URL for Google OAuth. Returns JWT token on successful authentication.

**Response:**
```json
{
  "token": "your_jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "provider": "google"
  }
}
```

#### Microsoft OAuth Authentication

```
GET /auth/microsoft
```

Initiates Microsoft OAuth flow.

#### Microsoft OAuth Callback

```
GET /auth/microsoft/callback
```

Callback URL for Microsoft OAuth. Returns JWT token on successful authentication.

**Response:**
```json
{
  "token": "your_jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "provider": "microsoft"
  }
}
```

#### Verify Token

```
GET /auth/verify
```

Verifies if the provided JWT token is valid.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "provider": "google|microsoft"
  }
}
```

## Calendar Endpoints

### Get Events

```
GET /calendar/events
```

Retrieves events from Google Calendar within a specified date range.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `startDate` (optional): Start date in ISO format (default: today)
- `endDate` (optional): End date in ISO format (default: 7 days from today)

**Response:**
```json
{
  "events": [
    {
      "id": "event_id",
      "summary": "Event Title",
      "description": "Event Description",
      "location": "Event Location",
      "start": "2023-04-20T10:00:00Z",
      "end": "2023-04-20T11:00:00Z",
      "attendees": [
        {
          "email": "attendee@example.com",
          "displayName": "Attendee Name",
          "responseStatus": "accepted"
        }
      ]
    }
  ]
}
```

### Check Venue Availability

```
GET /calendar/availability
```

Checks if a venue is available during a specified time period.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `venue` (required): Name of the venue
- `startTime` (required): Start time in ISO format
- `endTime` (required): End time in ISO format

**Response:**
```json
{
  "available": true,
  "conflictingEvents": [] // Array of conflicting events if available is false
}
```

## Email Endpoints

### Get Gmail Messages

```
GET /email/gmail
```

Retrieves recent messages from Gmail.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `maxResults` (optional): Maximum number of messages to retrieve (default: 10)

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "threadId": "thread_id",
      "snippet": "Message snippet...",
      "subject": "Message Subject",
      "from": {
        "name": "Sender Name",
        "email": "sender@example.com"
      },
      "to": [
        {
          "name": "Recipient Name",
          "email": "recipient@example.com"
        }
      ],
      "date": "2023-04-20T10:00:00Z",
      "body": "Message body...",
      "isRead": true
    }
  ]
}
```

### Get Outlook Messages

```
GET /email/outlook
```

Retrieves recent messages from Outlook.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `maxResults` (optional): Maximum number of messages to retrieve (default: 10)

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "conversationId": "conversation_id",
      "snippet": "Message snippet...",
      "subject": "Message Subject",
      "from": {
        "name": "Sender Name",
        "email": "sender@example.com"
      },
      "toRecipients": [
        {
          "name": "Recipient Name",
          "email": "recipient@example.com"
        }
      ],
      "receivedDateTime": "2023-04-20T10:00:00Z",
      "bodyPreview": "Message body preview...",
      "body": "Message body...",
      "isRead": true
    }
  ]
}
```

### Send Gmail Message

```
POST /email/gmail/send
```

Sends an email through Gmail.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email body content...",
  "cc": "cc@example.com", // Optional
  "bcc": "bcc@example.com" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message_id"
}
```

### Send Outlook Message

```
POST /email/outlook/send
```

Sends an email through Outlook.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email body content...",
  "cc": "cc@example.com", // Optional
  "bcc": "bcc@example.com" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message_id"
}
```

## AI Endpoints

### Analyze Email

```
POST /ai/analyze-email
```

Analyzes an email to extract booking information.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailContent": "Email content to analyze..."
}
```

**Response:**
```json
{
  "analysis": {
    "requestedDate": "2023-05-15",
    "startTime": "14:00",
    "endTime": "16:00",
    "venue": "Conference Room A",
    "eventType": "Meeting",
    "attendees": 10,
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "additionalRequirements": "Projector, catering"
  }
}
```

### Generate Response

```
POST /ai/generate-response
```

Generates an email response based on the original email, calendar data, and venue availability.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "originalEmail": {
    "from": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "subject": "Venue Booking Request",
    "body": "Original email content..."
  },
  "bookingInfo": {
    "requestedDate": "2023-05-15",
    "startTime": "14:00",
    "endTime": "16:00",
    "venue": "Conference Room A",
    "eventType": "Meeting",
    "attendees": 10
  },
  "venueAvailable": true,
  "conflictingEvents": [] // Only if venueAvailable is false
}
```

**Response:**
```json
{
  "response": "Generated email response..."
}
```

## Error Responses

All endpoints return standard error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": {} // Detailed error information (only in development mode)
}
```

Common HTTP status codes:

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error