import { LRUCache } from "lru-cache";

type Identifier = string;

interface RateLimitOptions {
  intervalMs: number;
  uniqueTokenPerInterval: number;
}

const defaultOptions: RateLimitOptions = {
  intervalMs: 60_000,
  uniqueTokenPerInterval: 20,
};

const tokenCache = new LRUCache<Identifier, number>({
  max: 5_000,
  ttl: defaultOptions.intervalMs,
});

export const rateLimit = ({
  intervalMs,
  uniqueTokenPerInterval,
}: Partial<RateLimitOptions> = defaultOptions) => {
  const limiterOptions = {
    intervalMs: intervalMs ?? defaultOptions.intervalMs,
    uniqueTokenPerInterval:
      uniqueTokenPerInterval ?? defaultOptions.uniqueTokenPerInterval,
  };

  return {
    check: (identifier: Identifier) => {
      const tokenCount = tokenCache.get(identifier) ?? 0;
      if (tokenCount >= limiterOptions.uniqueTokenPerInterval) {
        return false;
      }
      tokenCache.set(identifier, tokenCount + 1, {
        ttl: limiterOptions.intervalMs,
      });
      return true;
    },
  };
};

