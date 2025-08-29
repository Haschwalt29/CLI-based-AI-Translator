/**
 * Dynamic Prompt Template
 * 
 * This prompt template dynamically selects the best prompting strategy
 * based on the input text characteristics, target language, and complexity.
 * It's the main entry point for the translation system.
 */

import { getZeroShotPrompt } from './zeroShot.js';
import { getOneShotPrompt } from './oneShot.js';
import { getMultiShotPrompt } from './multiShot.js';

export const getTranslationPrompt = (text, targetLang, sourceLang = null) => {
  // Analyze text complexity
  const complexity = analyzeTextComplexity(text);
  
  // Select appropriate prompt strategy
  if (complexity === 'simple') {
    return getZeroShotPrompt(text, targetLang, sourceLang);
  } else if (complexity === 'moderate') {
    return getOneShotPrompt(text, targetLang, sourceLang);
  } else {
    return getMultiShotPrompt(text, targetLang, sourceLang);
  }
};

/**
 * Analyze text complexity to determine the best prompting strategy
 * @param {string} text - Input text to analyze
 * @returns {string} Complexity level: 'simple', 'moderate', or 'complex'
 */
function analyzeTextComplexity(text) {
  const wordCount = text.split(/\s+/).length;
  const hasIdioms = /(it's raining cats and dogs|early bird|actions speak|book by its cover)/i.test(text);
  const hasSpecialChars = /[^\w\s.,!?;:'"()]/.test(text);
  const hasNumbers = /\d/.test(text);
  
  if (wordCount <= 5 && !hasIdioms && !hasSpecialChars) {
    return 'simple';
  } else if (wordCount <= 15 && !hasIdioms) {
    return 'moderate';
  } else {
    return 'complex';
  }
}

/**
 * Get prompt with specific strategy
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @param {string} strategy - Prompting strategy: 'zero', 'one', 'multi'
 * @returns {string} Formatted prompt
 */
export const getPromptByStrategy = (text, targetLang, sourceLang = null, strategy = 'auto') => {
  switch (strategy) {
    case 'zero':
      return getZeroShotPrompt(text, targetLang, sourceLang);
    case 'one':
      return getOneShotPrompt(text, targetLang, sourceLang);
    case 'multi':
      return getMultiShotPrompt(text, targetLang, sourceLang);
    case 'auto':
    default:
      return getTranslationPrompt(text, targetLang, sourceLang);
  }
};

// Example usage:
/*
import { getTranslationPrompt, getPromptByStrategy } from './dynamic.js';

// Auto-select best strategy
const autoPrompt = getTranslationPrompt(
  "Hello, how are you?",
  "Spanish"
);

// Force specific strategy
const oneShotPrompt = getPromptByStrategy(
  "Complex idiomatic expression",
  "French",
  "English",
  "multi"
);

console.log(autoPrompt);
console.log(oneShotPrompt);
*/
