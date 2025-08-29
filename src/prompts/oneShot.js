/**
 * One-Shot Prompt Template
 * 
 * This prompt template includes one example to demonstrate the expected
 * input-output format. It helps the model understand the translation
 * style and format requirements better than zero-shot prompting.
 */

export const getOneShotPrompt = (text, targetLang, sourceLang = null) => {
  const sourceLangInstruction = sourceLang 
    ? `The text is in ${sourceLang}.`
    : 'Please auto-detect the source language.';

  return `You are a professional translator. ${sourceLangInstruction}

Here's an example of how to translate:

Input: "Good morning, how are you today?"
Source: English
Target: Spanish
Output: "Buenos días, ¿cómo estás hoy?"

Now please translate the following text to ${targetLang}:

"${text}"

Provide only the translated text without any additional explanations or formatting.`;
};

// Example usage:
/*
import { getOneShotPrompt } from './oneShot.js';

const prompt = getOneShotPrompt(
  "What time is the meeting?",
  "French",
  "English"
);

console.log(prompt);
*/
