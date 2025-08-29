/**
 * Token Logger Utility
 * 
 * This utility logs token usage information after every Gemini API call
 * to help monitor API costs and usage patterns.
 */

/**
 * Log token usage information
 * @param {Object} usageMetadata - Token usage metadata from Gemini API
 * @returns {Promise<void>}
 */
export const logTokens = async (usageMetadata) => {
  if (!usageMetadata) {
    console.log('⚠️  No token usage data available');
    return;
  }

  const {
    promptTokenCount = 0,
    candidatesTokenCount = 0,
    totalTokenCount = 0
  } = usageMetadata;

  const timestamp = new Date().toISOString();
  
  // Calculate costs (approximate, based on Gemini pricing)
  const promptCost = (promptTokenCount / 1000) * 0.0005; // $0.0005 per 1K tokens
  const completionCost = (candidatesTokenCount / 1000) * 0.0015; // $0.0015 per 1K tokens
  const totalCost = promptCost + completionCost;

  console.log(`
🔢 Token Usage Report (${timestamp})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Prompt Tokens: ${promptTokenCount.toLocaleString()}
🎯 Completion Tokens: ${candidatesTokenCount.toLocaleString()}
📊 Total Tokens: ${totalTokenCount.toLocaleString()}
💰 Estimated Cost: $${totalCost.toFixed(6)}

📈 Usage Statistics:
• Prompt efficiency: ${promptTokenCount > 0 ? ((promptTokenCount / totalTokenCount) * 100).toFixed(1) : 0}%
• Response efficiency: ${candidatesTokenCount > 0 ? ((candidatesTokenCount / totalTokenCount) * 100).toFixed(1) : 0}%
`.trim());

  // Store usage data for analytics (optional)
  await storeTokenUsage({
    timestamp,
    promptTokens: promptTokenCount,
    completionTokens: candidatesTokenCount,
    totalTokens: totalTokenCount,
    estimatedCost: totalCost
  });
};

/**
 * Store token usage data for analytics
 * @param {Object} usageData - Token usage data
 * @returns {Promise<void>}
 */
const storeTokenUsage = async (usageData) => {
  try {
    // In a real application, you might want to store this in a database
    // For now, we'll just log it to console
    console.log('💾 Token usage data stored for analytics');
    
    // You could implement database storage here:
    // await db.tokenUsage.create(usageData);
    
  } catch (error) {
    console.error('❌ Failed to store token usage data:', error.message);
  }
};

/**
 * Get token usage summary
 * @returns {Object} Summary of token usage
 */
export const getTokenUsageSummary = () => {
  // This could return cached or aggregated usage data
  return {
    totalRequests: 0,
    totalTokens: 0,
    estimatedTotalCost: 0,
    averageTokensPerRequest: 0
  };
};

/**
 * Format token count for display
 * @param {number} count - Token count
 * @returns {string} Formatted token count
 */
export const formatTokenCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Calculate cost estimate for tokens
 * @param {number} promptTokens - Number of prompt tokens
 * @param {number} completionTokens - Number of completion tokens
 * @returns {number} Estimated cost in USD
 */
export const calculateCost = (promptTokens, completionTokens) => {
  const promptCost = (promptTokens / 1000) * 0.0005;
  const completionCost = (completionTokens / 1000) * 0.0015;
  return promptCost + completionCost;
};

// Example usage:
/*
import { logTokens, formatTokenCount, calculateCost } from './tokenLogger.js';

// Log tokens after API call
await logTokens({
  promptTokenCount: 150,
  candidatesTokenCount: 75,
  totalTokenCount: 225
});

// Format token counts
console.log(formatTokenCount(1500)); // "1.5K"
console.log(formatTokenCount(1500000)); // "1.5M"

// Calculate costs
const cost = calculateCost(150, 75);
console.log(`Estimated cost: $${cost.toFixed(6)}`);
*/
