/**
 * RATE LIMITER
 *
 * Platform-specific rate limiting with sliding window,
 * exponential backoff, jitter, and cooldown periods.
 */

import { sleep } from '@/lib/utils';

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxApplicationsPerDay: number;
  minDelayBetweenRequestsMs: number;
  maxDelayBetweenRequestsMs: number;
}

interface RequestRecord {
  timestamp: number;
  type: 'search' | 'application' | 'other';
}

export class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private backoffMultiplier: Map<string, number> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  /**
   * Register rate limit config for a platform
   */
  registerPlatform(platform: string, config: RateLimitConfig): void {
    this.configs.set(platform, config);
    this.requests.set(platform, []);
    this.backoffMultiplier.set(platform, 1);
  }

  /**
   * Check if we can make a request to the platform
   */
  canRequest(platform: string): boolean {
    const config = this.configs.get(platform);
    if (!config) return true;

    const records = this.requests.get(platform) || [];
    const now = Date.now();

    // Clean old records
    const recentMinute = records.filter(r => now - r.timestamp < 60000);
    const recentHour = records.filter(r => now - r.timestamp < 3600000);

    // Check limits
    if (recentMinute.length >= config.maxRequestsPerMinute) return false;
    if (recentHour.length >= config.maxRequestsPerHour) return false;

    // Check minimum delay
    if (records.length > 0) {
      const lastRequest = records[records.length - 1];
      const elapsed = now - lastRequest.timestamp;
      const multiplier = this.backoffMultiplier.get(platform) || 1;
      const requiredDelay = config.minDelayBetweenRequestsMs * multiplier;
      if (elapsed < requiredDelay) return false;
    }

    return true;
  }

  /**
   * Wait until we can make a request, then record it
   */
  async acquire(platform: string, type: 'search' | 'application' | 'other' = 'other'): Promise<void> {
    const config = this.configs.get(platform);
    if (!config) return;

    // Wait until we can request
    let attempts = 0;
    while (!this.canRequest(platform)) {
      attempts++;
      if (attempts > 120) {
        throw new Error(`Rate limit timeout for ${platform}`);
      }
      await sleep(1000);
    }

    // Add jitter delay
    const multiplier = this.backoffMultiplier.get(platform) || 1;
    const minDelay = config.minDelayBetweenRequestsMs * multiplier;
    const maxDelay = config.maxDelayBetweenRequestsMs * multiplier;
    const jitter = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await sleep(jitter);

    // Record the request
    this.recordRequest(platform, type);
  }

  /**
   * Record a request
   */
  recordRequest(platform: string, type: 'search' | 'application' | 'other' = 'other'): void {
    const records = this.requests.get(platform) || [];
    records.push({ timestamp: Date.now(), type });
    this.requests.set(platform, records);

    // Clean old records (keep last hour)
    const now = Date.now();
    this.requests.set(
      platform,
      records.filter(r => now - r.timestamp < 3600000)
    );
  }

  /**
   * Record a failure and increase backoff
   */
  recordFailure(platform: string): void {
    const current = this.backoffMultiplier.get(platform) || 1;
    this.backoffMultiplier.set(platform, Math.min(current * 2, 32)); // Max 32x backoff
  }

  /**
   * Record a success and reset backoff
   */
  recordSuccess(platform: string): void {
    this.backoffMultiplier.set(platform, 1);
  }

  /**
   * Get today's application count for a platform
   */
  getTodayApplicationCount(platform: string): number {
    const records = this.requests.get(platform) || [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return records.filter(
      r => r.type === 'application' && r.timestamp >= todayStart.getTime()
    ).length;
  }

  /**
   * Check if we've hit the daily application limit for a platform
   */
  canApply(platform: string): boolean {
    const config = this.configs.get(platform);
    if (!config) return true;
    return this.getTodayApplicationCount(platform) < config.maxApplicationsPerDay;
  }

  /**
   * Reset daily counters
   */
  resetDaily(): void {
    for (const [platform, records] of this.requests) {
      this.requests.set(platform, records.filter(r => r.type !== 'application'));
      this.backoffMultiplier.set(platform, 1);
    }
  }
}

// Singleton
export const rateLimiter = new RateLimiter();

// Register default platform configs
rateLimiter.registerPlatform('greenhouse', {
  maxRequestsPerMinute: 20,
  maxRequestsPerHour: 200,
  maxApplicationsPerDay: 30,
  minDelayBetweenRequestsMs: 1000,
  maxDelayBetweenRequestsMs: 3000,
});

rateLimiter.registerPlatform('lever', {
  maxRequestsPerMinute: 15,
  maxRequestsPerHour: 150,
  maxApplicationsPerDay: 25,
  minDelayBetweenRequestsMs: 1500,
  maxDelayBetweenRequestsMs: 4000,
});

rateLimiter.registerPlatform('linkedin', {
  maxRequestsPerMinute: 5,
  maxRequestsPerHour: 50,
  maxApplicationsPerDay: 20,
  minDelayBetweenRequestsMs: 5000,
  maxDelayBetweenRequestsMs: 15000,
});

rateLimiter.registerPlatform('naukri', {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  maxApplicationsPerDay: 25,
  minDelayBetweenRequestsMs: 2000,
  maxDelayBetweenRequestsMs: 6000,
});

rateLimiter.registerPlatform('wellfound', {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 80,
  maxApplicationsPerDay: 15,
  minDelayBetweenRequestsMs: 2000,
  maxDelayBetweenRequestsMs: 5000,
});

rateLimiter.registerPlatform('instahyre', {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 60,
  maxApplicationsPerDay: 15,
  minDelayBetweenRequestsMs: 3000,
  maxDelayBetweenRequestsMs: 8000,
});
