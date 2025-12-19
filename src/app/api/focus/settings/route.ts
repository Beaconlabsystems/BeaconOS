import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('focus_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no settings exist
  if (!data) {
    return NextResponse.json({
      focus_minutes: 25,
      short_break_minutes: 5,
      long_break_minutes: 15,
      sessions_before_long_break: 4,
    });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('focus_settings')
    .upsert({
      focus_minutes: body.focusMinutes,
      short_break_minutes: body.shortBreakMinutes,
      long_break_minutes: body.longBreakMinutes,
      sessions_before_long_break: body.sessionsBeforeLongBreak,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
