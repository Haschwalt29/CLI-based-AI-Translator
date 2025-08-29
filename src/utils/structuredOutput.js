/**
 * Structured Output Utility
 * 
 * This utility handles formatting and validation of translation responses
 * to ensure consistent JSON output format across the application.
 */

/**
 * Default translation response structure
 */
const DEFAULT_RESPONSE_STRUCTURE = {
  source_language: '',
  target_language: '',
  translated_text: '',
  status: 'success',
  timestamp: '',
  confidence: 1.0,
  cultural_notes: '',
  error: null
};

/**
 * Format translation output into structured JSON
 * @param {Object} data - Translation data
 * @returns {Object} Formatted structured output
 */
export const formatStructuredOutput = (data) => {
  const timestamp = new Date().toISOString();
  
  return {
    ...DEFAULT_RESPONSE_STRUCTURE,
    ...data,
    timestamp,
    // Ensure required fields are present
    source_language: data.source_language || 'auto-detected',
    target_language: data.target_language || '',
    translated_text: data.translated_text || '',
    status: data.status || 'success'
  };
};

/**
 * Validate structured output format
 * @param {Object} output - Output to validate
 * @returns {boolean} Whether the output is valid
 */
export const validateStructuredOutput = (output) => {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const requiredFields = ['source_language', 'target_language', 'translated_text', 'status'];
  return requiredFields.every(field => output.hasOwnProperty(field));
};

/**
 * Create error response
 * @param {string} error - Error message
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @returns {Object} Error response structure
 */
export const createErrorResponse = (error, sourceLang = 'unknown', targetLang = 'unknown') => {
  return formatStructuredOutput({
    source_language: sourceLang,
    target_language: targetLang,
    translated_text: '',
    status: 'error',
    error: error
  });
};

/**
 * Create success response
 * @param {string} translatedText - Translated text
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @param {Object} additionalData - Additional response data
 * @returns {Object} Success response structure
 */
export const createSuccessResponse = (translatedText, sourceLang, targetLang, additionalData = {}) => {
  return formatStructuredOutput({
    source_language: sourceLang,
    target_language: targetLang,
    translated_text: translatedText,
    status: 'success',
    ...additionalData
  });
};

/**
 * Pretty print structured output
 * @param {Object} output - Output to format
 * @returns {string} Formatted string
 */
export const prettyPrintOutput = (output) => {
  if (!validateStructuredOutput(output)) {
    return 'Invalid output format';
  }

  const statusIcon = output.status === 'success' ? '✅' : '❌';
  const confidence = output.confidence ? ` (${Math.round(output.confidence * 100)}% confidence)` : '';
  
  return `
${statusIcon} Translation ${output.status.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: ${output.source_language}
To: ${output.target_language}
${confidence}

Translated Text:
"${output.translated_text}"

${output.cultural_notes ? `Cultural Notes: ${output.cultural_notes}\n` : ''}${output.timestamp ? `Timestamp: ${output.timestamp}` : ''}
`.trim();
};

// Example usage:
/*
import { 
  formatStructuredOutput, 
  createErrorResponse, 
  createSuccessResponse,
  prettyPrintOutput 
} from './structuredOutput.js';

// Format raw data
const formatted = formatStructuredOutput({
  source_language: 'English',
  target_language: 'Spanish',
  translated_text: 'Hola mundo'
});

// Create error response
const error = createErrorResponse('Translation failed', 'English', 'Spanish');

// Create success response
const success = createSuccessResponse('Hola mundo', 'English', 'Spanish', {
  confidence: 0.95,
  cultural_notes: 'Direct translation'
});

console.log(prettyPrintOutput(formatted));
console.log(prettyPrintOutput(error));
console.log(prettyPrintOutput(success));
*/
