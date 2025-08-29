/**
 * Chain-of-Thought Prompt Template
 * 
 * This prompt template guides the model through step-by-step reasoning
 * for complex translation tasks. It's particularly useful for texts
 * with cultural nuances, idioms, or technical terminology.
 */

export const getChainOfThoughtPrompt = (text, targetLang, sourceLang = null) => {
  const sourceLangInstruction = sourceLang 
    ? `The text is in ${sourceLang}.`
    : 'Please auto-detect the source language.';

  return `You are a professional translator with expertise in ${targetLang}. ${sourceLangInstruction}

Please translate the following text to ${targetLang} by following these steps:

1. First, identify the source language and any cultural context
2. Break down the text into logical components
3. Identify any idioms, metaphors, or cultural references
4. Consider the appropriate translation strategy for each component
5. Provide the final translation

Text to translate: "${text}"

Please think through this step by step and then provide your final translation.`;
};

// Example usage:
/*
import { getChainOfThoughtPrompt } from './chainOfThought.js';

const prompt = getChainOfThoughtPrompt(
  "It's a piece of cake",
  "Spanish",
  "English"
);

console.log(prompt);
*/
