'use client';

import { useState, useEffect, useCallback } from 'react';

interface WordProgress {
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  lastSeen: number;
  nextReview: number;
  mastered: boolean;
}

interface LevelProgress {
  level: number;
  questionsAnswered: number;
  correctAnswers: number;
  completed: boolean;
  unlocked: boolean;
}

export function useJapanese() {
  const [wordProgress, setWordProgress] = useState<Record<string, WordProgress>>({});
  const [questAProgress, setQuestAProgress] = useState<LevelProgress[]>([]);
  const [questBProgress, setQuestBProgress] = useState<LevelProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/japanese/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();

      // Transform word progress from DB format
      const transformedWordProgress: Record<string, WordProgress> = {};
      if (data.wordProgress) {
        Object.entries(data.wordProgress).forEach(([key, value]: [string, any]) => {
          transformedWordProgress[key] = {
            wordId: value.word_id,
            correctCount: value.correct_count,
            incorrectCount: value.incorrect_count,
            lastSeen: new Date(value.last_seen).getTime(),
            nextReview: new Date(value.next_review).getTime(),
            mastered: value.mastered,
          };
        });
      }

      setWordProgress(transformedWordProgress);
      setQuestAProgress(data.questAProgress || []);
      setQuestBProgress(data.questBProgress || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Initialize with defaults on error
      setQuestAProgress(
        Array.from({ length: 10 }, (_, i) => ({
          level: i + 1,
          questionsAnswered: 0,
          correctAnswers: 0,
          completed: false,
          unlocked: i === 0,
        }))
      );
      setQuestBProgress(
        Array.from({ length: 10 }, (_, i) => ({
          level: i + 1,
          questionsAnswered: 0,
          correctAnswers: 0,
          completed: false,
          unlocked: false,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateWordProgress = async (wordId: string, progress: WordProgress) => {
    try {
      await fetch('/api/japanese/word-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId,
          correctCount: progress.correctCount,
          incorrectCount: progress.incorrectCount,
          lastSeen: new Date(progress.lastSeen).toISOString(),
          nextReview: new Date(progress.nextReview).toISOString(),
          mastered: progress.mastered,
        }),
      });

      setWordProgress((prev) => ({
        ...prev,
        [wordId]: progress,
      }));
    } catch (err) {
      console.error('Error updating word progress:', err);
    }
  };

  const updateLevelProgress = async (
    quest: 'A' | 'B',
    level: number,
    progress: Partial<LevelProgress>
  ) => {
    try {
      await fetch('/api/japanese/level-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quest,
          level,
          ...progress,
        }),
      });

      const setProgress = quest === 'A' ? setQuestAProgress : setQuestBProgress;
      setProgress((prev) =>
        prev.map((l) =>
          l.level === level ? { ...l, ...progress } : l
        )
      );
    } catch (err) {
      console.error('Error updating level progress:', err);
    }
  };

  const unlockNextLevel = async (quest: 'A' | 'B', currentLevel: number) => {
    if (currentLevel >= 10) {
      // If Quest A level 10 completed, unlock Quest B level 1
      if (quest === 'A') {
        await updateLevelProgress('B', 1, { unlocked: true });
      }
      return;
    }

    await updateLevelProgress(quest, currentLevel + 1, { unlocked: true });
  };

  const isQuestBUnlocked = questAProgress.every((l) => l.completed);

  return {
    wordProgress,
    questAProgress,
    questBProgress,
    loading,
    error,
    isQuestBUnlocked,
    refresh: fetchProgress,
    updateWordProgress,
    updateLevelProgress,
    unlockNextLevel,
  };
}
