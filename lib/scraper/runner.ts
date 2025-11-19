/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";

type Selector = {
  field: string;
  selector: string;
  attribute?: string;
};

interface ExtractionSchema {
  selectors: Selector[];
  filters?: string[] | Record<string, any>;
}

interface ScrapeResult {
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export const runScrape = async (targetUrl: string, schema: ExtractionSchema): Promise<ScrapeResult[]> => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    userAgent: process.env.SCRAPER_DEFAULT_USER_AGENT,
  });

  try {
    // Use a more robust wait strategy
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });

    const primarySelector = schema.selectors[0]?.selector ?? "body";
    try {
      await page.waitForSelector(primarySelector, { timeout: 10_000 });
    } catch {
      console.warn(`Primary selector ${primarySelector} not found after timeout`);
    }

    const content = await page.content();
    const root = parse(content);

    const results: ScrapeResult[] = [];
    const nodes = root.querySelectorAll(primarySelector);

    console.log(`[Scraper] Found ${nodes.length} nodes matching "${primarySelector}"`);

    if (nodes.length === 0) {
      throw new Error(`No elements found with selector "${primarySelector}". The page structure may have changed. Try regenerating the schema.`);
    }

    for (const node of nodes) {
      const metadata: Record<string, unknown> = {};
      for (const selector of schema.selectors) {
        if (selector.selector !== primarySelector) {
          const nested = node.querySelector(selector.selector);
          metadata[selector.field] = sanitizeHtml(
            selector.attribute ? nested?.getAttribute(selector.attribute) ?? "" : nested?.text ?? "",
          ).trim();
        } else {
          metadata[selector.field] = sanitizeHtml(
            selector.attribute ? node.getAttribute(selector.attribute) ?? "" : node.text ?? "",
          ).trim();
        }
      }

      // Apply filters
      if (schema.filters) {
        let pass = true;
        // Handle both array and object format for filters (AI might return either)
        const filters = Array.isArray(schema.filters) ? schema.filters : Object.entries(schema.filters).map(([key, val]) => ({ field: key, ...val }));

        for (const filter of filters as any[]) {
          const field = filter.field || filter.key; // Adjust based on actual schema structure
          const value = metadata[field];
          if (value === undefined) continue;

          const numValue = parseFloat((value as string).replace(/[^0-9.-]/g, ""));
          const targetValue = filter.value;

          if (!isNaN(numValue) && typeof targetValue === 'number') {
            if (filter.operator === ">" && !(numValue > targetValue)) pass = false;
            if (filter.operator === "<" && !(numValue < targetValue)) pass = false;
            if (filter.operator === ">=" && !(numValue >= targetValue)) pass = false;
            if (filter.operator === "<=" && !(numValue <= targetValue)) pass = false;
            if (filter.operator === "=" && !(numValue === targetValue)) pass = false;
          }
        }
        if (!pass) continue;
      }

      const title =
        (metadata.title as string) ||
        (metadata.name as string) ||
        node.text.trim().slice(0, 80) ||
        targetUrl;
      const description =
        (metadata.description as string) ||
        sanitizeHtml(node.text).slice(0, 140);
      const link =
        (metadata.link as string) ||
        node.querySelector("a")?.getAttribute("href") ||
        targetUrl;
      let resolvedUrl = targetUrl;
      try {
        resolvedUrl = link.startsWith("http")
          ? link
          : new URL(link, targetUrl).toString();
      } catch {
        resolvedUrl = targetUrl;
      }
      results.push({
        title,
        description,
        url: resolvedUrl,
        metadata,
      });
    }

    return results.slice(0, 50);
  } finally {
    await browser.close();
  }
};
