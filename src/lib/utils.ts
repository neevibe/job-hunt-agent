import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS class names with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp to time string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format currency in INR (lakhs/crores) or other currencies
 */
export function formatSalary(min?: number | null, max?: number | null, currency: string = 'INR'): string {
  if (!min && !max) return '—';
  const fmt = (v: number) => {
    if (currency === 'INR') {
      if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
      if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
      return `₹${v.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

/**
 * Relative time formatting (e.g., "2 hours ago")
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return formatDate(d);
}

/**
 * Generate a deduplication hash from job attributes
 */
export function generateDeduplicationHash(
  company: string,
  title: string,
  location: string,
  descriptionSnippet?: string
): string {
  const normalizedCompany = company.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normalizedTitle = title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normalizedLocation = location.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const snippet = (descriptionSnippet || '').toLowerCase().trim().slice(0, 200).replace(/[^a-z0-9]/g, '');
  
  const raw = `${normalizedCompany}|${normalizedTitle}|${normalizedLocation}|${snippet}`;
  
  // Simple hash function for browser/edge compatibility
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return `dedupe_${Math.abs(hash).toString(36)}`;
}

/**
 * Get match level info from a score
 */
export function getMatchLevel(score: number): {
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  action: string;
} {
  if (score >= 90) return { emoji: '🔥', label: 'Excellent Match', color: 'text-green-400', bgColor: 'bg-green-500/20', action: 'Priority Auto Apply' };
  if (score >= 85) return { emoji: '🟢', label: 'Strong Match', color: 'text-green-400', bgColor: 'bg-green-500/20', action: 'Auto Apply' };
  if (score >= 75) return { emoji: '🟡', label: 'Good Match', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', action: 'Apply if capacity' };
  if (score >= 65) return { emoji: '🟠', label: 'Potential Match', color: 'text-orange-400', bgColor: 'bg-orange-500/20', action: 'Review' };
  return { emoji: '🔴', label: 'Weak Match', color: 'text-red-400', bgColor: 'bg-red-500/20', action: 'Skip' };
}

/**
 * Application queue status types
 */
export const QUEUE_STATUSES = [
  'discovered',
  'analyzing',
  'qualified',
  'cv_generating',
  'cv_validating',
  'ready',
  'queued',
  'applying',
  'submitted',
  'submission_unconfirmed',
  'failed',
  'retry',
  'human_review',
  'skipped',
  'duplicate',
] as const;

export type QueueStatus = typeof QUEUE_STATUSES[number];

/**
 * Platform names
 */
export const PLATFORMS = [
  'linkedin',
  'naukri',
  'wellfound',
  'instahyre',
  'greenhouse',
  'lever',
  'workday',
  'career_page',
  'other',
] as const;

export type Platform = typeof PLATFORMS[number];

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random delay between min and max milliseconds (for natural timing)
 */
export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(delay);
}

/**
 * Generate a CV version identifier
 */
export function generateCVVersionId(companyName: string, jobTitle: string): string {
  const date = new Date().toISOString().split('T')[0];
  const company = companyName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
  const title = jobTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
  const seq = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `CV-${date}-${company}-${title}-${seq}`;
}
