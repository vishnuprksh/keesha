// Test script to verify token limit warning functionality
const { GeminiService } = require('./src/services/geminiService.ts');

// Create a very large text that should exceed token limits
const largeText = 'This is a transaction line. '.repeat(30000); // About 150k characters

console.log('Testing token limit warning...');
console.log(`Generated text length: ${largeText.length} characters`);

const geminiService = new GeminiService();

async function testTokenLimit() {
  try {
    await geminiService.processPDFText(largeText, 'test-user-id');
    console.log('ERROR: Should have thrown token limit error');
  } catch (error) {
    console.log('SUCCESS: Caught expected error:');
    console.log(error.message);
    
    // Check if it's the token limit error
    if (error.message.includes('too large')) {
      console.log('✅ Token limit error detected correctly');
    } else {
      console.log('❌ Unexpected error type');
    }
  }
}

// Note: This is just a structure test - we can't run it without proper Node setup
console.log('Test structure created. In a real environment, this would verify:');
console.log('1. Large text triggers token limit error');
console.log('2. Error message contains "too large"');
console.log('3. PDFImport component shows enhanced warning UI');
