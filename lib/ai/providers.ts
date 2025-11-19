import Groq from "groq-sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Provider configuration
 */
interface AIProvider {
  name: string;
  generate: (prompt: string, systemPrompt: string, temperature: number, maxTokens: number) => Promise<string>;
  available: boolean;
}

/**
 * Initialize OpenAI client
 */
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Initialize Groq client
 */
const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * Initialize Gemini client
 */
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * OpenAI Provider
 */
const openaiProvider: AIProvider = {
  name: "OpenAI",
  available: !!openaiClient,
  generate: async (prompt: string, systemPrompt: string, temperature: number, maxTokens: number) => {
    if (!openaiClient) throw new Error("OpenAI client not configured");
    
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");
    return content;
  },
};

/**
 * Groq Provider
 */
const groqProvider: AIProvider = {
  name: "Groq",
  available: !!groqClient,
  generate: async (prompt: string, systemPrompt: string, temperature: number, maxTokens: number) => {
    if (!groqClient) throw new Error("Groq client not configured");
    
    const response = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");
    return content;
  },
};

/**
 * Gemini Provider (Free tier)
 */
const geminiProvider: AIProvider = {
  name: "Gemini",
  available: !!geminiClient,
  generate: async (prompt: string, systemPrompt: string, temperature: number, maxTokens: number) => {
    if (!geminiClient) throw new Error("Gemini client not configured");
    
    const model = geminiClient.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      },
    });

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const content = response.text();
    
    if (!content) throw new Error("No response from Gemini");
    return content;
  },
};

/**
 * Get all available providers in priority order
 * Order: OpenAI -> Groq -> Gemini
 */
export function getAvailableProviders(): AIProvider[] {
  return [openaiProvider, groqProvider, geminiProvider].filter(p => p.available);
}

/**
 * Generate content with automatic fallback
 */
export async function generateWithFallback(
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.2,
  maxTokens: number = 600
): Promise<{ content: string; provider: string }> {
  const providers = getAvailableProviders();
  
  if (providers.length === 0) {
    throw new Error("No AI providers configured. Please set OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY");
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`[AI] Attempting ${provider.name}...`);
      const content = await provider.generate(prompt, systemPrompt, temperature, maxTokens);
      console.log(`[AI] ✓ Success with ${provider.name}`);
      return { content, provider: provider.name };
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      console.warn(`[AI] ✗ ${provider.name} failed:`, err.message);
      lastError = error as Error;
      
      // If it's a rate limit error, try next provider immediately
      if (err?.status === 429 || err?.message?.includes("rate_limit")) {
        console.log(`[AI] Rate limit hit on ${provider.name}, trying next provider...`);
        continue;
      }
      
      // For other errors, also try next provider
      continue;
    }
  }

  // All providers failed
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Retry logic with exponential backoff for a single provider
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      lastError = error as Error;

      // Check if it's a rate limit error
      if (err?.status === 429 || err?.message?.includes("rate_limit")) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Rate limit hit. Retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it's not a rate limit error, throw immediately
      throw error;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

