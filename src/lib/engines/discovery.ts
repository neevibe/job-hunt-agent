import { db } from '@/db';
import { job, company, agentActivity } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  type DiscoveredJob,
  type SearchQuery,
  DEFAULT_SEARCH_TITLES,
  DEFAULT_SEARCH_KEYWORDS,
} from '@/lib/platforms/types';
import { platformRegistry } from '@/lib/platforms/registry';
import { generateDeduplicationHash } from '@/lib/utils';
import { enqueue } from '@/lib/engines/application-queue';

export interface DiscoveryResult {
  discovered: number;
  new: number;
  newJobs: number;
  duplicates: number;
  byPlatform: Record<string, number>;
}

/**
 * Deduplicates a list of jobs based on content hashing and existing database records.
 * @param jobs List of discovered jobs
 * @returns Array of unique, new jobs to insert
 */
export async function deduplicateJobs(jobs: DiscoveredJob[]): Promise<DiscoveredJob[]> {
  const uniqueBatch = new Map<string, DiscoveredJob>();

  // Deduplicate within the current batch
  for (const j of jobs) {
    const hash = generateDeduplicationHash(j.company, j.title, j.location, j.description);

    if (uniqueBatch.has(hash)) {
      // Prefer direct company/ATS applications over aggregators
      if (j.source === 'workday' || j.source === 'greenhouse' || j.source === 'lever') {
        uniqueBatch.set(hash, j);
      }
    } else {
      uniqueBatch.set(hash, j);
    }
  }

  const result: DiscoveredJob[] = [];

  // Check against existing DB records
  for (const [, j] of uniqueBatch.entries()) {
    const exists = await db.query.job.findFirst({
      where: (jobTbl, { eq, or }) =>
        or(
          eq(jobTbl.externalId, j.externalId),
          eq(jobTbl.applicationUrl, j.applicationUrl)
        ),
    });

    if (!exists) {
      result.push(j);
    }
  }

  return result;
}

/**
 * Orchestrates multi-platform job search and discovers new opportunities.
 * @param query Optional search query overrides
 * @returns Discovery statistics
 */
export async function runDiscovery(query?: Partial<SearchQuery>): Promise<DiscoveryResult> {
  console.log(`🔎 [DiscoveryEngine] Starting multi-platform job discovery...`);

  const searchQuery: SearchQuery = {
    titles: query?.titles || DEFAULT_SEARCH_TITLES,
    keywords: query?.keywords || DEFAULT_SEARCH_KEYWORDS,
    locations: query?.locations || ['Remote', 'Bengaluru', 'Bangalore'],
    ...query,
  };

  const allJobs: DiscoveredJob[] = [];
  const byPlatform: Record<string, number> = {};

  // For each registered platform adapter, call searchJobs
  for (const platform of platformRegistry.getAllAdapters()) {
    try {
      console.log(`🔎 [DiscoveryEngine] Searching on ${platform.name}...`);
      const jobs = await platform.searchJobs(searchQuery);
      allJobs.push(...jobs);
      byPlatform[platform.platform] = (byPlatform[platform.platform] || 0) + jobs.length;
    } catch (error) {
      console.error(`❌ 🔎 [DiscoveryEngine] Error searching ${platform.name}:`, error);
    }
  }

  const initialCount = allJobs.length;

  // Deduplicate results
  const newJobsList = await deduplicateJobs(allJobs);
  const duplicates = initialCount - newJobsList.length;

  // Insert new jobs + create/find company records and add to application queue
  for (const j of newJobsList) {
    try {
      // Find or create company
      let companyId: number | null = null;
      if (j.company) {
        const existingCompany = await db.query.company.findFirst({
          where: (comp, { eq }) => eq(comp.name, j.company),
        });

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const [newComp] = await db
            .insert(company)
            .values({
              name: j.company,
            })
            .returning();
          companyId = newComp.id;
        }
      }

      const [insertedJob] = await db
        .insert(job)
        .values({
          externalId: j.externalId,
          companyId: companyId ?? undefined,
          title: j.title,
          location: j.location,
          isRemote: j.isRemote,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          salaryCurrency: j.salaryCurrency,
          experienceMin: j.experienceMin,
          experienceMax: j.experienceMax,
          description: j.description,
          requiredSkills: j.requiredSkills,
          preferredSkills: j.preferredSkills,
          applicationUrl: j.applicationUrl,
          source: j.source,
          datePosted: j.datePosted || new Date(),
          rawData: j.rawData,
        })
        .returning();

      // Enqueue to application queue
      const hash = generateDeduplicationHash(j.company, j.title, j.location, j.description);
      await enqueue(insertedJob.id, 1, j.source, undefined, hash);
    } catch (err) {
      console.error(`❌ 🔎 [DiscoveryEngine] Error inserting job ${j.title}:`, err);
    }
  }

  // Log activity
  try {
    await db.insert(agentActivity).values({
      agentName: 'JobDiscoveryAgent',
      actionType: 'search',
      message: `Discovered ${initialCount} jobs, ${newJobsList.length} new across platforms`,
      details: { initialCount, newCount: newJobsList.length, byPlatform },
      severity: 'info',
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn('Could not log agent activity:', err);
  }

  console.log(`✅ 🔎 [DiscoveryEngine] Discovery complete. Found ${newJobsList.length} new jobs (${duplicates} duplicates)`);

  return {
    discovered: initialCount,
    new: newJobsList.length,
    newJobs: newJobsList.length,
    duplicates,
    byPlatform,
  };
}
