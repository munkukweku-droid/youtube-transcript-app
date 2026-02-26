import { LRUCache } from "lru-cache";
import { createClient, RedisClientType } from 'redis';

// In-memory LRU cache as a default fallback. Stores up to 1000 entries with a
// default TTL of one hour.
const memoryCache = new LRUCache<string, any>({ max: 1000, ttl: 60 * 60 * 1000 });

let redisClient: RedisClientType | null = null;
const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => {
      console.error('Redis client error', err);
    });
    // Connect lazily; connection is awaited on first use
  } catch (err) {
    // Redis will remain null and fallback to memory cache
    console.error('Failed to configure Redis client', err);
  }
}

async function ensureRedisConnected() {
  if (redisClient && !redisClient.isOpen) {
    await redisClient.connect();
  }
}

/**
 * Retrieves a cached value from Redis or memory. If Redis is configured it
 * will be checked first; otherwise the in‑memory cache is used. Non‑existent
 * keys return undefined.
 *
 * @param key Cache key
 */
export async function getCache<T = any>(key: string): Promise<T | undefined> {
  // Prefer Redis if available
  if (redisClient) {
    await ensureRedisConnected();
    const data = await redisClient.get(key);
    if (data) {
      try {
        return JSON.parse(data) as T;
      } catch {
        return undefined;
      }
    }
  }
  return memoryCache.get(key);
}

/**
 * Stores a value in cache. If Redis is available the value will be stored
 * there with an expiration; otherwise it falls back to the in‑memory LRU
 * cache. Values are serialised to JSON for Redis storage.
 *
 * @param key Cache key
 * @param value Value to store
 * @param ttlMs Time to live in milliseconds
 */
export async function setCache<T = any>(key: string, value: T, ttlMs: number): Promise<void> {
  if (redisClient) {
    await ensureRedisConnected();
    try {
      await redisClient.set(key, JSON.stringify(value), { PX: ttlMs });
      return;
    } catch {
      // fall back to memory cache
    }
  }
  memoryCache.set(key, value, { ttl: ttlMs });
}