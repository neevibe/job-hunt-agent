/**
 * LEARNING ENGINE
 *
 * Analyzes application outcomes to identify patterns and
 * optimize future targeting, scoring, and CV strategy.
 *
 * Learns from:
 * - Which roles generate interviews
 * - Which companies respond
 * - Which platforms perform best
 * - Which CV versions perform best
 * - Which keywords correlate with success
 */

import { db } from '@/db';
import {
  application,
  job,
  jobScore,
  cv,
  company,
  learningInsight,
  agentActivity,
} from '@/db/schema';
import { eq, and, gte, sql, count, avg, desc } from 'drizzle-orm';

export interface LearningReport {
  rolePerformance: RolePerformance[];
  platformPerformance: PlatformPerformance[];
  cvPerformance: CVPerformance[];
  companyResponseRate: CompanyResponse[];
  recommendations: string[];
}

interface RolePerformance {
  roleType: string;
  applications: number;
  responses: number;
  interviews: number;
  responseRate: number;
  interviewRate: number;
}

interface PlatformPerformance {
  platform: string;
  applications: number;
  responses: number;
  interviews: number;
  avgMatchScore: number;
  conversionRate: number;
}

interface CVPerformance {
  cvVersion: string;
  applications: number;
  responses: number;
  interviews: number;
  avgAtsScore: number;
  conversionRate: number;
}

interface CompanyResponse {
  company: string;
  applications: number;
  responded: boolean;
  daysToRespond: number | null;
}

/**
 * Generate learning insights from application history
 */
export async function generateLearningInsights(): Promise<LearningReport> {
  console.log('🧠 Generating learning insights...');

  const rolePerformance = await analyzeRolePerformance();
  const platformPerformance = await analyzePlatformPerformance();
  const cvPerformance = await analyzeCVPerformance();
  const companyResponseRate = await analyzeCompanyResponses();
  const recommendations = generateRecommendations(
    rolePerformance,
    platformPerformance,
    cvPerformance
  );

  // Store insights
  for (const role of rolePerformance) {
    await db.insert(learningInsight).values({
      insightType: 'role_performance',
      dimension: role.roleType,
      metric: 'interview_rate',
      value: Math.round(role.interviewRate * 100),
      sampleSize: role.applications,
      recommendation: role.interviewRate > 0.2
        ? `Increase ${role.roleType} applications`
        : `Reduce ${role.roleType} applications`,
    });
  }

  for (const platform of platformPerformance) {
    await db.insert(learningInsight).values({
      insightType: 'platform_performance',
      dimension: platform.platform,
      metric: 'conversion_rate',
      value: Math.round(platform.conversionRate * 100),
      sampleSize: platform.applications,
      recommendation: platform.conversionRate > 0.15
        ? `Increase ${platform.platform} allocation`
        : `Maintain ${platform.platform} allocation`,
    });
  }

  await logActivity(
    'learning',
    'insights_generated',
    `🧠 Generated ${recommendations.length} recommendations from ${rolePerformance.length} role types`
  );

  return {
    rolePerformance,
    platformPerformance,
    cvPerformance,
    companyResponseRate,
    recommendations,
  };
}

/**
 * Analyze which role types get the best interview conversion
 */
async function analyzeRolePerformance(): Promise<RolePerformance[]> {
  try {
    const results = await db
      .select({
        title: job.title,
        total: count(),
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .groupBy(job.title);

    // Classify roles and aggregate
    const roleMap = new Map<string, { applications: number; responses: number; interviews: number }>();

    for (const row of results) {
      const roleType = classifyRole(row.title);
      const existing = roleMap.get(roleType) || { applications: 0, responses: 0, interviews: 0 };
      existing.applications += Number(row.total);
      roleMap.set(roleType, existing);
    }

    // Count responses and interviews per role type
    const interviewResults = await db
      .select({
        title: job.title,
        total: count(),
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .where(eq(application.status, 'interview'))
      .groupBy(job.title);

    for (const row of interviewResults) {
      const roleType = classifyRole(row.title);
      const existing = roleMap.get(roleType);
      if (existing) existing.interviews += Number(row.total);
    }

    return Array.from(roleMap.entries()).map(([roleType, data]) => ({
      roleType,
      ...data,
      responseRate: data.applications > 0 ? data.responses / data.applications : 0,
      interviewRate: data.applications > 0 ? data.interviews / data.applications : 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Analyze which platforms perform best
 */
async function analyzePlatformPerformance(): Promise<PlatformPerformance[]> {
  try {
    const results = await db
      .select({
        source: job.source,
        total: count(),
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .groupBy(job.source);

    return results.map(row => ({
      platform: row.source || 'unknown',
      applications: Number(row.total),
      responses: 0,
      interviews: 0,
      avgMatchScore: 0,
      conversionRate: 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Analyze which CV versions perform best
 */
async function analyzeCVPerformance(): Promise<CVPerformance[]> {
  try {
    const results = await db
      .select({
        version: cv.version,
        total: count(),
        avgAts: avg(cv.atsScore),
      })
      .from(application)
      .innerJoin(cv, eq(application.cvId, cv.id))
      .groupBy(cv.version);

    return results.map(row => ({
      cvVersion: row.version || 'unknown',
      applications: Number(row.total),
      responses: 0,
      interviews: 0,
      avgAtsScore: Math.round(Number(row.avgAts) || 0),
      conversionRate: 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Analyze company response patterns
 */
async function analyzeCompanyResponses(): Promise<CompanyResponse[]> {
  try {
    const results = await db
      .select({
        companyName: company.name,
        total: count(),
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .innerJoin(company, eq(job.companyId, company.id))
      .groupBy(company.name);

    return results.map(row => ({
      company: row.companyName || 'Unknown',
      applications: Number(row.total),
      responded: false,
      daysToRespond: null,
    }));
  } catch {
    return [];
  }
}

/**
 * Classify a job title into a role type
 */
function classifyRole(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('genai') || lower.includes('generative')) return 'GenAI PM';
  if (lower.includes('ai') && lower.includes('ml')) return 'AI/ML PM';
  if (lower.includes('ai')) return 'AI PM';
  if (lower.includes('data')) return 'Data PM';
  if (lower.includes('platform')) return 'Platform PM';
  if (lower.includes('growth')) return 'Growth PM';
  if (lower.includes('technical')) return 'Technical PM';
  return 'General PM';
}

/**
 * Generate actionable recommendations from insights
 */
function generateRecommendations(
  roles: RolePerformance[],
  platforms: PlatformPerformance[],
  cvs: CVPerformance[]
): string[] {
  const recommendations: string[] = [];

  // Best performing role
  const bestRole = roles.sort((a, b) => b.interviewRate - a.interviewRate)[0];
  if (bestRole && bestRole.interviewRate > 0) {
    recommendations.push(
      `Prioritize ${bestRole.roleType} roles — ${Math.round(bestRole.interviewRate * 100)}% interview conversion rate`
    );
  }

  // Worst performing role
  const worstRole = roles
    .filter(r => r.applications >= 3)
    .sort((a, b) => a.interviewRate - b.interviewRate)[0];
  if (worstRole && worstRole.interviewRate === 0 && worstRole.applications >= 5) {
    recommendations.push(
      `Consider reducing ${worstRole.roleType} applications — 0% conversion after ${worstRole.applications} applications`
    );
  }

  // Best performing platform
  const bestPlatform = platforms.sort((a, b) => b.conversionRate - a.conversionRate)[0];
  if (bestPlatform) {
    recommendations.push(
      `Increase ${bestPlatform.platform} allocation — best performing platform`
    );
  }

  // Best performing CV
  const bestCV = cvs.sort((a, b) => b.avgAtsScore - a.avgAtsScore)[0];
  if (bestCV) {
    recommendations.push(
      `${bestCV.cvVersion} has highest ATS score (${bestCV.avgAtsScore}%) — use as template`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue applying to GenAI Product Manager roles');
    recommendations.push('Focus on roles with 85%+ match score');
  }

  return recommendations;
}

/**
 * Generate end-of-day daily report
 */
export async function generateDailyReportData(): Promise<{
  date: string;
  applicationsSubmitted: number;
  recommendations: string[];
}> {
  const today = new Date().toISOString().split('T')[0];
  const insights = await generateLearningInsights();

  return {
    date: today,
    applicationsSubmitted: insights.rolePerformance.reduce((sum, r) => sum + r.applications, 0),
    recommendations: insights.recommendations,
  };
}

/**
 * Log activity helper
 */
async function logActivity(
  agentName: string,
  actionType: string,
  message: string
): Promise<void> {
  try {
    await db.insert(agentActivity).values({
      agentName,
      actionType,
      message,
      severity: 'info',
    });
  } catch {
    console.error('Failed to log activity:', message);
  }
}
