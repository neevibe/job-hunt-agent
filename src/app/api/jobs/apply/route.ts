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
      const queuedJobs = await db
        .select()
        .from(applicationQueue)
        .where(eq(applicationQueue.status, 'queued'))
        .orderBy(desc(applicationQueue.priority))
        .limit(limit);

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
