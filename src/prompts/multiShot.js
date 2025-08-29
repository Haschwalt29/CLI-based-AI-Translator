/**
 * Multi-Shot Prompt Template
 * 
 * This prompt template includes multiple examples to demonstrate various
 * translation patterns, idioms, and context-specific translations.
 * It's particularly useful for complex texts with cultural nuances.
 */

export const getMultiShotPrompt = (text, targetLang, sourceLang = null) => {
  const sourceLangInstruction = sourceLang 
    ? `The text is in ${sourceLang}.`
    : 'Please auto-detect the source language.';

  return `You are a professional translator with expertise in ${targetLang}. ${sourceLangInstruction}

Here are several examples of high-quality translations:

Example 1:
Input: "It's raining cats and dogs"
Source: English
Target: Spanish
Output: "Está lloviendo a cántaros"

Example 2:
Input: "The early bird catches the worm"
Source: English
Target: French
Output: "L'oiseau matinal attrape le ver"

Example 3:
Input: "Actions speak louder than words"
Source: English
Target: German
Output: "Taten sagen mehr als Worte"

Example 4:
Input: "Don't judge a book by its cover"
Source: English
Target: Italian
Output: "Non giudicare un libro dalla copertina"

Now please translate the following text to ${targetLang}, maintaining the same level of quality and cultural sensitivity:

"${text}"

Provide only the translated text without any additional explanations or formatting.`;
};

// Example usage:
/*
import { getMultiShotPrompt } from './multiShot.js';

const prompt = getMultiShotPrompt(
  "Time flies when you're having fun",
  "Japanese",
  "English"
);

console.log(prompt);
*/
