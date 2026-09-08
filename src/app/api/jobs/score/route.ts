import { NextRequest, NextResponse } from 'next/server';
import { getCandidateDNA } from '@/lib/candidate-dna';
import { scoreJob } from '@/lib/agents/job-scoring-agent';

// Job Scoring API
// Scores a job against the candidate profile

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job } = body;
    
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job data required' },
        { status: 400 }
      );
    }
    
    // Get candidate profile
    const candidate = getCandidateDNA();
    
    // Score the job
    const score = scoreJob(job);
    
    return NextResponse.json({
      success: true,
      jobId: job.id,
      score,
      recommendation: score.overallScore >= 85 
        ? 'APPLY_NOW' 
        : score.overallScore >= 75 
          ? 'CONSIDER' 
          : 'SKIP',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to score job' },
      { status: 500 }
    );
  }
}

// Batch scoring endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobs } = body;
    
    if (!Array.isArray(jobs)) {
      return NextResponse.json(
        { success: false, error: 'Jobs array required' },
        { status: 400 }
      );
    }
    
    const results = jobs.map(job => ({
      jobId: job.id,
      score: scoreJob(job)
    }));
    
    // Sort by score descending
    results.sort((a, b) => b.score.overallScore - a.score.overallScore);
    
    return NextResponse.json({
      success: true,
      count: results.length,
      results,
      highFitCount: results.filter(r => r.score.overallScore >= 85).length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch scoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to score jobs' },
      { status: 500 }
    );
  }
}
