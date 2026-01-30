/**
 * ETag-based caching for GitHub API requests.
 *
 * Uses conditional requests with If-None-Match headers. When data hasn't changed,
 * GitHub returns 304 Not Modified without consuming rate limit quota.
 *
 * @see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api#use-conditional-requests-if-appropriate
 */

interface CacheEntry<T> {
  data: T;
  etag: string;
}

const cache = new Map<string, CacheEntry<any>>();

export function clearCache(): void {
  cache.clear();
}

/**
 * Fetch with ETag-based caching for GitHub API.
 *
 * @param url - GitHub API endpoint
 * @param options - Fetch options
 * @returns Cached or fresh data
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `fetch:${url}`;
  const cached = cache.get(cacheKey);

  const headers = new Headers(options?.headers);
  if (cached?.etag) {
    headers.set("If-None-Match", cached.etag);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 304 && cached) {
    return cached.data;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const etag = response.headers.get("ETag");

  if (etag) {
    cache.set(cacheKey, { data, etag });
  }

  return data;
}
