# Bilingual AI Integration Guide

This guide covers the integration of OpenRoute AI's Deepseek model for bilingual email processing in both English and Traditional Chinese.

## Overview

The Email Agent now supports **bilingual processing** using OpenRoute AI's Deepseek model, enabling seamless handling of email communications in both English and Traditional Chinese. The system automatically detects the email language and generates appropriate responses while preserving the original context and intent.

## Features

### 1. Language Detection
- **Automatic Detection**: Detects email language (English/Traditional Chinese) using character pattern analysis
- **Manual Override**: Optional language parameter for explicit language specification
- **Confidence Scoring**: Provides confidence level for language detection

### 2. Bilingual Email Analysis
- **Smart Extraction**: Extracts booking information from emails in both languages
- **Context Preservation**: Maintains original email context and intent
- **Structured Output**: Returns JSON-formatted analysis with booking details

### 3. Response Generation
- **Language-Specific Responses**: Generates responses in the detected email language
- **Bilingual Support**: Provides both English and Traditional Chinese versions
- **Professional Tone**: Maintains professional and courteous communication style
- **Venue Integration**: Incorporates calendar availability and venue information

### 4. Batch Processing
- **Bulk Processing**: Process multiple emails simultaneously (up to 50 per batch)
- **Progress Tracking**: Real-time processing status and summary
- **Error Handling**: Individual email processing with error reporting

## API Endpoints

### 1. Analyze Email
```http
POST /api/ai/analyze-email
Authorization: Bearer {token}
Content-Type: application/json

{
  "emailContent": "I would like to book your venue for a wedding on December 15th, 2024...",
  "detectedLanguage": "en"  // Optional: "en" or "zh"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "venue": "Main Hall",
    "date": "2024-12-15",
    "time": "14:00",
    "attendees": 150,
    "eventType": "wedding",
    "contactInfo": "john@example.com",
    "specialRequests": "outdoor setup",
    "urgency": "medium",
    "language": "en",
    "confidence": 0.95
  },
  "language": "en",
  "confidence": 0.95
}
```

### 2. Generate Response
```http
POST /api/ai/generate-response
Authorization: Bearer {token}
Content-Type: application/json

{
  "originalEmail": {
    "subject": "Venue Booking Inquiry",
    "body": "I would like to book your venue..."
  },
  "senderName": "John Smith",
  "venueInfo": {
    "venue": "Main Hall",
    "date": "2024-12-15",
    "time": "14:00"
  },
  "calendarData": {
    "isAvailable": true,
    "conflictingEvents": []
  },
  "targetLanguage": "en"  // Optional: "en" or "zh"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "primaryLanguage": "en",
    "en": "Dear John, Thank you for your inquiry about our Main Hall...",
    "zh": "親愛的John，感謝您對我們主廳的詢問...",
    "metadata": {
      "detectedLanguage": "en",
      "venueAvailable": true,
      "timestamp": "2024-12-15T10:30:00Z"
    }
  },
  "language": "en",
  "availableIn": ["en", "zh"]
}
```

### 3. Detect Language
```http
POST /api/ai/detect-language
Authorization: Bearer {token}
Content-Type: application/json

{
  "emailContent": "我想要預訂您的場地舉辦婚禮..."
}
```

**Response:**
```json
{
  "success": true,
  "language": "zh",
  "detected": true
}
```

### 4. Batch Process Emails
```http
POST /api/ai/batch-process
Authorization: Bearer {token}
Content-Type: application/json

{
  "emails": [
    {
      "id": "email-1",
      "subject": "Booking Request",
      "body": "I need to book...",
      "sender": {"email": "user1@example.com"}
    },
    {
      "id": "email-2",
      "subject": "場地預約",
      "body": "我想要預約...",
      "sender": {"email": "user2@example.com"}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "summary": {
    "total": 2,
    "processed": 2,
    "failed": 0,
    "languages": ["en", "zh"]
  }
}
```

### 5. Health Check
```http
GET /api/ai/health
```

**Response:**
```json
{
  "success": true,
  "message": "AI service is running",
  "timestamp": "2024-12-15T10:30:00Z",
  "service": "bilingual-ai-service",
  "languages": ["en", "zh"]
}
```

### 6. Get Models
```http
GET /api/ai/models
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "name": "deepseek/deepseek-chat",
      "provider": "OpenRoute AI",
      "languages": ["en", "zh", "zh-tw"],
      "features": ["email-analysis", "response-generation", "language-detection"]
    }
  ],
  "current": "deepseek/deepseek-chat"
}
```

## Configuration

### Environment Variables

Update your `.env` file with the following variables:

```bash
# OpenRoute AI Configuration
OPENROUTE_API_KEY=your_openroute_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional fallback

# AI Service Settings
AI_MODEL=deepseek/deepseek-chat
AI_MAX_TOKENS=1500
AI_TEMPERATURE=0.7

# Application URLs
FRONTEND_URL=https://your-domain.pages.dev
```

### Getting OpenRoute API Key

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Create a free account
3. Navigate to API Keys section
4. Generate a new API key
5. Add the key to your environment variables

## Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Analyze email
async function analyzeEmail(emailContent) {
  const response = await axios.post('/api/ai/analyze-email', {
    emailContent,
    detectedLanguage: 'en'
  });
  return response.data.analysis;
}

// Generate response
async function generateResponse(originalEmail, calendarData) {
  const response = await axios.post('/api/ai/generate-response', {
    originalEmail,
    calendarData,
    senderName: 'Client Name'
  });
  return response.data.response;
}

// Batch process
async function batchProcess(emails) {
  const response = await axios.post('/api/ai/batch-process', {
    emails: emails.map(email => ({
      id: email.id,
      subject: email.subject,
      body: email.body,
      sender: { email: email.from }
    }))
  });
  return response.data.results;
}
```

### Python

```python
import requests

# Analyze email
def analyze_email(email_content, detected_language=None):
    payload = {
        'emailContent': email_content,
        'detectedLanguage': detected_language
    }
    response = requests.post('/api/ai/analyze-email', json=payload)
    return response.json()

# Generate response
def generate_response(original_email, calendar_data, sender_name):
    payload = {
        'originalEmail': original_email,
        'calendarData': calendar_data,
        'senderName': sender_name
    }
    response = requests.post('/api/ai/generate-response', json=payload)
    return response.json()
```

## Language Support Details

### English (en)
- **Character Set**: Latin alphabet
- **Detection**: ASCII and Latin characters
- **Response Style**: Professional, courteous English
- **Date Format**: MM/DD/YYYY or DD/MM/YYYY
- **Time Format**: 12-hour or 24-hour format

### Traditional Chinese (zh)
- **Character Set**: Traditional Chinese characters (繁體中文)
- **Detection**: CJK Unified Ideographs
- **Response Style**: Professional, courteous Traditional Chinese
- **Date Format**: YYYY年MM月DD日
- **Time Format**: 24-hour format

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Error Codes
- `400`: Bad request (missing parameters, invalid format)
- `401`: Unauthorized (invalid or missing token)
- `429`: Rate limit exceeded
- `500`: Internal server error
- `503`: Service unavailable

## Best Practices

### 1. Language Detection
- Allow automatic detection for most cases
- Use manual override only when certain
- Check confidence scores for uncertain cases

### 2. Response Generation
- Always include sender name for personalization
- Provide venue info and calendar data for accurate responses
- Handle both available and unavailable scenarios

### 3. Batch Processing
- Process emails in batches of 10-20 for optimal performance
- Implement retry logic for failed emails
- Monitor processing times and adjust batch sizes

### 4. Error Handling
- Always validate input data before sending
- Implement proper error handling and user feedback
- Log errors for debugging and improvement

## Testing

### Test Email Content

**English Test:**
```
Subject: Wedding Venue Inquiry

Hi, I would like to book your main hall for a wedding on December 15th, 2024. We expect around 150 guests. Could you please let me know if it's available from 2 PM to 10 PM?

Best regards,
John Smith
```

**Chinese Test:**
```
主題：場地預約詢問

您好，我想要預訂貴場地的主廳舉辦婚禮，日期是2024年12月15日。我們預計約150位賓客。請問下午2點到晚上10點的時段是否可預約？

此致
敬禮
王小明
```

## Monitoring and Analytics

### Key Metrics to Track
- Language detection accuracy
- Response generation quality
- Processing times
- Error rates
- User satisfaction

### Health Monitoring
- Regular health checks via `/api/ai/health`
- API key validity monitoring
- Rate limit tracking
- Service availability monitoring

## Support

For issues or questions:
1. Check the health endpoint: `GET /api/ai/health`
2. Review error logs and messages
3. Test with sample emails
4. Contact support with specific error details

## Future Enhancements

- Additional language support (Simplified Chinese, Japanese, Korean)
- Sentiment analysis for email tone
- Custom response templates
- Advanced NLP features
- Real-time processing optimization