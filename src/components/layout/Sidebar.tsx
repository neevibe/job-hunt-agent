'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Search,
  Briefcase,
  FileText,
  AlertCircle,
  TrendingUp,
  Brain,
  Settings,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Configuration item for sidebar navigation links.
 */
export interface NavItemConfig {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label for the link */
  label: string;
  /** Target route href */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
}

/**
 * Props for the Sidebar component.
 */
export interface SidebarProps {
  /** Optional current active path to highlight the matching nav item */
  activePath?: string;
  /** Optional map of counts by nav item href, id, or label */
  counts?: Record<string, number>;
  /** Initial autonomous mode state (default: false) */
  initialAutonomous?: boolean;
  /** Optional callback fired when autonomous mode is toggled */
  onAutonomousChange?: (isAutonomous: boolean) => void;
  /** Optional last scan timestamp text (default: formatted current time or "10:42 AM") */
  lastScanTime?: string;
  /** Optional text displayed when autonomous mode is active (default: "37 / 100 today") */
  autonomousCountText?: string;
  /** Optional extra CSS class names */
  className?: string;
}

/**
 * Default navigation items for the application sidebar.
 */
export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: BarChart3 },
  { id: 'jobs', label: 'Jobs', href: '/jobs', icon: Search },
  { id: 'applications', label: 'Applications', href: '/applications', icon: Briefcase },
  { id: 'cv-studio', label: 'CV Studio', href: '/cv-studio', icon: FileText },
  { id: 'review', label: 'Review Queue', href: '/review', icon: AlertCircle },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { id: 'interview', label: 'Interview Prep', href: '/interview', icon: Brain },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Determines whether a navigation item is active given the current path.
 *
 * @param itemHref - The destination href of the nav item
 * @param currentPath - The current active pathname
 * @returns True if the item should be highlighted as active
 */
export function isNavItemActive(itemHref: string, currentPath: string): boolean {
  if (itemHref === '/') {
    return currentPath === '/';
  }
  const normalizedCurrent = currentPath.split('?')[0].split('#')[0];
  const normalizedItem = itemHref.split('?')[0].split('#')[0];

  return (
    normalizedCurrent === normalizedItem ||
    normalizedCurrent.startsWith(`${normalizedItem}/`)
  );
}

/**
 * Resolves the numeric count to display for a navigation item.
 * Supports lookups by href (e.g., '/jobs'), route id ('jobs'), or label ('Jobs').
 *
 * @param item - The navigation item configuration
 * @param counts - Optional dictionary of counts
 * @returns The resolved number if greater than 0, otherwise undefined
 */
export function resolveItemCount(
  item: NavItemConfig,
  counts?: Record<string, number>
): number | undefined {
  if (!counts) return undefined;

  const count =
    counts[item.href] ??
    counts[item.href.replace(/^\//, '')] ??
    counts[item.id] ??
    counts[item.label] ??
    counts[item.label.toLowerCase()];

  return typeof count === 'number' && count > 0 ? count : undefined;
}

/**
 * Shared application sidebar with navigation links, autonomous mode toggle,
 * and AI agent status indicator.
 */
export function Sidebar({
  activePath,
  counts,
  initialAutonomous = false,
  onAutonomousChange,
  lastScanTime,
  autonomousCountText = '37 / 100 today',
  className = '',
}: SidebarProps) {
  const pathname = usePathname();
  const effectivePath = activePath ?? pathname ?? '/';

  const [isAutonomous, setIsAutonomous] = useState<boolean>(initialAutonomous);
  const [formattedScanTime, setFormattedScanTime] = useState<string>(
    lastScanTime ?? '10:42 AM'
  );

  useEffect(() => {
    setIsAutonomous(initialAutonomous);
  }, [initialAutonomous]);

  useEffect(() => {
    if (lastScanTime) {
      setFormattedScanTime(lastScanTime);
    } else {
      setFormattedScanTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }, [lastScanTime]);

  /**
   * Handles toggling autonomous mode and notifies parent if listener provided,
   * or triggers the autonomous API directly.
   */
  const handleToggleAutonomous = async () => {
    const nextState = !isAutonomous;
    setIsAutonomous(nextState);
    if (onAutonomousChange) {
      onAutonomousChange(nextState);
    } else {
      try {
        await fetch('/api/autonomous', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: nextState })
        });
      } catch (e) {
        console.error('Sidebar toggle failed:', e);
      }
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-4 flex flex-col z-30 ${className}`}
    >
      {/* App Logo */}
      <Link href="/" className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">
          Job Hunt Agent
        </span>
      </Link>

      {/* Autonomous Mode Toggle Card */}
      <div className="glass rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                isAutonomous ? 'bg-green-500 pulse-dot' : 'bg-gray-500'
              }`}
            />
            <span className="text-xs font-medium text-foreground">
              Autonomous Mode
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAutonomous}
            aria-label="Toggle Autonomous Mode"
            onClick={handleToggleAutonomous}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-card ${
              isAutonomous ? 'bg-green-600' : 'bg-secondary'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isAutonomous ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {isAutonomous && (
          <p className="text-xs text-green-400 mt-1 font-mono">
            {autonomousCountText}
          </p>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(item.href, effectivePath);
          const count = resolveItemCount(item, counts);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-600/20 text-green-400 font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {count !== undefined && (
                <span className="px-2 py-0.5 bg-green-600/30 text-green-400 rounded-full text-xs font-mono">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Agent Status Footer */}
      <div className="pt-4 mt-auto">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            <span className="text-xs font-medium text-green-400">AI Agent Active</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Last scan: {formattedScanTime}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
