import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { job, company, jobScore } from '@/db/schema';
import { desc, eq, and, gte, sql, count } from 'drizzle-orm';

/**
 * Job Discovery API
 * GET: List discovered jobs with scores
 * POST: Trigger a new discovery scan
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';

    // Query jobs from database with scores
    let jobs = await db.query.job.findMany({
      with: {
        company: true,
        scores: true,
      },
      where: (j, { and: a, gte: g, eq: e, or, ilike }) => {
        const conditions = [];
        if (query) {
          conditions.push(
            or(
              ilike(j.title, `%${query}%`),
              ilike(j.description, `%${query}%`)
            )
          );
        }
        if (status !== 'all') {
          conditions.push(e(j.isActive, true));
        }
        return conditions.length > 0 ? a(...conditions) : undefined;
      },
      orderBy: (j, { desc: d }) => [d(j.dateDiscovered)],
      limit,
    });

    // Auto-discover live jobs on first load if DB is empty
    if (jobs.length === 0) {
      try {
        const { runDiscovery } = await import('@/lib/engines/discovery');
        await runDiscovery();
        jobs = await db.query.job.findMany({
          with: {
            company: true,
            scores: true,
          },
          orderBy: (j, { desc: d }) => [d(j.dateDiscovered)],
          limit,
        });
      } catch (discoveryErr) {
        console.warn('[Auto-Discovery] Initial scan notice:', discoveryErr);
      }
    }

    // Format for frontend
    const formattedJobs = jobs.map((j) => {
      const score = (j.scores as Array<{ overallScore: number; strengths: string[] | null; gaps: string[] | null; recommendation: string | null }>)?.[0];
      const companyData = j.company as { name: string } | null;
      return {
        id: j.id,
        externalId: j.externalId,
        title: j.title,
        company: companyData?.name || 'Unknown',
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
        datePosted: j.datePosted,
        dateDiscovered: j.dateDiscovered,
        isActive: j.isActive,
        score: score?.overallScore || null,
        strengths: score?.strengths || [],
        gaps: score?.gaps || [],
        recommendation: score?.recommendation || null,
      };
    });

    // Filter by minimum score if requested
    const filtered = minScore > 0
      ? formattedJobs.filter((j) => (j.score || 0) >= minScore)
      : formattedJobs;

    // Get aggregate counts
    const totalCount = await db.select({ count: count() }).from(job);
    const highFitCount = filtered.filter((j) => (j.score || 0) >= 85).length;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      totalInDB: Number(totalCount[0]?.count || 0),
      highFitCount,
      jobs: filtered,
      meta: {
        query,
        minScore,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Job listing error:', error);

    // Fallback to mock data if DB fails
    return NextResponse.json({
      success: true,
      count: 0,
      totalInDB: 0,
      highFitCount: 0,
      jobs: [],
      meta: {
        query: '',
        minScore: 0,
        limit: 50,
        timestamp: new Date().toISOString(),
        fallback: true,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location, sources } = body;

    // Import and run discovery engine
    const { runDiscovery } = await import('@/lib/engines/discovery');

    const result = await runDiscovery({
      titles: query ? [query] : undefined,
      locations: location ? [location] : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Job discovery scan completed',
      result: {
        discovered: result.discovered,
        newJobs: result.newJobs,
        duplicates: result.duplicates,
        byPlatform: result.byPlatform,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Discovery failed',
      },
      { status: 500 }
    );
  }
}
