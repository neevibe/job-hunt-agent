import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { autonomousConfig } from '@/db/schema';
import { updateAutonomousConfig } from '@/lib/engines/scheduler';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const candidateId = 1; // Default candidate ID
    
    const configs = await db.select()
      .from(autonomousConfig)
      .where(eq(autonomousConfig.candidateId, candidateId));
      
    if (configs.length === 0) {
      return NextResponse.json({ success: true, config: null });
    }
    
    return NextResponse.json({ success: true, config: configs[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = 1; // Default candidate ID
    
    const result = await updateAutonomousConfig(candidateId, body);
    
    return NextResponse.json({ success: true, config: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
