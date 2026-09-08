import { type JobSourceAdapter, type Platform } from './types';
import { greenhouseAdapter } from './greenhouse';
import { leverAdapter } from './lever';
import { linkedInAdapter } from './linkedin';
import { naukriAdapter } from './naukri';
import { wellfoundAdapter } from './wellfound';
import { instahyreAdapter } from './instahyre';
import { workdayAdapter } from './workday';
import { careerPageAdapter } from './career-page';

/**
 * Platform Registry
 * Manages all job source adapters, their rate limits, and daily allocations.
 */

export interface PlatformAllocation {
  platform: Platform;
  dailyTarget: number;
  used: number;
  remaining: number;
}

export class PlatformRegistry {
  private adapters: Map<Platform, JobSourceAdapter> = new Map();
  private allocations: Map<Platform, PlatformAllocation> = new Map();
  private lastRequest: Map<Platform, number> = new Map();
  private requestHistory: Map<Platform, number[]> = new Map();

  /**
   * Register a job source adapter and configure its default daily allocation
   */
  register(adapter: JobSourceAdapter): void {
    this.adapters.set(adapter.platform, adapter);
    if (!this.allocations.has(adapter.platform)) {
      this.allocations.set(adapter.platform, {
        platform: adapter.platform,
        dailyTarget: adapter.rateLimit.maxApplicationsPerDay,
        used: 0,
        remaining: adapter.rateLimit.maxApplicationsPerDay,
      });
    }
    if (!this.requestHistory.has(adapter.platform)) {
      this.requestHistory.set(adapter.platform, []);
    }
  }

  /**
   * Retrieve adapter instance by platform identifier
   */
  getAdapter(platform: Platform): JobSourceAdapter | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Return all registered adapters
   */
  getAllAdapters(): JobSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Return adapters that still have remaining daily application capacity
   */
  getActiveAdapters(): JobSourceAdapter[] {
    return Array.from(this.adapters.values()).filter((adapter) => {
      const alloc = this.allocations.get(adapter.platform);
      return !alloc || alloc.remaining > 0;
    });
  }

  /**
   * Set target daily application count for a specific platform
   */
  setDailyAllocation(platform: Platform, target: number): void {
    const current = this.allocations.get(platform);
    const used = current?.used ?? 0;
    const remaining = Math.max(0, target - used);
    this.allocations.set(platform, {
      platform,
      dailyTarget: target,
      used,
      remaining,
    });
  }

  /**
   * Retrieve all current platform allocations
   */
  getAllocations(): PlatformAllocation[] {
    return Array.from(this.allocations.values());
  }

  /**
   * Retrieve allocation for a specific platform
   */
  getAllocation(platform: Platform): PlatformAllocation | undefined {
    return this.allocations.get(platform);
  }

  /**
   * Check if a request can be executed within rate limits:
   * 1. Minimum delay elapsed since last request
   * 2. Within max requests per minute window
   * 3. Within max requests per hour window
   */
  canMakeRequest(platform: Platform): boolean {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return false;
    }

    const now = Date.now();
    const lastTime = this.lastRequest.get(platform);

    // Enforce minimum delay between requests
    if (lastTime && now - lastTime < adapter.rateLimit.minDelayBetweenRequestsMs) {
      return false;
    }

    const history = this.requestHistory.get(platform) || [];
    const oneMinuteAgo = now - 60_000;
    const oneHourAgo = now - 3_600_000;

    // Enforce minute limit
    const recentMinuteCount = history.filter((t) => t >= oneMinuteAgo).length;
    if (recentMinuteCount >= adapter.rateLimit.maxRequestsPerMinute) {
      return false;
    }

    // Enforce hour limit
    const recentHourCount = history.filter((t) => t >= oneHourAgo).length;
    if (recentHourCount >= adapter.rateLimit.maxRequestsPerHour) {
      return false;
    }

    return true;
  }

  /**
   * Track request timing and record in history for rate limit sliding windows
   */
  recordRequest(platform: Platform): void {
    const now = Date.now();
    this.lastRequest.set(platform, now);

    const history = this.requestHistory.get(platform) || [];
    const oneHourAgo = now - 3_600_000;
    // Keep window bounded within 1 hour
    const pruned = history.filter((t) => t >= oneHourAgo);
    pruned.push(now);
    this.requestHistory.set(platform, pruned);
  }

  /**
   * Record a completed job application and decrement remaining daily quota
   */
  recordApplication(platform: Platform): void {
    const alloc = this.allocations.get(platform);
    if (alloc) {
      alloc.used += 1;
      alloc.remaining = Math.max(0, alloc.dailyTarget - alloc.used);
    }
  }

  /**
   * If one platform has exhausted its daily quota, redistribute surplus capacity
   * to other active platforms that have headroom below their adapter limits.
   */
  redistributeCapacity(): void {
    const exhaustedPlatforms: Platform[] = [];
    for (const [platform, alloc] of this.allocations.entries()) {
      if (alloc.remaining === 0) {
        exhaustedPlatforms.push(platform);
      }
    }

    if (exhaustedPlatforms.length === 0) {
      return;
    }

    // Identify platforms with headroom
    const eligiblePlatforms: { platform: Platform; headroom: number }[] = [];
    for (const [platform, alloc] of this.allocations.entries()) {
      const adapter = this.adapters.get(platform);
      if (!adapter) continue;
      const maxDaily = adapter.rateLimit.maxApplicationsPerDay;
      const headroom = maxDaily - alloc.dailyTarget;
      if (alloc.remaining > 0 && headroom > 0) {
        eligiblePlatforms.push({ platform, headroom });
      }
    }

    if (eligiblePlatforms.length === 0) {
      return;
    }

    // Rebalance capacity
    const bonusPerPlatform = Math.max(1, Math.floor(10 / eligiblePlatforms.length));
    for (const eligible of eligiblePlatforms) {
      const alloc = this.allocations.get(eligible.platform);
      if (alloc) {
        const added = Math.min(eligible.headroom, bonusPerPlatform);
        alloc.dailyTarget += added;
        alloc.remaining += added;
      }
    }
  }

  /**
   * Reset all daily counters and request history at the start of a new day
   */
  resetDaily(): void {
    for (const alloc of this.allocations.values()) {
      alloc.used = 0;
      alloc.remaining = alloc.dailyTarget;
    }
    this.lastRequest.clear();
    this.requestHistory.clear();
  }
}

// Export singleton instance initialized with standard adapters
export const platformRegistry = new PlatformRegistry();

platformRegistry.register(greenhouseAdapter);
platformRegistry.register(leverAdapter);
platformRegistry.register(linkedInAdapter);
platformRegistry.register(naukriAdapter);
platformRegistry.register(wellfoundAdapter);
platformRegistry.register(instahyreAdapter);
platformRegistry.register(workdayAdapter);
platformRegistry.register(careerPageAdapter);
