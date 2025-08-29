/**
 * RAG (Retrieval-Augmented Generation) Module
 * 
 * This module maintains a local glossary of frequently used words and phrases
 * to reduce API calls and improve response time for common translations.
 */

import fs from 'fs/promises';
import path from 'path';
import { createSuccessResponse } from './utils/structuredOutput.js';

// Default glossary path
const GLOSSARY_PATH = './data/glossary.json';

/**
 * Local glossary for common translations
 * This can be expanded with domain-specific terminology
 */
const DEFAULT_GLOSSARY = {
  "hello": {
    "Spanish": "hola",
    "French": "bonjour",
    "German": "hallo",
    "Italian": "ciao",
    "Portuguese": "olá",
    "Russian": "привет",
    "Japanese": "こんにちは",
    "Korean": "안녕하세요",
    "Chinese": "你好",
    "Arabic": "مرحبا"
  },
  "goodbye": {
    "Spanish": "adiós",
    "French": "au revoir",
    "German": "auf wiedersehen",
    "Italian": "arrivederci",
    "Portuguese": "adeus",
    "Russian": "до свидания",
    "Japanese": "さようなら",
    "Korean": "안녕히 가세요",
    "Chinese": "再见",
    "Arabic": "مع السلامة"
  },
  "thank you": {
    "Spanish": "gracias",
    "French": "merci",
    "German": "danke",
    "Italian": "grazie",
    "Portuguese": "obrigado",
    "Russian": "спасибо",
    "Japanese": "ありがとう",
    "Korean": "감사합니다",
    "Chinese": "谢谢",
    "Arabic": "شكرا"
  },
  "yes": {
    "Spanish": "sí",
    "French": "oui",
    "German": "ja",
    "Italian": "sì",
    "Portuguese": "sim",
    "Russian": "да",
    "Japanese": "はい",
    "Korean": "네",
    "Chinese": "是",
    "Arabic": "نعم"
  },
  "no": {
    "Spanish": "no",
    "French": "non",
    "German": "nein",
    "Italian": "no",
    "Portuguese": "não",
    "Russian": "нет",
    "Japanese": "いいえ",
    "Korean": "아니요",
    "Chinese": "不",
    "Arabic": "لا"
  }
};

/**
 * Check if translation exists in local glossary
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language (optional)
 * @returns {Object|null} Translation result if found, null otherwise
 */
export const checkRAG = async (text, targetLang, sourceLang = null) => {
  try {
    // Load glossary
    const glossary = await loadGlossary();
    
    // Normalize text for lookup
    const normalizedText = text.toLowerCase().trim();
    
    // Check if exact match exists
    if (glossary[normalizedText] && glossary[normalizedText][targetLang]) {
      const translation = glossary[normalizedText][targetLang];
      
      console.log(`🎯 RAG hit: Found "${text}" → "${translation}" in local glossary`);
      
      return createSuccessResponse(
        translation,
        sourceLang || 'auto-detected',
        targetLang,
        {
          confidence: 1.0,
          cultural_notes: 'Retrieved from local glossary',
          source: 'rag'
        }
      );
    }
    
    // Check for partial matches (for longer phrases)
    const partialMatch = findPartialMatch(normalizedText, targetLang, glossary);
    if (partialMatch) {
      console.log(`🎯 RAG partial hit: Found partial match for "${text}"`);
      return partialMatch;
    }
    
    return null; // No match found, proceed with API call
    
  } catch (error) {
    console.error('❌ RAG error:', error.message);
    return null; // Fallback to API call
  }
};

/**
 * Load glossary from file or use default
 * @returns {Object} Glossary object
 */
const loadGlossary = async () => {
  try {
    // Try to load from file
    const data = await fs.readFile(GLOSSARY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or can't be read, use default
    console.log('📚 Using default glossary (no custom file found)');
    return DEFAULT_GLOSSARY;
  }
};

/**
 * Find partial matches in glossary
 * @param {string} text - Text to search for
 * @param {string} targetLang - Target language
 * @param {Object} glossary - Glossary object
 * @returns {Object|null} Partial match result or null
 */
const findPartialMatch = (text, targetLang, glossary) => {
  const words = text.split(/\s+/);
  
  // Check if all words exist in glossary
  const allWordsFound = words.every(word => 
    glossary[word] && glossary[word][targetLang]
  );
  
  if (allWordsFound) {
    // Construct translation from individual words
    const translation = words.map(word => 
      glossary[word][targetLang]
    ).join(' ');
    
    return createSuccessResponse(
      translation,
      'auto-detected',
      targetLang,
      {
        confidence: 0.9,
        cultural_notes: 'Constructed from individual word translations',
        source: 'rag_partial'
      }
    );
  }
  
  return null;
};

/**
 * Add new translation to glossary
 * @param {string} sourceText - Source text
 * @param {string} translatedText - Translated text
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<boolean>} Success status
 */
export const addToGlossary = async (sourceText, translatedText, targetLang, sourceLang) => {
  try {
    const glossary = await loadGlossary();
    const normalizedText = sourceText.toLowerCase().trim();
    
    if (!glossary[normalizedText]) {
      glossary[normalizedText] = {};
    }
    
    glossary[normalizedText][targetLang] = translatedText;
    
    // Ensure directory exists
    const dir = path.dirname(GLOSSARY_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    // Save updated glossary
    await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
    
    console.log(`💾 Added "${sourceText}" → "${translatedText}" to glossary`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to add to glossary:', error.message);
    return false;
  }
};

/**
 * Get glossary statistics
 * @returns {Object} Glossary statistics
 */
export const getGlossaryStats = async () => {
  try {
    const glossary = await loadGlossary();
    const totalEntries = Object.keys(glossary).length;
    const totalTranslations = Object.values(glossary).reduce((sum, entry) => 
      sum + Object.keys(entry).length, 0
    );
    
    return {
      totalEntries,
      totalTranslations,
      averageTranslationsPerEntry: totalEntries > 0 ? (totalTranslations / totalEntries).toFixed(2) : 0
    };
  } catch (error) {
    return { error: error.message };
  }
};

// Example usage:
/*
import { checkRAG, addToGlossary, getGlossaryStats } from './rag.js';

// Check for existing translation
const result = await checkRAG("hello", "Spanish");

// Add new translation
await addToGlossary("good morning", "buenos días", "Spanish", "English");

// Get statistics
const stats = await getGlossaryStats();
console.log(stats);
*/
