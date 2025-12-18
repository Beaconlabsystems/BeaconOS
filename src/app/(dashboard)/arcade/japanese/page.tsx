'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FlashCard {
  id: string;
  japanese: string;
  romaji: string;
  english?: string;
  type: 'hiragana' | 'katakana' | 'vocabulary';
}

const HIRAGANA: FlashCard[] = [
  { id: 'h1', japanese: 'あ', romaji: 'a', type: 'hiragana' },
  { id: 'h2', japanese: 'い', romaji: 'i', type: 'hiragana' },
  { id: 'h3', japanese: 'う', romaji: 'u', type: 'hiragana' },
  { id: 'h4', japanese: 'え', romaji: 'e', type: 'hiragana' },
  { id: 'h5', japanese: 'お', romaji: 'o', type: 'hiragana' },
  { id: 'h6', japanese: 'か', romaji: 'ka', type: 'hiragana' },
  { id: 'h7', japanese: 'き', romaji: 'ki', type: 'hiragana' },
  { id: 'h8', japanese: 'く', romaji: 'ku', type: 'hiragana' },
  { id: 'h9', japanese: 'け', romaji: 'ke', type: 'hiragana' },
  { id: 'h10', japanese: 'こ', romaji: 'ko', type: 'hiragana' },
  { id: 'h11', japanese: 'さ', romaji: 'sa', type: 'hiragana' },
  { id: 'h12', japanese: 'し', romaji: 'shi', type: 'hiragana' },
  { id: 'h13', japanese: 'す', romaji: 'su', type: 'hiragana' },
  { id: 'h14', japanese: 'せ', romaji: 'se', type: 'hiragana' },
  { id: 'h15', japanese: 'そ', romaji: 'so', type: 'hiragana' },
];

const KATAKANA: FlashCard[] = [
  { id: 'k1', japanese: 'ア', romaji: 'a', type: 'katakana' },
  { id: 'k2', japanese: 'イ', romaji: 'i', type: 'katakana' },
  { id: 'k3', japanese: 'ウ', romaji: 'u', type: 'katakana' },
  { id: 'k4', japanese: 'エ', romaji: 'e', type: 'katakana' },
  { id: 'k5', japanese: 'オ', romaji: 'o', type: 'katakana' },
  { id: 'k6', japanese: 'カ', romaji: 'ka', type: 'katakana' },
  { id: 'k7', japanese: 'キ', romaji: 'ki', type: 'katakana' },
  { id: 'k8', japanese: 'ク', romaji: 'ku', type: 'katakana' },
  { id: 'k9', japanese: 'ケ', romaji: 'ke', type: 'katakana' },
  { id: 'k10', japanese: 'コ', romaji: 'ko', type: 'katakana' },
];

const VOCABULARY: FlashCard[] = [
  { id: 'v1', japanese: '猫', romaji: 'neko', english: 'cat', type: 'vocabulary' },
  { id: 'v2', japanese: '犬', romaji: 'inu', english: 'dog', type: 'vocabulary' },
  { id: 'v3', japanese: '水', romaji: 'mizu', english: 'water', type: 'vocabulary' },
  { id: 'v4', japanese: '火', romaji: 'hi', english: 'fire', type: 'vocabulary' },
  { id: 'v5', japanese: '木', romaji: 'ki', english: 'tree', type: 'vocabulary' },
];

type Deck = 'hiragana' | 'katakana' | 'vocabulary';

const DECKS: Record<Deck, FlashCard[]> = {
  hiragana: HIRAGANA,
  katakana: KATAKANA,
  vocabulary: VOCABULARY,
};

// Simple mascot component
function Mascot({ mood }: { mood: 'neutral' | 'happy' | 'sad' }) {
  const expressions = {
    neutral: '(・ω・)',
    happy: '(＾▽＾)',
    sad: '(´；ω；`)',
  };

  return (
    <div className="text-center">
      <div className={cn(
        'text-4xl font-mono transition-all',
        mood === 'happy' && 'mascot-animate'
      )}>
        {expressions[mood]}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {mood === 'neutral' && 'がんばって！'}
        {mood === 'happy' && 'すごい！'}
        {mood === 'sad' && 'もう一度！'}
      </p>
    </div>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function JapanesePage() {
  const [selectedDeck, setSelectedDeck] = useState<Deck>('hiragana');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'sad'>('neutral');

  useEffect(() => {
    setCards(shuffleArray(DECKS[selectedDeck]));
    setCurrentIndex(0);
    setInput('');
    setShowAnswer(false);
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setMascotMood('neutral');
  }, [selectedDeck]);

  const currentCard = cards[currentIndex];

  const checkAnswer = () => {
    if (!currentCard || showAnswer) return;

    const isCorrect = input.toLowerCase().trim() === currentCard.romaji.toLowerCase();
    setShowAnswer(true);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    setMascotMood(isCorrect ? 'happy' : 'sad');
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reshuffle and restart
      setCards(shuffleArray(DECKS[selectedDeck]));
      setCurrentIndex(0);
    }
    setInput('');
    setShowAnswer(false);
    setResult(null);
    setMascotMood('neutral');
  };

  const resetDeck = () => {
    setCards(shuffleArray(DECKS[selectedDeck]));
    setCurrentIndex(0);
    setInput('');
    setShowAnswer(false);
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setMascotMood('neutral');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showAnswer) {
        nextCard();
      } else {
        checkAnswer();
      }
    }
  };

  if (!currentCard) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Japanese</h1>
          <p className="text-muted-foreground mt-1">Learn characters and vocabulary</p>
        </div>
        <Button variant="outline" onClick={resetDeck}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Deck Selection */}
      <div className="flex gap-2">
        <Button
          variant={selectedDeck === 'hiragana' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDeck('hiragana')}
        >
          Hiragana
        </Button>
        <Button
          variant={selectedDeck === 'katakana' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDeck('katakana')}
        >
          Katakana
        </Button>
        <Button
          variant={selectedDeck === 'vocabulary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDeck('vocabulary')}
        >
          Vocabulary
        </Button>
      </div>

      {/* Mascot */}
      <Mascot mood={mascotMood} />

      {/* Flashcard */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="text-8xl font-normal">
              {currentCard.japanese}
            </div>

            {currentCard.english && (
              <p className="text-muted-foreground">
                {showAnswer ? currentCard.english : '(vocabulary)'}
              </p>
            )}

            {showAnswer && (
              <div className={cn(
                'flex items-center justify-center gap-2 text-lg',
                result === 'correct' ? 'text-green-600' : 'text-red-600'
              )}>
                {result === 'correct' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                <span>{currentCard.romaji}</span>
              </div>
            )}

            <div className="max-w-xs mx-auto space-y-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type the romaji..."
                disabled={showAnswer}
                className="text-center"
                autoFocus
              />

              {showAnswer ? (
                <Button onClick={nextCard} className="w-full">
                  Next Card
                </Button>
              ) : (
                <Button onClick={checkAnswer} disabled={!input.trim()} className="w-full">
                  Check
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span>
              Score: {score.correct}/{score.total}
              {score.total > 0 && (
                <span className="text-muted-foreground ml-1">
                  ({Math.round((score.correct / score.total) * 100)}%)
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
