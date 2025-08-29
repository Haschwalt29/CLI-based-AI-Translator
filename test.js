/**
 * Test file for Tranzio Translator
 * Demonstrates core functionality without CLI
 */

import dotenv from 'dotenv';
import TranzioTranslator from './src/translator.js';
import { getPromptByStrategy } from './src/prompts/dynamic.js';
import { checkRAG, addToGlossary, getGlossaryStats } from './src/rag.js';
import { prettyPrintOutput } from './src/utils/structuredOutput.js';

// Load environment variables
dotenv.config();

async function testTranzio() {
  console.log('🚀 Testing Tranzio Translator\n');

  // Test 1: RAG functionality
  console.log('📚 Testing RAG Module:');
  const ragResult = await checkRAG("hello", "Spanish");
  if (ragResult) {
    console.log(prettyPrintOutput(ragResult));
  }

  // Test 2: Prompt strategies
  console.log('\n🎯 Testing Prompt Strategies:');
  const zeroShotPrompt = getPromptByStrategy("Hello", "French", "English", "zero");
  console.log('Zero-shot prompt preview:', zeroShotPrompt.substring(0, 100) + '...');

  const multiShotPrompt = getPromptByStrategy("It's raining cats and dogs", "Spanish", "English", "multi");
  console.log('Multi-shot prompt preview:', multiShotPrompt.substring(0, 100) + '...');

  // Test 3: Glossary statistics
  console.log('\n📊 Glossary Statistics:');
  const stats = await getGlossaryStats();
  console.log(stats);

  // Test 4: Add to glossary
  console.log('\n💾 Adding new translation to glossary:');
  await addToGlossary("good morning", "buenos días", "Spanish", "English");

  // Test 5: Check updated statistics
  const updatedStats = await getGlossaryStats();
  console.log('Updated stats:', updatedStats);

  // Test 6: Test new RAG entry
  console.log('\n🎯 Testing new RAG entry:');
  const newRagResult = await checkRAG("good morning", "Spanish");
  if (newRagResult) {
    console.log(prettyPrintOutput(newRagResult));
  }

  console.log('\n✅ All tests completed!');
}

// Run tests if API key is available
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  console.log('🔑 API key found, running full tests...\n');
  
  // Test 7: Full translation (requires API key)
  const translator = new TranzioTranslator();
  
  translator.translate("Hello, how are you today?", "French")
    .then(result => {
      console.log('\n🌍 Full Translation Test:');
      console.log(prettyPrintOutput(result));
    })
    .catch(error => {
      console.error('❌ Translation error:', error.message);
    })
    .finally(() => {
      testTranzio();
    });
} else {
  console.log('⚠️  No valid API key found, running offline tests only...\n');
  testTranzio();
}
