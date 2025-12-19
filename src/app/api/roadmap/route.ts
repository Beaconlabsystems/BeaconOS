import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('roadmap_milestones')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  // Get the highest order_index
  const { data: existing } = await supabase
    .from('roadmap_milestones')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (existing?.order_index || 0) + 1;

  const { data, error } = await supabase
    .from('roadmap_milestones')
    .insert({
      title: body.title,
      description: body.description,
      type: body.type || 'other',
      status: body.status || 'planned',
      target_date: body.targetDate,
      order_index: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
