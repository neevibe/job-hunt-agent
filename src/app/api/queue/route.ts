import { NextRequest, NextResponse } from 'next/server';
import { getQueueStats, getHumanReviewItems, transitionStatus } from '@/lib/engines/application-queue';
import { db } from '@/db';
import { applicationQueue } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let items;
    if (status === 'human_review') {
      items = await getHumanReviewItems();
    } else if (status) {
      items = await db.select().from(applicationQueue).where(eq(applicationQueue.status, status));
    } else {
      items = await db.select().from(applicationQueue);
    }
    
    const stats = await getQueueStats();
    
    return NextResponse.json({ success: true, items, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { queueId, newStatus, ...additionalData } = body;
    
    if (!queueId || !newStatus) {
      return NextResponse.json({ success: false, error: 'queueId and newStatus are required' }, { status: 400 });
    }
    
    const result = await transitionStatus(queueId, newStatus, additionalData);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
