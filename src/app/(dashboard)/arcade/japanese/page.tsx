'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Check, X, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FlashCard {
  id: string;
  romaji: string;
  english: string;
  category: 'greetings' | 'numbers' | 'colors' | 'food' | 'phrases';
}

const VOCABULARY: FlashCard[] = [
  // Greetings
  { id: 'g1', romaji: 'konnichiwa', english: 'hello / good afternoon', category: 'greetings' },
  { id: 'g2', romaji: 'ohayou gozaimasu', english: 'good morning (polite)', category: 'greetings' },
  { id: 'g3', romaji: 'konbanwa', english: 'good evening', category: 'greetings' },
  { id: 'g4', romaji: 'arigatou gozaimasu', english: 'thank you (polite)', category: 'greetings' },
  { id: 'g5', romaji: 'sumimasen', english: 'excuse me / sorry', category: 'greetings' },
  { id: 'g6', romaji: 'hajimemashite', english: 'nice to meet you', category: 'greetings' },
  { id: 'g7', romaji: 'sayounara', english: 'goodbye', category: 'greetings' },
  { id: 'g8', romaji: 'oyasuminasai', english: 'good night', category: 'greetings' },

  // Numbers
  { id: 'n1', romaji: 'ichi', english: 'one (1)', category: 'numbers' },
  { id: 'n2', romaji: 'ni', english: 'two (2)', category: 'numbers' },
  { id: 'n3', romaji: 'san', english: 'three (3)', category: 'numbers' },
  { id: 'n4', romaji: 'shi / yon', english: 'four (4)', category: 'numbers' },
  { id: 'n5', romaji: 'go', english: 'five (5)', category: 'numbers' },
  { id: 'n6', romaji: 'roku', english: 'six (6)', category: 'numbers' },
  { id: 'n7', romaji: 'shichi / nana', english: 'seven (7)', category: 'numbers' },
  { id: 'n8', romaji: 'hachi', english: 'eight (8)', category: 'numbers' },
  { id: 'n9', romaji: 'kyuu / ku', english: 'nine (9)', category: 'numbers' },
  { id: 'n10', romaji: 'juu', english: 'ten (10)', category: 'numbers' },

  // Colors
  { id: 'c1', romaji: 'aka', english: 'red', category: 'colors' },
  { id: 'c2', romaji: 'ao', english: 'blue', category: 'colors' },
  { id: 'c3', romaji: 'kiiro', english: 'yellow', category: 'colors' },
  { id: 'c4', romaji: 'midori', english: 'green', category: 'colors' },
  { id: 'c5', romaji: 'shiro', english: 'white', category: 'colors' },
  { id: 'c6', romaji: 'kuro', english: 'black', category: 'colors' },

  // Food
  { id: 'f1', romaji: 'mizu', english: 'water', category: 'food' },
  { id: 'f2', romaji: 'gohan', english: 'rice / meal', category: 'food' },
  { id: 'f3', romaji: 'ocha', english: 'tea', category: 'food' },
  { id: 'f4', romaji: 'sakana', english: 'fish', category: 'food' },
  { id: 'f5', romaji: 'niku', english: 'meat', category: 'food' },
  { id: 'f6', romaji: 'kudamono', english: 'fruit', category: 'food' },

  // Useful Phrases
  { id: 'p1', romaji: 'wakarimasen', english: 'I don\'t understand', category: 'phrases' },
  { id: 'p2', romaji: 'eigo wo hanasemasu ka', english: 'do you speak English?', category: 'phrases' },
  { id: 'p3', romaji: 'ikura desu ka', english: 'how much is it?', category: 'phrases' },
  { id: 'p4', romaji: 'doko desu ka', english: 'where is it?', category: 'phrases' },
  { id: 'p5', romaji: 'onegaishimasu', english: 'please', category: 'phrases' },
  { id: 'p6', romaji: 'daijoubu', english: 'it\'s okay / are you okay?', category: 'phrases' },
];

type Category = FlashCard['category'] | 'all';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  greetings: 'Greetings',
  numbers: 'Numbers',
  colors: 'Colors',
  food: 'Food',
  phrases: 'Phrases',
};

// Mascot component
function Mascot({ mood }: { mood: 'neutral' | 'happy' | 'thinking' }) {
  const expressions = {
    neutral: '( ・ω・)',
    happy: '(＾▽＾)',
    thinking: '( ・_・)',
  };

  const messages = {
    neutral: 'Ganbatte! (Do your best!)',
    happy: 'Sugoi! (Amazing!)',
    thinking: 'Mou ikkai! (One more time!)',
  };

  return (
    <div className="text-center mb-6">
      <div className={cn(
        'text-4xl font-mono mb-2 transition-all',
        mood === 'happy' && 'mascot-animate'
      )}>
        {expressions[mood]}
      </div>
      <p className="text-sm text-muted-foreground italic">{messages[mood]}</p>
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
  const [category, setCategory] = useState<Category>('all');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'thinking'>('neutral');
  const [mode, setMode] = useState<'romaji-to-english' | 'english-to-romaji'>('romaji-to-english');

  useEffect(() => {
    const filtered = category === 'all'
      ? VOCABULARY
      : VOCABULARY.filter(v => v.category === category);
    setCards(shuffleArray(filtered));
    setCurrentIndex(0);
    setInput('');
    setShowAnswer(false);
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setMascotMood('neutral');
  }, [category]);

  const currentCard = cards[currentIndex];

  const question = mode === 'romaji-to-english' ? currentCard?.romaji : currentCard?.english;
  const answer = mode === 'romaji-to-english' ? currentCard?.english : currentCard?.romaji;

  const checkAnswer = () => {
    if (!currentCard || showAnswer) return;

    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = answer.toLowerCase();

    // Check for partial match or exact match
    const isCorrect = correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer.split(' ')[0]);

    setShowAnswer(true);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    setMascotMood(isCorrect ? 'happy' : 'thinking');
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const filtered = category === 'all'
        ? VOCABULARY
        : VOCABULARY.filter(v => v.category === category);
      setCards(shuffleArray(filtered));
      setCurrentIndex(0);
    }
    setInput('');
    setShowAnswer(false);
    setResult(null);
    setMascotMood('neutral');
  };

  const resetDeck = () => {
    const filtered = category === 'all'
      ? VOCABULARY
      : VOCABULARY.filter(v => v.category === category);
    setCards(shuffleArray(filtered));
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Japanese</h1>
          <p className="text-muted-foreground mt-1">Learn with romaji flashcards</p>
        </div>
        <Button variant="outline" onClick={resetDeck}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'romaji-to-english' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('romaji-to-english')}
        >
          Romaji → English
        </Button>
        <Button
          variant={mode === 'english-to-romaji' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('english-to-romaji')}
        >
          English → Romaji
        </Button>
      </div>

      {/* Mascot */}
      <Mascot mood={mascotMood} />

      {/* Flashcard */}
      <Card className="overflow-hidden">
        <CardContent className="py-12 px-8">
          <div className="text-center space-y-6">
            {/* Question */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                {mode === 'romaji-to-english' ? 'Romaji' : 'English'}
              </p>
              <p className="text-3xl font-medium font-heading">
                {question}
              </p>
            </div>

            {/* Answer reveal */}
            {showAnswer && (
              <div className={cn(
                'flex items-center justify-center gap-2 text-lg py-3 px-4 rounded-lg animate-scale-in',
                result === 'correct' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              )}>
                {result === 'correct' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                <span className="font-medium">{answer}</span>
              </div>
            )}

            {/* Input */}
            <div className="max-w-sm mx-auto space-y-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'romaji-to-english' ? 'Type the English...' : 'Type the romaji...'}
                disabled={showAnswer}
                className="text-center text-lg h-12"
                autoFocus
              />

              {showAnswer ? (
                <Button onClick={nextCard} className="w-full h-11">
                  Next Card
                </Button>
              ) : (
                <Button onClick={checkAnswer} disabled={!input.trim()} className="w-full h-11">
                  Check Answer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="font-semibold">{score.correct}</span>
              <span className="text-muted-foreground">/{score.total}</span>
              {score.total > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({Math.round((score.correct / score.total) * 100)}%)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
