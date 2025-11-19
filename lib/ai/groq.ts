/**
 * Legacy Groq module - now re-exports from the new AI service
 * This file is kept for backward compatibility
 * 
 * New implementation uses:
 * - Caching for improved performance
 * - Multiple AI providers with automatic fallback (OpenAI -> Groq -> Gemini)
 * - Better error handling
 */

// Re-export everything from the new service
export {
  generateExtractionSchema,
  generateSchemaFromHTML,
  summarizeResults,
  type SummaryRequest,
} from "./service";

// Also export from providers for advanced use cases
export { getAvailableProviders, generateWithFallback, retryWithBackoff } from "./providers";

// Export cache utilities for manual cache management
export { getCachedResponse, setCachedResponse, clearExpiredCache, getCacheStats } from "./cache";
