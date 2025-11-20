/**
 * Simple in-memory rate limiting for API endpoints
 * Note: For production, consider using a dedicated service like Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultWindow: number = 60000; // 1 minute in milliseconds

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (e.g., IP address or user ID)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limit exceeded, false otherwise
   */
  isLimited(
    key: string,
    maxRequests: number = 10,
    windowMs: number = this.defaultWindow
  ): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First request from this key
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return false;
    }

    if (now > entry.resetTime) {
      // Reset window has passed
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return false;
    }

    // Within the same window
    entry.count++;
    return entry.count > maxRequests;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(
    key: string,
    maxRequests: number = 10,
    windowMs: number = this.defaultWindow
  ): number {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      return maxRequests;
    }

    if (now > entry.resetTime) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number | null {
    const entry = this.limits.get(key);
    if (!entry) return null;

    const resetTime = entry.resetTime;
    const now = Date.now();

    return resetTime > now ? resetTime - now : 0;
  }

  /**
   * Clear specific key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all entries
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Cleanup old entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Middleware function to apply rate limiting
 */
export function createRateLimitMiddleware(
  maxRequests: number = 10,
  windowMs: number = 60000
) {
  return (getKey: (req: Request) => string) => {
    return (req: Request): boolean => {
      const key = getKey(req);
      return rateLimiter.isLimited(key, maxRequests, windowMs);
    };
  };
}

export default rateLimiter;
