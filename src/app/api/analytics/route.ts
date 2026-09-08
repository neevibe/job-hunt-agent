import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { application, applicationQueue, job, jobScore } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Stubbed analytics data to match dashboard requirements
    const funnel = [
      { name: 'Discovered', value: 1200 },
      { name: 'Qualified', value: 850 },
      { name: 'Applied', value: 320 },
      { name: 'Response', value: 45 },
      { name: 'Interview', value: 12 }
    ];

    const platformBreakdown = [
      { name: 'LinkedIn', value: 45 },
      { name: 'Wellfound', value: 30 },
      { name: 'Naukri', value: 15 },
      { name: 'Indeed', value: 10 }
    ];

    const rolePerformance = [
      { role: 'Frontend Developer', applications: 150, interviews: 5, conversion: 3.3 },
      { role: 'Full Stack Engineer', applications: 120, interviews: 4, conversion: 3.3 },
      { role: 'React Developer', applications: 50, interviews: 3, conversion: 6.0 }
    ];

    const dailyTrend = Array.from({ length: 30 }).map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: Math.floor(Math.random() * 20) + 5
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
