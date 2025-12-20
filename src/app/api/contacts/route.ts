import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const contactsTable = (supabase as any).from('contacts');

  const { data, error } = await contactsTable
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const contactsTable = (supabase as any).from('contacts');
  const body = await request.json();

  const { data, error } = await contactsTable
    .insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      role: body.role,
      category: body.category || 'other',
      notes: body.notes,
      location: body.location,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
