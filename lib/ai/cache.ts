import crypto from "crypto";

// In-memory cache for development and quick lookups
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();

// Cache TTL: 7 days
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a cache key from request parameters
 */
export function generateCacheKey(params: {
  type: string;
  instruction?: string;
  url?: string;
  htmlSnippet?: string;
  items?: unknown[];
}): string {
  const normalized = JSON.stringify(params, Object.keys(params).sort());
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Get cached AI response
 */
export async function getCachedResponse<T>(key: string): Promise<T | null> {
  // Check memory cache first
  const cached = memoryCache.get(key);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL) {
      console.log(`[AI Cache] HIT (memory) - key: ${key.slice(0, 12)}...`);
      return cached.data as T;
    } else {
      // Expired, remove it
      memoryCache.delete(key);
    }
  }

  // TODO: Add database cache lookup for persistent storage
  // This would query Supabase to store/retrieve cached responses
  
  console.log(`[AI Cache] MISS - key: ${key.slice(0, 12)}...`);
  return null;
}

/**
 * Store AI response in cache
 */
export async function setCachedResponse(key: string, data: unknown): Promise<void> {
  // Store in memory cache
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // TODO: Add database cache storage for persistent storage
  // This would insert into Supabase for long-term caching
  
  console.log(`[AI Cache] STORED - key: ${key.slice(0, 12)}...`);
}

/**
 * Clear old cache entries (optional cleanup)
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  let cleared = 0;
  
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      memoryCache.delete(key);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`[AI Cache] Cleared ${cleared} expired entries`);
  }
}

/**
 * Clear specific cache entry by key
 */
export function clearCacheEntry(key: string): void {
  if (memoryCache.has(key)) {
    memoryCache.delete(key);
    console.log(`[AI Cache] Cleared entry - key: ${key.slice(0, 12)}...`);
  }
}

/**
 * Clear all cache entries matching a pattern
 */
export function clearCacheByPattern(pattern: { url?: string; type?: string }): void {
  let cleared = 0;
  const normalizedPattern = JSON.stringify(pattern, Object.keys(pattern).sort()).toLowerCase();
  
  for (const [key] of memoryCache.entries()) {
    // If the key might match this pattern, clear it
    if (key.includes(normalizedPattern.slice(0, 20))) {
      memoryCache.delete(key);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`[AI Cache] Cleared ${cleared} entries matching pattern`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memorySize: memoryCache.size,
    oldestEntry: Math.min(
      ...Array.from(memoryCache.values()).map(v => v.timestamp)
    ),
  };
}

