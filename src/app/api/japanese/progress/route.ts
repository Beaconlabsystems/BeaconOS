import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get all progress (word progress and level progress)
export async function GET() {
  const supabase = await createClient();

  const [wordProgressRes, levelProgressRes] = await Promise.all([
    supabase.from('japanese_word_progress').select('*'),
    supabase.from('japanese_level_progress').select('*'),
  ]);

  if (wordProgressRes.error) {
    return NextResponse.json({ error: wordProgressRes.error.message }, { status: 500 });
  }

  if (levelProgressRes.error) {
    return NextResponse.json({ error: levelProgressRes.error.message }, { status: 500 });
  }

  // Transform word progress to a map keyed by word_id
  const wordProgress: Record<string, typeof wordProgressRes.data[0]> = {};
  wordProgressRes.data?.forEach((wp) => {
    wordProgress[wp.word_id] = wp;
  });

  // Transform level progress to nested structure
  const questAProgress = Array.from({ length: 10 }, (_, i) => {
    const level = levelProgressRes.data?.find(
      (lp) => lp.quest === 'A' && lp.level === i + 1
    );
    return {
      level: i + 1,
      questionsAnswered: level?.questions_answered || 0,
      correctAnswers: level?.correct_answers || 0,
      completed: level?.completed || false,
      unlocked: i === 0 || level?.unlocked || false,
    };
  });

  const questBProgress = Array.from({ length: 10 }, (_, i) => {
    const level = levelProgressRes.data?.find(
      (lp) => lp.quest === 'B' && lp.level === i + 1
    );
    return {
      level: i + 1,
      questionsAnswered: level?.questions_answered || 0,
      correctAnswers: level?.correct_answers || 0,
      completed: level?.completed || false,
      unlocked: level?.unlocked || false,
    };
  });

  return NextResponse.json({
    wordProgress,
    questAProgress,
    questBProgress,
  });
}
