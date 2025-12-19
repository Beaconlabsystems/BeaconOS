import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('japanese_level_progress')
    .upsert(
      {
        quest: body.quest,
        level: body.level,
        questions_answered: body.questionsAnswered,
        correct_answers: body.correctAnswers,
        completed: body.completed,
        unlocked: body.unlocked,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,quest,level',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Bulk update for unlocking next level
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  // Body contains array of level updates
  const updates = body.updates || [];

  const results = await Promise.all(
    updates.map((update: {
      quest: 'A' | 'B';
      level: number;
      questionsAnswered?: number;
      correctAnswers?: number;
      completed?: boolean;
      unlocked?: boolean;
    }) =>
      supabase
        .from('japanese_level_progress')
        .upsert(
          {
            quest: update.quest,
            level: update.level,
            questions_answered: update.questionsAnswered,
            correct_answers: update.correctAnswers,
            completed: update.completed,
            unlocked: update.unlocked,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,quest,level',
          }
        )
        .select()
    )
  );

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.map((e) => e.error?.message).join(', ') },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
