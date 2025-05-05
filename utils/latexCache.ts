/**
 * LaTeX Cache Utility
 * Provides caching for compiled LaTeX documents to improve performance
 * and reduce unnecessary recompilation of unchanged documents.
 */

interface CacheEntry {
  pdfUrl: string;
  timestamp: number;
  hash: string;
}

class LaTeXCache {
  private cache: Map<string, CacheEntry>;
  private maxEntries: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxEntries = 50, ttlMinutes = 30) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Generate a simple hash for LaTeX content
   */
  private hashLatex(latex: string): string {
    let hash = 0;
    for (let i = 0; i < latex.length; i++) {
      const char = latex.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Add or update a cache entry
   */
  set(latex: string, pdfUrl: string): void {
    const hash = this.hashLatex(latex);

    // Clean cache if it's full
    if (this.cache.size >= this.maxEntries) {
      this.cleanCache();
    }

    this.cache.set(hash, {
      pdfUrl,
      timestamp: Date.now(),
      hash,
    });
  }

  /**
   * Retrieve a cached PDF URL if available
   */
  get(latex: string): string | null {
    const hash = this.hashLatex(latex);
    const entry = this.cache.get(hash);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(hash);
      return null;
    }

    return entry.pdfUrl;
  }

  /**
   * Clean expired or least recently used entries
   */
  private cleanCache(): void {
    const now = Date.now();

    // First, remove expired entries
    for (const [hash, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(hash);
      }
    }

    // If still too many entries, remove oldest
    if (this.cache.size >= this.maxEntries) {
      let oldest: [string, CacheEntry] | null = null;

      for (const entry of this.cache.entries()) {
        if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
          oldest = entry;
        }
      }

      if (oldest) {
        this.cache.delete(oldest[0]);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
const latexCache = new LaTeXCache();
export default latexCache;
