/**
 * Spaced Repetition System (SRS) Algorithm
 *
 * Implements a hybrid SM-2 / Leitner system for optimal learning retention.
 *
 * SM-2 Algorithm Overview:
 * - Quality rating: 0-5 (0-2 = fail, 3-5 = pass)
 * - Ease Factor: starts at 2.5, adjusted based on performance
 * - Interval: days until next review
 *
 * Leitner System (Boxes 1-5):
 * - Box 1: Review daily
 * - Box 2: Review every 2 days
 * - Box 3: Review every 4 days
 * - Box 4: Review every 8 days
 * - Box 5: Review every 16 days
 *
 * Correct answer moves card up one box
 * Incorrect answer moves card back to box 1
 */

import type { Flashcard } from '@/types';
import { addDays, startOfDay } from 'date-fns';

// SM-2 Constants
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

// Leitner Box intervals (days)
const LEITNER_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
};

interface ReviewResult {
  newBoxNumber: number;
  newEaseFactor: number;
  newIntervalDays: number;
  newRepetitions: number;
  nextReviewDate: Date;
}

/**
 * Calculate the next review schedule based on quality rating
 *
 * @param card - The flashcard being reviewed
 * @param quality - Rating 0-5 (0-2 fail, 3-5 pass)
 * @returns Updated scheduling parameters
 */
export function calculateNextReview(
  card: Flashcard,
  quality: number
): ReviewResult {
  // Clamp quality to 0-5
  const q = Math.max(0, Math.min(5, quality));
  const passed = q >= 3;

  let newBoxNumber: number;
  let newEaseFactor: number;
  let newIntervalDays: number;
  let newRepetitions: number;

  if (passed) {
    // Success: Move to next box (max 5)
    newBoxNumber = Math.min(card.box_number + 1, 5);
    newRepetitions = card.repetitions + 1;

    // SM-2 ease factor adjustment
    // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    const easeDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    newEaseFactor = Math.max(MIN_EASE_FACTOR, card.ease_factor + easeDelta);

    // Calculate interval using SM-2 for higher boxes
    if (newRepetitions === 1) {
      newIntervalDays = 1;
    } else if (newRepetitions === 2) {
      newIntervalDays = 6;
    } else {
      // Use Leitner as base, modified by ease factor
      const leitnerInterval = LEITNER_INTERVALS[newBoxNumber] || 16;
      newIntervalDays = Math.round(leitnerInterval * newEaseFactor);
    }
  } else {
    // Failure: Reset to box 1
    newBoxNumber = 1;
    newRepetitions = 0;
    newIntervalDays = 1;

    // Decrease ease factor on failure
    newEaseFactor = Math.max(
      MIN_EASE_FACTOR,
      card.ease_factor - 0.2
    );
  }

  const nextReviewDate = addDays(startOfDay(new Date()), newIntervalDays);

  return {
    newBoxNumber,
    newEaseFactor,
    newIntervalDays,
    newRepetitions,
    nextReviewDate,
  };
}

/**
 * Get cards due for review today
 */
export function getCardsDueToday(cards: Flashcard[]): Flashcard[] {
  const today = startOfDay(new Date());

  return cards.filter(card => {
    const nextReview = startOfDay(new Date(card.next_review_date));
    return nextReview <= today;
  });
}

/**
 * Get cards due for review in the next N days
 */
export function getCardsForUpcomingDays(
  cards: Flashcard[],
  days: number
): Flashcard[] {
  const today = startOfDay(new Date());
  const futureDate = addDays(today, days);

  return cards.filter(card => {
    const nextReview = startOfDay(new Date(card.next_review_date));
    return nextReview <= futureDate;
  });
}

/**
 * Calculate accuracy rate for a card
 */
export function getCardAccuracy(card: Flashcard): number {
  const total = card.times_correct + card.times_incorrect;
  if (total === 0) return 0;
  return Math.round((card.times_correct / total) * 100);
}

/**
 * Get learning statistics
 */
export function getLearningStats(cards: Flashcard[]): {
  total: number;
  dueToday: number;
  mastered: number;
  learning: number;
  new: number;
  averageAccuracy: number;
  byBox: Record<number, number>;
} {
  const dueToday = getCardsDueToday(cards).length;

  // Mastered = box 5 with >80% accuracy
  const mastered = cards.filter(
    c => c.box_number === 5 && getCardAccuracy(c) >= 80
  ).length;

  // Learning = box 2-4 or box 5 with <80% accuracy
  const learning = cards.filter(
    c =>
      (c.box_number >= 2 && c.box_number <= 4) ||
      (c.box_number === 5 && getCardAccuracy(c) < 80)
  ).length;

  // New = box 1 with no reviews
  const newCards = cards.filter(
    c => c.box_number === 1 && c.repetitions === 0
  ).length;

  // Average accuracy across all cards
  const totalCorrect = cards.reduce((sum, c) => sum + c.times_correct, 0);
  const totalReviews = cards.reduce(
    (sum, c) => sum + c.times_correct + c.times_incorrect,
    0
  );
  const averageAccuracy =
    totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Count by box
  const byBox: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  cards.forEach(c => {
    if (byBox[c.box_number] !== undefined) {
      byBox[c.box_number]++;
    }
  });

  return {
    total: cards.length,
    dueToday,
    mastered,
    learning,
    new: newCards,
    averageAccuracy,
    byBox,
  };
}

/**
 * Sort cards for optimal review order
 * Priority: overdue > due today > new > by box number
 */
export function sortCardsForReview(cards: Flashcard[]): Flashcard[] {
  const today = startOfDay(new Date());

  return [...cards].sort((a, b) => {
    const aDate = startOfDay(new Date(a.next_review_date));
    const bDate = startOfDay(new Date(b.next_review_date));

    // Overdue cards first
    const aOverdue = aDate < today;
    const bOverdue = bDate < today;
    if (aOverdue && !bOverdue) return -1;
    if (bOverdue && !aOverdue) return 1;

    // Then by next review date
    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;

    // Then by box number (lower boxes = more important)
    return a.box_number - b.box_number;
  });
}

/**
 * Quality rating descriptions for UI
 */
export const QUALITY_RATINGS = [
  { value: 0, label: 'Complete blackout', color: 'red' },
  { value: 1, label: 'Wrong, but recognized', color: 'red' },
  { value: 2, label: 'Wrong, but easy to recall', color: 'orange' },
  { value: 3, label: 'Correct with difficulty', color: 'yellow' },
  { value: 4, label: 'Correct with hesitation', color: 'green' },
  { value: 5, label: 'Perfect recall', color: 'emerald' },
] as const;

/**
 * Simplified rating for basic UI
 * Maps "Again", "Hard", "Good", "Easy" to SM-2 quality
 */
export const SIMPLE_RATINGS = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
} as const;

export type SimpleRating = keyof typeof SIMPLE_RATINGS;
