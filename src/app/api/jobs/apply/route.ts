import { NextRequest, NextResponse } from 'next/server';
import { executeApplicationForJob } from '@/lib/engines/application-executor';
import { db } from '@/db';
import { applicationQueue, job, company } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Case 1: Auto-apply to all qualified queued jobs
    if (body.autoApplyAll) {
      const limit = body.limit || 10;
      
      // Look for jobs in queued, qualified, ready, or discovered with high fit
      let queuedJobs = await db
        .select()
        .from(applicationQueue)
        .where(
          eq(applicationQueue.status, 'queued')
        )
        .orderBy(desc(applicationQueue.priority))
        .limit(limit);

      if (queuedJobs.length === 0) {
        // Fallback: look for qualified or discovered jobs with matchScore >= 70
        queuedJobs = await db
          .select()
          .from(applicationQueue)
          .where(
            eq(applicationQueue.status, 'discovered')
          )
          .orderBy(desc(applicationQueue.priority))
          .limit(limit);
      }

      // If still empty, pull top jobs from job table
      if (queuedJobs.length === 0) {
        const topJobs = await db.query.job.findMany({
          with: { company: true, scores: true },
          limit,
        });

        const results = [];
        for (const j of topJobs) {
          try {
            const comp = j.company as { name: string } | null;
            const res = await executeApplicationForJob({
              jobId: j.id,
              candidateId: body.candidateId || 1,
              jobTitle: j.title,
              company: comp?.name || 'Company',
              location: j.location || 'Remote',
              applicationUrl: j.applicationUrl,
              description: j.description,
              requiredSkills: j.requiredSkills || [],
            });
            results.push(res);
          } catch (err: any) {
            results.push({ success: false, jobId: j.id, error: err.message });
          }
        }

        return NextResponse.json({
          success: true,
          processed: results.length,
          results,
        });
      }

      const results = [];
      for (const item of queuedJobs) {
        try {
          const result = await executeApplicationForJob({
            jobId: item.jobId,
            candidateId: item.candidateId,
          });
          results.push(result);
        } catch (err: any) {
          results.push({ success: false, queueId: item.id, error: err.message });
        }
      }

      return NextResponse.json({
        success: true,
        processed: results.length,
        results,
      });
    }

    // Case 2: Apply to a specific job
    const result = await executeApplicationForJob({
      jobId: body.jobId,
      candidateId: body.candidateId || 1,
      jobTitle: body.jobTitle || body.title,
      company: body.company,
      location: body.location,
      applicationUrl: body.applicationUrl || body.url,
      description: body.description,
      requiredSkills: body.requiredSkills || body.skills,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Job application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Application processing failed' },
      { status: 500 }
    );
  }
}
