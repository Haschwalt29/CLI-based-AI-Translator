/**
 * Gemini Function Calling Schema
 * 
 * This file defines the function calling schema for the Gemini API
 * to ensure structured output from translation requests.
 */

/**
 * Get the function calling schema for translation
 * @returns {Object} Function declaration schema for Gemini
 */
export const getFunctionSchema = () => {
  return {
    name: "translate_text",
    description: "Translate text from one language to another with structured output",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The original text to be translated"
        },
        sourceLang: {
          type: "string",
          description: "The detected or specified source language"
        },
        targetLang: {
          type: "string",
          description: "The target language for translation"
        },
        translatedText: {
          type: "string",
          description: "The translated text in the target language"
        },
        confidence: {
          type: "number",
          description: "Confidence level of the translation (0-1)"
        },
        culturalNotes: {
          type: "string",
          description: "Any cultural context or notes about the translation"
        }
      },
      required: ["text", "sourceLang", "targetLang", "translatedText"]
    }
  };
};

/**
 * Get simplified function schema for basic translation
 * @returns {Object} Simplified function declaration schema
 */
export const getSimpleFunctionSchema = () => {
  return {
    name: "translate_text",
    description: "Translate text from one language to another",
    parameters: {
      type: "object",
      properties: {
        sourceLang: {
          type: "string",
          description: "The detected or specified source language"
        },
        targetLang: {
          type: "string",
          description: "The target language for translation"
        },
        translatedText: {
          type: "string",
          description: "The translated text in the target language"
        }
      },
      required: ["sourceLang", "targetLang", "translatedText"]
    }
  };
};

/**
 * Validate function call arguments
 * @param {Object} args - Function call arguments
 * @returns {boolean} Whether the arguments are valid
 */
export const validateFunctionArgs = (args) => {
  if (!args) return false;
  
  const required = ['sourceLang', 'targetLang', 'translatedText'];
  return required.every(field => args[field] && typeof args[field] === 'string');
};

// Example usage:
/*
import { getFunctionSchema, getSimpleFunctionSchema } from './functions.js';

const fullSchema = getFunctionSchema();
const simpleSchema = getSimpleFunctionSchema();

console.log('Full schema:', fullSchema);
console.log('Simple schema:', simpleSchema);
*/
