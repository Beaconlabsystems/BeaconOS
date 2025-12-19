import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('japanese_word_progress')
    .upsert(
      {
        word_id: body.wordId,
        correct_count: body.correctCount,
        incorrect_count: body.incorrectCount,
        last_seen: body.lastSeen,
        next_review: body.nextReview,
        mastered: body.mastered,
      },
      {
        onConflict: 'user_id,word_id',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
