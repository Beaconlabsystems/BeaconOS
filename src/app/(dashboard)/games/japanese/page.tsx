'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Check, X, BookOpen, Flame, RotateCcw, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Flashcard, FlashcardCategory } from '@/types';
import { FLASHCARD_CATEGORY_LABELS } from '@/types';
import { calculateNextReview, getCardsDueToday, getLearningStats, SIMPLE_RATINGS, type SimpleRating } from '@/lib/srs-algorithm';
import { DEFAULT_FLASHCARDS } from '@/lib/seed-data';
import { format, addDays } from 'date-fns';

// Cute mascot component
function Mascot({ message, mood }: { message: string; mood: 'happy' | 'encouraging' | 'celebrating' }) {
  const expressions = {
    happy: '(◕‿◕)',
    encouraging: '(ง •̀_•́)ง',
    celebrating: '\\(★ω★)/',
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20">
      <div className="text-4xl mascot-bounce">{expressions[mood]}</div>
      <div>
        <p className="font-medium text-orange-500">Tanuki-sensei</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Mock flashcards initialized from default set
const initializeMockFlashcards = (): Flashcard[] => {
  const today = new Date().toISOString().split('T')[0];
  return DEFAULT_FLASHCARDS.map((card, index) => ({
    ...card,
    id: `mock-${index}`,
    user_id: 'demo',
    box_number: Math.floor(Math.random() * 3) + 1, // Random box 1-3
    ease_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review_date: Math.random() > 0.5 ? today : format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    last_reviewed_at: null,
    times_correct: Math.floor(Math.random() * 5),
    times_incorrect: Math.floor(Math.random() * 2),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
};

export default function JapaneseLearningPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initializeMockFlashcards());
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [selectedCategory, setSelectedCategory] = useState<FlashcardCategory | 'all'>('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      setDueCards(getCardsDueToday(flashcards));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const startSession = (category?: FlashcardCategory) => {
    let cardsToReview = getCardsDueToday(flashcards);
    if (category) {
      cardsToReview = cardsToReview.filter((c) => c.category === category);
    }

    if (cardsToReview.length === 0) {
      toast({
        title: 'No cards due!',
        description: category
          ? `No ${FLASHCARD_CATEGORY_LABELS[category]} cards due for review.`
          : 'Great job! Come back later for more reviews.',
      });
      return;
    }

    setDueCards(cardsToReview);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setSelectedCategory(category || 'all');
  };

  const handleAnswer = (rating: SimpleRating) => {
    const currentCard = dueCards[currentIndex];
    if (!currentCard) return;

    const quality = SIMPLE_RATINGS[rating];
    const isCorrect = quality >= 3;
    const result = calculateNextReview(currentCard, quality);

    // Update stats
    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Update card in state
    setFlashcards(flashcards.map(card =>
      card.id === currentCard.id
        ? {
            ...card,
            box_number: result.newBoxNumber,
            ease_factor: result.newEaseFactor,
            interval_days: result.newIntervalDays,
            repetitions: result.newRepetitions,
            next_review_date: result.nextReviewDate.toISOString().split('T')[0],
            last_reviewed_at: new Date().toISOString(),
            times_correct: currentCard.times_correct + (isCorrect ? 1 : 0),
            times_incorrect: currentCard.times_incorrect + (isCorrect ? 0 : 1),
          }
        : card
    ));

    // Move to next card
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  };

  const stats = getLearningStats(flashcards);
  const currentCard = dueCards[currentIndex];

  const getMascotMessage = () => {
    if (sessionComplete) {
      const accuracy = sessionStats.correct / (sessionStats.correct + sessionStats.incorrect);
      if (accuracy >= 0.9) return "Sugoi! You're amazing! 素晴らしい!";
      if (accuracy >= 0.7) return 'Great work! Keep practicing! がんばって!';
      return "Don't give up! Practice makes perfect! 諦めないで!";
    }
    if (currentIndex === 0) return 'Ready to learn? Let\'s go! いきましょう!';
    if (sessionStats.correct > sessionStats.incorrect) return 'You\'re doing great! 上手ですね!';
    return 'Keep trying! You can do it! 頑張れ!';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/games">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Japanese Learning</h1>
            <p className="text-muted-foreground">Master Japanese with spaced repetition</p>
          </div>
        </div>
      </div>

      {/* Mascot */}
      <Mascot
        message={getMascotMessage()}
        mood={sessionComplete ? 'celebrating' : sessionStats.correct > 0 ? 'happy' : 'encouraging'}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{stats.dueToday}</div>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.mastered}</div>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.learning}</div>
            <p className="text-xs text-muted-foreground">Learning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {!sessionComplete && dueCards.length > 0 && currentCard ? (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Card {currentIndex + 1} of {dueCards.length}</span>
              <span>
                <span className="text-green-500">{sessionStats.correct}</span>
                {' / '}
                <span className="text-red-500">{sessionStats.incorrect}</span>
              </span>
            </div>
            <Progress value={(currentIndex / dueCards.length) * 100} />
          </div>

          {/* Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative h-64 cursor-pointer perspective-1000"
          >
            <div
              className={cn(
                'absolute inset-0 rounded-2xl transition-all duration-500 transform-style-preserve-3d',
                isFlipped && 'rotate-y-180'
              )}
            >
              {/* Front */}
              <Card
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center backface-hidden',
                  isFlipped && 'invisible'
                )}
              >
                <Badge variant="secondary" className="mb-4">
                  {FLASHCARD_CATEGORY_LABELS[currentCard.category]}
                </Badge>
                <div className="text-5xl font-bold mb-4">{currentCard.japanese}</div>
                <div className="text-xl text-muted-foreground">{currentCard.romaji}</div>
                <p className="absolute bottom-4 text-sm text-muted-foreground">
                  Click to reveal answer
                </p>
              </Card>

              {/* Back */}
              <Card
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center backface-hidden rotate-y-180',
                  !isFlipped && 'invisible'
                )}
              >
                <div className="text-3xl font-bold mb-2">{currentCard.english}</div>
                <div className="text-xl text-muted-foreground mb-2">{currentCard.romaji}</div>
                <div className="text-4xl">{currentCard.japanese}</div>
                <Badge variant="outline" className="mt-4">
                  Box {currentCard.box_number} / 5
                </Badge>
              </Card>
            </div>
          </div>

          {/* Answer Buttons */}
          {isFlipped && (
            <div className="flex justify-center gap-3 animate-slide-in-bottom">
              <Button
                variant="outline"
                size="lg"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={() => handleAnswer('again')}
              >
                <X className="h-5 w-5 mr-2" />
                Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                onClick={() => handleAnswer('hard')}
              >
                Hard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-green-500 text-green-500 hover:bg-green-500/10"
                onClick={() => handleAnswer('good')}
              >
                <Check className="h-5 w-5 mr-2" />
                Good
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
                onClick={() => handleAnswer('easy')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Easy
              </Button>
            </div>
          )}
        </div>
      ) : sessionComplete ? (
        /* Session Complete */
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle>Session Complete!</CardTitle>
            <CardDescription>Great job on your practice today</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-3xl font-bold text-green-500">{sessionStats.correct}</div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</div>
                <p className="text-sm text-muted-foreground">To Review</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => startSession()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice More
              </Button>
              <Link href="/games">
                <Button>Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Start Session */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Start a Study Session</CardTitle>
            <CardDescription>
              {stats.dueToday > 0
                ? `You have ${stats.dueToday} cards due for review today`
                : 'All caught up! Come back later for more reviews.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col"
                onClick={() => startSession()}
                disabled={stats.dueToday === 0}
              >
                <BookOpen className="h-6 w-6 mb-2" />
                <span>All Due ({stats.dueToday})</span>
              </Button>
              {(Object.keys(FLASHCARD_CATEGORY_LABELS) as FlashcardCategory[]).map((cat) => {
                const catDue = getCardsDueToday(flashcards.filter((c) => c.category === cat)).length;
                return (
                  <Button
                    key={cat}
                    variant="outline"
                    className="h-auto py-4 flex-col"
                    onClick={() => startSession(cat)}
                    disabled={catDue === 0}
                  >
                    <span className="text-lg mb-1">
                      {cat === 'phrase' && '💬'}
                      {cat === 'number' && '🔢'}
                      {cat === 'day' && '📅'}
                      {cat === 'month' && '🗓️'}
                      {cat === 'pattern' && '📝'}
                      {cat === 'vocabulary' && '📚'}
                    </span>
                    <span>{FLASHCARD_CATEGORY_LABELS[cat]}</span>
                    <span className="text-xs text-muted-foreground">({catDue} due)</span>
                  </Button>
                );
              })}
            </div>

            {/* Box Distribution */}
            <div>
              <h4 className="font-medium mb-3">Your Progress</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((box) => (
                  <div key={box} className="flex-1">
                    <div
                      className={cn(
                        'h-20 rounded-lg flex items-end justify-center pb-2 transition-all',
                        box === 1 && 'bg-red-500/20',
                        box === 2 && 'bg-orange-500/20',
                        box === 3 && 'bg-yellow-500/20',
                        box === 4 && 'bg-green-500/20',
                        box === 5 && 'bg-emerald-500/20'
                      )}
                    >
                      <span className="text-2xl font-bold">{stats.byBox[box]}</span>
                    </div>
                    <p className="text-xs text-center mt-1 text-muted-foreground">Box {box}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
