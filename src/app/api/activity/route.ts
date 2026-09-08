import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentActivity } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    const activities = await db.select()
      .from(agentActivity)
      .orderBy(desc(agentActivity.timestamp))
      .limit(limit);
      
    return NextResponse.json({ success: true, activities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
