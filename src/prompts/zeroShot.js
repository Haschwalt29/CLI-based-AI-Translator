/**
 * Zero-Shot Prompt Template
 * 
 * This prompt template provides basic translation instructions without any examples.
 * It's useful for simple, straightforward translation tasks where the model
 * can infer the expected output format from the instruction alone.
 */

export const getZeroShotPrompt = (text, targetLang, sourceLang = null) => {
  const sourceLangInstruction = sourceLang 
    ? `The text is in ${sourceLang}.`
    : 'Please auto-detect the source language.';

  return `You are a professional translator. ${sourceLangInstruction}

Please translate the following text to ${targetLang}:

"${text}"

Provide only the translated text without any additional explanations or formatting.`;
};

// Example usage:
/*
import { getZeroShotPrompt } from './zeroShot.js';

const prompt = getZeroShotPrompt(
  "Hello, how are you?",
  "Spanish",
  "English"
);

console.log(prompt);
*/
