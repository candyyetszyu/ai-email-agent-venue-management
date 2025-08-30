const axios = require('axios');

class BilingualAIService {
  constructor() {
    this.openRouteBaseURL = 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTE_API_KEY || process.env.OPENAI_API_KEY;
    this.model = 'deepseek/deepseek-chat';
  }

  /**
   * Detect the language of the input text
   * @param {string} text - Text to analyze
   * @returns {string} - Detected language ('en', 'zh', or 'unknown')
   */
  detectLanguage(text) {
    // Simple language detection based on character patterns
    const chineseRegex = /[\u4e00-\u9fff]/;
    const englishRegex = /[a-zA-Z]/;
    
    const chineseChars = (text.match(chineseRegex) || []).length;
    const englishChars = (text.match(englishRegex) || []).length;
    
    if (chineseChars > englishChars * 2) {
      return 'zh';
    } else if (englishChars > chineseChars * 2) {
      return 'en';
    }
    
    return 'en'; // Default to English
  }

  /**
   * Analyze email content using Deepseek model
   * @param {string} emailContent - Email content to analyze
   * @param {string} detectedLanguage - Detected language
   * @returns {Object} - Extracted booking information
   */
  async analyzeEmail(emailContent, detectedLanguage = null) {
    if (!detectedLanguage) {
      detectedLanguage = this.detectLanguage(emailContent);
    }

    const prompt = this.buildAnalysisPrompt(emailContent, detectedLanguage);

    try {
      const response = await axios.post(
        `${this.openRouteBaseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(detectedLanguage)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'https://your-domain.pages.dev',
            'X-Title': 'Email Agent'
          }
        }
      );

      const result = response.data.choices[0].message.content;
      return JSON.parse(result);
    } catch (error) {
      console.error('Error analyzing email:', error);
      throw new Error('Failed to analyze email content');
    }
  }

  /**
   * Generate bilingual response email
   * @param {Object} params - Response generation parameters
   * @param {string} params.originalEmail - Original email content
   * @param {string} params.senderName - Sender's name
   * @param {Object} params.venueInfo - Venue booking details
   * @param {Object} params.calendarData - Calendar availability data
   * @param {string} targetLanguage - Language for response (auto-detect if not provided)
   * @returns {Object} - Generated response in both languages
   */
  async generateResponse({
    originalEmail,
    senderName,
    venueInfo,
    calendarData
  }, targetLanguage = null) {
    
    if (!targetLanguage) {
      targetLanguage = this.detectLanguage(originalEmail);
    }

    const isAvailable = calendarData?.isAvailable || false;
    const conflictingEvents = calendarData?.conflictingEvents || [];

    const prompt = this.buildResponsePrompt({
      originalEmail,
      senderName,
      venueInfo,
      isAvailable,
      conflictingEvents,
      targetLanguage
    });

    try {
      const response = await axios.post(
        `${this.openRouteBaseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getResponseSystemPrompt(targetLanguage)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'https://your-domain.pages.dev',
            'X-Title': 'Email Agent'
          }
        }
      );

      const generatedResponse = response.data.choices[0].message.content;
      
      // Generate response in both languages
      const bilingualResponse = await this.generateBilingualResponse({
        originalResponse: generatedResponse,
        targetLanguage,
        venueInfo,
        isAvailable
      });

      return bilingualResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Build analysis prompt based on language
   * @param {string} emailContent - Email content
   * @param {string} language - Target language
   * @returns {string} - Formatted prompt
   */
  buildAnalysisPrompt(emailContent, language) {
    if (language === 'zh') {
      return `
請從以下場地預約查詢電子郵件中提取以下資訊，並以 JSON 格式回應：
{
  "venue": "場地名稱",
  "date": "日期 (YYYY-MM-DD 格式)",
  "time": "時間 (HH:MM 格式)",
  "attendees": "參加人數",
  "eventType": "活動類型",
  "contactInfo": "聯絡資訊",
  "specialRequests": "特殊要求",
  "urgency": "緊急程度 (high/medium/low)",
  "language": "郵件語言"
}

如果某些欄位在郵件中找不到，請設為 null。

郵件內容：
${emailContent}

請確保回應是有效的 JSON 格式。`;
    } else {
      return `
Extract the following information from this venue booking inquiry email and return as JSON:
{
  "venue": "venue name",
  "date": "date (YYYY-MM-DD format)",
  "time": "time (HH:MM format)",
  "attendees": "number of attendees",
  "eventType": "type of event",
  "contactInfo": "contact information",
  "specialRequests": "special requests",
  "urgency": "urgency level (high/medium/low)",
  "language": "email language"
}

If any field is not found in the email, set its value to null.

Email content:
${emailContent}

Ensure the response is valid JSON format.`;
    }
  }

  /**
   * Get system prompt based on language
   * @param {string} language - Target language
   * @returns {string} - System prompt
   */
  getSystemPrompt(language) {
    if (language === 'zh') {
      return `你是一個專業的場地預約管理助手。你的任務是準確地從電子郵件中提取預約相關資訊。請以繁體中文回應，並確保提取的資訊準確無誤。`;
    } else {
      return 'You are a professional venue booking management assistant. Your task is to accurately extract booking-related information from emails. Respond in English and ensure extracted information is accurate.';
    }
  }

  /**
   * Build response prompt
   * @param {Object} params - Response parameters
   * @returns {string} - Formatted prompt
   */
  buildResponsePrompt({
    originalEmail,
    senderName,
    venueInfo,
    isAvailable,
    conflictingEvents,
    targetLanguage
  }) {
    const details = {
      venue: venueInfo?.venue || '未指定/Not specified',
      date: venueInfo?.date || '未指定/Not specified',
      time: venueInfo?.time || '未指定/Not specified',
      attendees: venueInfo?.attendees || '未指定/Not specified',
      eventType: venueInfo?.eventType || '未指定/Not specified'
    };

    if (targetLanguage === 'zh') {
      return `
請為以下場地預約查詢撰寫專業的回覆電子郵件：

原始郵件主旨：${originalEmail.subject}
寄件者：${senderName}

原始郵件內容：
${originalEmail.body}

預約詳情：
- 場地：${details.venue}
- 日期：${details.date}
- 時間：${details.time}
- 參加人數：${details.attendees}
- 活動類型：${details.eventType}

場地可用性：${isAvailable ? '可預約' : '不可預約'}
${!isAvailable ? `衝突活動數量：${conflictingEvents.length}` : ''}

請撰寫一封專業、禮貌且完整的回覆郵件，使用繁體中文。`;
    } else {
      return `
Write a professional email response for this venue booking inquiry:

Original Email Subject: ${originalEmail.subject}
From: ${senderName}

Original Email Content:
${originalEmail.body}

Booking Details:
- Venue: ${details.venue}
- Date: ${details.date}
- Time: ${details.time}
- Attendees: ${details.attendees}
- Event Type: ${details.eventType}

Venue Availability: ${isAvailable ? 'Available' : 'Not Available'}
${!isAvailable ? `Number of Conflicting Events: ${conflictingEvents.length}` : ''}

Please write a professional, polite, and comprehensive response email in English.`;
    }
  }

  /**
   * Get response system prompt
   * @param {string} language - Target language
   * @returns {string} - System prompt
   */
  getResponseSystemPrompt(language) {
    if (language === 'zh') {
      return `你是一位專業的場地預約管理經理。你的任務是撰寫禮貌、專業且有用的回覆郵件給客戶。請使用繁體中文，保持語氣友善但專業。`;
    } else {
      return 'You are a professional venue booking manager. Your task is to write polite, professional, and helpful response emails to clients. Use English and maintain a friendly yet professional tone.';
    }
  }

  /**
   * Generate bilingual response
   * @param {Object} params - Bilingual response parameters
   * @returns {Object} - Response in both languages
   */
  async generateBilingualResponse({
    originalResponse,
    targetLanguage,
    venueInfo,
    isAvailable
  }) {
    // If target is Chinese, also generate English, and vice versa
    const otherLanguage = targetLanguage === 'zh' ? 'en' : 'zh';
    
    const otherPrompt = targetLanguage === 'zh' 
      ? `Translate this Chinese email response to professional English: ${originalResponse}`
      : `Translate this English email response to professional Traditional Chinese: ${originalResponse}`;

    try {
      const otherResponse = await axios.post(
        `${this.openRouteBaseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate the email while maintaining professional tone and context.'
            },
            {
              role: 'user',
              content: otherPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'https://your-domain.pages.dev',
            'X-Title': 'Email Agent'
          }
        }
      );

      const otherLanguageResponse = otherResponse.data.choices[0].message.content;

      return {
        primaryLanguage: targetLanguage,
        [targetLanguage]: originalResponse,
        [otherLanguage]: otherLanguageResponse,
        metadata: {
          detectedLanguage: targetLanguage,
          venueAvailable: isAvailable,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating bilingual response:', error);
      return {
        primaryLanguage: targetLanguage,
        [targetLanguage]: originalResponse,
        [otherLanguage]: 'Translation temporarily unavailable',
        metadata: {
          detectedLanguage: targetLanguage,
          venueAvailable: isAvailable,
          timestamp: new Date().toISOString(),
          error: 'Translation failed'
        }
      };
    }
  }

  /**
   * Batch process multiple emails
   * @param {Array} emails - Array of email objects
   * @returns {Array} - Processed email analyses
   */
  async batchProcessEmails(emails) {
    const results = [];
    
    for (const email of emails) {
      try {
        const analysis = await this.analyzeEmail(email.content);
        const response = await this.generateResponse({
          originalEmail: email,
          senderName: email.sender.name || email.sender.email,
          venueInfo: analysis
        });
        
        results.push({
          emailId: email.id,
          analysis,
          response,
          processed: true
        });
      } catch (error) {
        results.push({
          emailId: email.id,
          error: error.message,
          processed: false
        });
      }
    }
    
    return results;
  }
}

module.exports = BilingualAIService;