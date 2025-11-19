/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple data sources that don't require complex scraping
 * These use public APIs and RSS feeds for reliable data
 */

interface SimpleFeed {
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fetch from HackerNews API (free, no auth required)
 */
export async function fetchHackerNews(limit: number = 10): Promise<SimpleFeed[]> {
  try {
    // Get top stories
    const topStoriesRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    const topStories = await topStoriesRes.json();
    
    // Fetch details for top N stories
    const stories = await Promise.all(
      topStories.slice(0, limit).map(async (id: number) => {
        const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return res.json();
      })
    );

    return stories.map((story: any) => ({
      title: story.title || "Untitled",
      description: story.text || `Score: ${story.score} | ${story.descendants || 0} comments`,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      metadata: {
        score: story.score,
        comments: story.descendants || 0,
        author: story.by,
        time: new Date(story.time * 1000).toISOString(),
      },
    }));
  } catch (error) {
    console.error("[Simple Sources] HackerNews fetch failed:", error);
    return [];
  }
}

/**
 * Fetch from Reddit API (free, no auth required for public data)
 */
export async function fetchReddit(subreddit: string = "programming", limit: number = 10): Promise<SimpleFeed[]> {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DataScraper/1.0)',
      },
    });
    const data = await res.json();
    
    return data.data.children.map((child: any) => {
      const post = child.data;
      return {
        title: post.title,
        description: post.selftext?.slice(0, 200) || `${post.ups} upvotes | ${post.num_comments} comments`,
        url: post.url.startsWith('/r/') ? `https://reddit.com${post.url}` : post.url,
        metadata: {
          upvotes: post.ups,
          comments: post.num_comments,
          author: post.author,
          subreddit: post.subreddit,
          created: new Date(post.created_utc * 1000).toISOString(),
        },
      };
    });
  } catch (error) {
    console.error("[Simple Sources] Reddit fetch failed:", error);
    return [];
  }
}

/**
 * Parse generic RSS feed
 */
export async function fetchRSS(feedUrl: string, limit: number = 10): Promise<SimpleFeed[]> {
  try {
    const res = await fetch(feedUrl);
    const xml = await res.text();
    
    // Very basic RSS parsing (works for most feeds)
    const items: SimpleFeed[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const matches = xml.matchAll(itemRegex);
    
    for (const match of matches) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      
      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || "Untitled") : "Untitled";
      const description = descMatch ? (descMatch[1] || descMatch[2] || "") : "";
      const url = linkMatch ? linkMatch[1] : feedUrl;
      const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
      
      items.push({
        title: title.replace(/<[^>]*>/g, ''), // Strip HTML tags
        description: description.replace(/<[^>]*>/g, '').slice(0, 200),
        url,
        metadata: {
          pubDate,
          source: 'RSS',
        },
      });
      
      if (items.length >= limit) break;
    }
    
    return items;
  } catch (error) {
    console.error("[Simple Sources] RSS fetch failed:", error);
    return [];
  }
}

/**
 * Detect if a URL can use simple sources instead of scraping
 */
export function detectSimpleSource(url: string): { type: string; handler: () => Promise<SimpleFeed[]> } | null {
  const urlLower = url.toLowerCase();
  
  // HackerNews
  if (urlLower.includes('news.ycombinator.com') || urlLower.includes('hackernews')) {
    return {
      type: 'HackerNews API',
      handler: () => fetchHackerNews(20),
    };
  }
  
  // Reddit
  const redditMatch = urlLower.match(/reddit\.com\/r\/([^\/]+)/);
  if (redditMatch) {
    const subreddit = redditMatch[1];
    return {
      type: `Reddit API (r/${subreddit})`,
      handler: () => fetchReddit(subreddit, 20),
    };
  }
  
  // RSS feeds (common patterns)
  if (urlLower.includes('rss') || urlLower.includes('feed') || urlLower.endsWith('.xml')) {
    return {
      type: 'RSS Feed',
      handler: () => fetchRSS(url, 20),
    };
  }
  
  return null;
}

