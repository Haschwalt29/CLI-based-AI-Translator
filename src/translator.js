import { GoogleGenerativeAI } from '@google/generative-ai';
import { logTokens } from './utils/tokenLogger.js';
import { formatStructuredOutput } from './utils/structuredOutput.js';
import { getTranslationPrompt } from './prompts/dynamic.js';
import { getFunctionSchema } from './functions.js';
import { checkRAG } from './rag.js';

class TranzioTranslator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-pro',
    });
  }

  /**
   * Main translation method
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language
   * @param {string} sourceLang - Source language (optional, will auto-detect if not provided)
   * @returns {Object} Translation result
   */
  async translate(text, targetLang, sourceLang = null) {
    try {
      // Check RAG first
      const ragResult = await checkRAG(text, targetLang, sourceLang);
      if (ragResult) {
        return ragResult;
      }

      // Prepare prompt
      const prompt = getTranslationPrompt(text, targetLang, sourceLang);
      
      // Get function schema for structured output
      const functionSchema = getFunctionSchema();

      // Generate content with function calling
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
        tools: [{ functionDeclarations: [functionSchema] }],
      });

      const response = result.response;
      
      // Log token usage
      const usage = response?.usageMetadata;
      console.log("🔹 Tokens used:", usage);
      await logTokens(response.usageMetadata);

      // Extract function call result
      const functionCall = response.candidates[0].content.parts[0].functionCall;
      
      if (functionCall && functionCall.args) {
        const args = functionCall.args;
        return formatStructuredOutput({
          source_language: args.sourceLang || 'auto-detected',
          target_language: args.targetLang,
          translated_text: args.translatedText,
          status: 'success'
        });
      }

      // Fallback to text parsing if function calling fails
      const textResponse = response.text();
      return this.parseTextResponse(textResponse, targetLang, sourceLang);

    } catch (error) {
      console.error('Translation error:', error.message);
      return formatStructuredOutput({
        source_language: sourceLang || 'unknown',
        target_language: targetLang,
        translated_text: '',
        status: 'error',
        error: error.message
      });
    }
  }

  /**
   * Parse text response when function calling fails
   * @param {string} response - Raw text response from Gemini
   * @param {string} targetLang - Target language
   * @param {string} sourceLang - Source language
   * @returns {Object} Parsed result
   */
  parseTextResponse(response, targetLang, sourceLang) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return formatStructuredOutput(parsed);
      }

      // Fallback: return raw response
      return formatStructuredOutput({
        source_language: sourceLang || 'auto-detected',
        target_language: targetLang,
        translated_text: response.trim(),
        status: 'success'
      });
    } catch (parseError) {
      return formatStructuredOutput({
        source_language: sourceLang || 'unknown',
        target_language: targetLang,
        translated_text: response.trim(),
        status: 'partial_success',
        error: 'Failed to parse structured response'
      });
    }
  }

  /**
   * Get supported languages
   * @returns {Array} List of supported languages
   */
  getSupportedLanguages() {
    return [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
      'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi',
      'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
      'Turkish', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian'
    ];
  }
}

export default TranzioTranslator;
