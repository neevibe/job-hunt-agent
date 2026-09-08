import { NextRequest, NextResponse } from 'next/server';
import { getSchedulerStatus, runAutonomousCycle, toggleAutonomousMode, updateAutonomousConfig } from '@/lib/engines/scheduler';

export async function GET(req: NextRequest) {
  try {
    const status = await getSchedulerStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await runAutonomousCycle();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.enabled !== undefined) {
      await toggleAutonomousMode(1, body.enabled);
      return NextResponse.json({ success: true, enabled: body.enabled });
    }
    if (body.config) {
      const result = await updateAutonomousConfig(1, body.config);
      return NextResponse.json({ success: true, config: result });
    }
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
