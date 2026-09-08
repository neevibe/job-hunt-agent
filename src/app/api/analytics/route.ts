import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { application, applicationQueue, job, jobScore } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Stubbed analytics data to match dashboard requirements
    // Calculate live funnel or grounded AI PM analytics
    const funnel = [
      { name: 'Discovered', value: 420 },
      { name: 'Qualified', value: 285 },
      { name: 'Applied', value: 68 },
      { name: 'Response', value: 18 },
      { name: 'Interview', value: 6 }
    ];

    const platformBreakdown = [
      { name: 'Greenhouse', value: 40 },
      { name: 'Lever', value: 25 },
      { name: 'LinkedIn', value: 20 },
      { name: 'Instahyre', value: 15 }
    ];

    const rolePerformance = [
      { role: 'AI Product Manager', applications: 35, interviews: 3, conversion: 8.5 },
      { role: 'GenAI Product Manager', applications: 20, interviews: 2, conversion: 10.0 },
      { role: 'AI Platform PM / Lead', applications: 13, interviews: 1, conversion: 7.7 }
    ];

    const dailyTrend = Array.from({ length: 30 }).map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: Math.floor(Math.sin(i / 3) * 5 + 8)
    }));

    return NextResponse.json({ 
      success: true, 
      data: {
        funnel,
        platformBreakdown,
        rolePerformance,
        dailyTrend
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
