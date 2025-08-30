#!/usr/bin/env node

/**
 * Test script for bilingual AI integration
 * Tests OpenRoute AI's Deepseek model with both English and Traditional Chinese
 */

const BilingualAIService = require('./services/bilingualAIService');

async function testBilingualAI() {
  console.log('🚀 Testing Bilingual AI Integration...\n');
  
  const aiService = new BilingualAIService();
  
  // Test cases
  const testCases = [
    {
      name: 'English Wedding Inquiry',
      content: `Subject: Wedding Venue Inquiry

Hi, I would like to book your main hall for a wedding on December 15th, 2024. We expect around 150 guests. Could you please let me know if it's available from 2 PM to 10 PM? We need the space for both ceremony and reception.

Best regards,
John Smith
john@example.com`,
      expectedLanguage: 'en'
    },
    {
      name: 'Traditional Chinese Wedding Inquiry',
      content: `主題：場地預約詢問

您好，我想要預訂貴場地的主廳舉辦婚禮，日期是2024年12月15日。我們預計約150位賓客。請問下午2點到晚上10點的時段是否可預約？我們需要場地同時用於儀式和宴會。

此致
敬禮
王小明
xiaoming@example.com`,
      expectedLanguage: 'zh'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📧 ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      // Test language detection
      const detectedLanguage = aiService.detectLanguage(testCase.content);
      console.log(`✅ Language Detected: ${detectedLanguage} (Expected: ${testCase.expectedLanguage})`);
      
      // Test email analysis
      const analysis = await aiService.analyzeEmail(testCase.content, detectedLanguage);
      console.log('📊 Analysis Results:');
      console.log(`   Venue: ${analysis.venue || 'Not specified'}`);
      console.log(`   Date: ${analysis.date || 'Not specified'}`);
      console.log(`   Time: ${analysis.time || 'Not specified'}`);
      console.log(`   Attendees: ${analysis.attendees || 'Not specified'}`);
      console.log(`   Event Type: ${analysis.eventType || 'Not specified'}`);
      console.log(`   Language: ${analysis.language}`);
      
      // Test response generation
      const response = await aiService.generateResponse({
        originalEmail: {
          subject: testCase.name,
          body: testCase.content
        },
        senderName: detectedLanguage === 'zh' ? '王小明' : 'John Smith',
        venueInfo: analysis,
        calendarData: {
          isAvailable: true,
          conflictingEvents: []
        }
      });
      
      console.log('💬 Generated Response Preview:');
      const preview = response[detectedLanguage].substring(0, 150) + '...';
      console.log(`   ${preview}`);
      
      console.log(`✅ Bilingual Response: ${Object.keys(response).filter(k => ['en', 'zh'].includes(k)).join(', ')}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n');
  }
  
  // Test batch processing
  console.log('🔄 Testing Batch Processing...\n');
  
  try {
    const batchEmails = testCases.map((testCase, index) => ({
      id: `test-${index + 1}`,
      subject: testCase.name,
      body: testCase.content,
      sender: { 
        name: testCase.expectedLanguage === 'zh' ? '王小明' : 'John Smith',
        email: testCase.expectedLanguage === 'zh' ? 'xiaoming@example.com' : 'john@example.com'
      }
    }));
    
    const batchResults = await aiService.batchProcessEmails(batchEmails);
    console.log(`✅ Batch Processing Complete`);
    console.log(`📊 Summary:`);
    console.log(`   Total: ${batchResults.length}`);
    console.log(`   Processed: ${batchResults.filter(r => r.processed).length}`);
    console.log(`   Failed: ${batchResults.filter(r => !r.processed).length}`);
    
  } catch (error) {
    console.log(`❌ Batch Processing Error: ${error.message}`);
  }
  
  console.log('\n🎉 Bilingual AI Integration Test Complete!');
  console.log('💡 To run this test: node test-bilingual-ai.js');
}

// Run tests if called directly
if (require.main === module) {
  testBilingualAI().catch(console.error);
}

module.exports = { testBilingualAI };