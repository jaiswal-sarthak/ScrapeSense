import { generateCacheKey, getCachedResponse, setCachedResponse } from "./cache";
import { generateWithFallback, retryWithBackoff } from "./providers";

const SYSTEM_PROMPT = `You are an expert web scraper. Given a URL and user instruction, generate a JSON schema for extracting data.

SELECTOR PRIORITY (use in this order):
1. data-test attributes (e.g., [data-test^="post-item-"], [data-test="product-card"])
2. Semantic HTML tags (article, section, main)
3. Stable class patterns (avoid dynamic/hashed classes)
4. ID attributes

Return JSON with:
- selectors: array of {field, selector, attribute?}
- filters: optional array of {field, operator, value}
- summarize_prompt: brief description

For common sites:
- Product Hunt: use [data-test^="post-item-"] for items
- GitHub: use .Box-row or article
- Reddit: use [data-testid="post-container"]

Be precise and test-friendly.`;

interface GenerateSchemaParams {
  instruction: string;
  url: string;
}

export const generateExtractionSchema = async ({
  instruction,
  url,
}: GenerateSchemaParams) => {
  // Check cache first
  const cacheKey = generateCacheKey({ type: "schema", instruction, url });
  const cached = await getCachedResponse<Record<string, unknown>>(cacheKey);
  if (cached) {
    console.log("[AI] Using cached schema");
    return cached;
  }

  // Generate with fallback providers
  const prompt = `Target URL: ${url}\nInstruction: ${instruction}\nReturn JSON with selectors array (field, selector, attribute?), filters, summarize_prompt. IMPORTANT: The first selector MUST be the container for each item. Prioritize data-test attributes over classes. For Product Hunt, use [data-test^="post-item-"]. Other selectors should be relative to this container.`;

  const result = await retryWithBackoff(async () => {
    const { content, provider } = await generateWithFallback(
      prompt,
      SYSTEM_PROMPT,
      0.2,
      600
    );
    console.log(`[AI] Schema generated using ${provider}`);
    return JSON.parse(content);
  });

  // Cache the result
  await setCachedResponse(cacheKey, result);

  return result;
};

interface GenerateSchemaFromHTMLParams {
  url: string;
  instruction: string;
  htmlSnippet: string;
  patterns: {
    dataTestAttributes: string[];
    dataTestIdAttributes: string[];
    commonClasses: string[];
    repeatingSelectors: string[];
    semanticTags: string[];
  };
}

/**
 * Generate extraction schema by analyzing actual HTML content
 * This is more accurate than guessing based on URL alone
 */
export const generateSchemaFromHTML = async ({
  url,
  instruction,
  htmlSnippet,
  patterns,
}: GenerateSchemaFromHTMLParams) => {
  // Truncate HTML snippet if too large (to avoid token limits)
  // Groq free tier: 6000 tokens total (prompt + response)
  // ~1 char = ~0.75 tokens, so 2500 chars ≈ 1875 tokens
  const maxHtmlLength = 2500; // Safe limit for free tier
  const truncatedHtml = htmlSnippet.length > maxHtmlLength 
    ? htmlSnippet.slice(0, maxHtmlLength) + "\n... [HTML truncated to fit token limit]"
    : htmlSnippet;
  
  console.log(`[AI] HTML length: ${htmlSnippet.length} → ${truncatedHtml.length} chars`);

  // Check cache first
  const cacheKey = generateCacheKey({ 
    type: "schema-html", 
    instruction, 
    url,
    htmlSnippet: truncatedHtml.slice(0, 1000), // Use first 1000 chars for cache key
  });
  const cached = await getCachedResponse<Record<string, unknown>>(cacheKey);
  if (cached) {
    console.log("[AI] Using cached HTML-based schema");
    return cached;
  }

  const ENHANCED_PROMPT = `You are an expert web scraper analyzing ACTUAL HTML content.

Given:
1. URL: ${url}
2. User instruction: ${instruction}
3. HTML snippet from the page
4. Extracted patterns (data-test attributes, repeating elements, etc.)

Your task:
- Analyze the HTML to find the ACTUAL selectors that exist
- Generate a JSON schema with selectors that WORK on this specific page
- Prioritize: data-test > data-testid > semantic tags > stable classes

Return JSON with:
{
  "selectors": [
    {"field": "container", "selector": "[actual selector from HTML]"},
    {"field": "title", "selector": "[nested selector]"},
    {"field": "description", "selector": "[nested selector]"},
    ...
  ],
  "filters": [{"field": "votes", "operator": ">", "value": 50}],
  "summarize_prompt": "brief description"
}

IMPORTANT:
- First selector MUST be the container (repeating element)
- Use selectors that ACTUALLY EXIST in the HTML below
- For data-test attributes, use prefix matching: [data-test^="prefix"]
- Avoid dynamic/hashed class names`;

  const patternsText = `
Found patterns:
- data-test attributes: ${patterns.dataTestAttributes.slice(0, 10).join(', ')}
- data-testid attributes: ${patterns.dataTestIdAttributes.slice(0, 10).join(', ')}
- Repeating selectors: ${patterns.repeatingSelectors.slice(0, 5).join(', ')}
- Semantic tags: ${patterns.semanticTags.join(', ')}
`;

  const prompt = `${patternsText}

HTML snippet:
${truncatedHtml}

Generate the extraction schema based on this ACTUAL HTML.`;

  const result = await retryWithBackoff(async () => {
    const { content, provider } = await generateWithFallback(
      prompt,
      ENHANCED_PROMPT,
      0.1,
      800
    );
    console.log(`[AI] HTML-based schema generated using ${provider}`);
    return JSON.parse(content);
  }, 3, 2000);

  // Cache the result
  await setCachedResponse(cacheKey, result);

  return result;
};

export interface SummaryRequest {
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export const summarizeResults = async (items: SummaryRequest[]) => {
  // Check cache first
  const cacheKey = generateCacheKey({ type: "summary", items });
  const cached = await getCachedResponse<Record<string, unknown>>(cacheKey);
  if (cached) {
    console.log("[AI] Using cached summary");
    return cached;
  }

  const SUMMARY_PROMPT = "You analyze scraped updates and produce concise bullet summaries and notable changes. Return a JSON object with 'summary' (string) and 'highlights' (array of strings) fields.";
  const prompt = JSON.stringify(items);

  const result = await retryWithBackoff(async () => {
    const { content, provider } = await generateWithFallback(
      prompt,
      SUMMARY_PROMPT,
      0.4,
      400
    );
    console.log(`[AI] Summary generated using ${provider}`);
    return JSON.parse(content);
  });

  // Cache the result
  await setCachedResponse(cacheKey, result);

  return result;
};

