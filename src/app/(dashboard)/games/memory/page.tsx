'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CARD_SYMBOLS = ['🚀', '💡', '🎯', '⭐', '🔥', '💎', '🌟', '🏆'];

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, columns: 4 },
  medium: { pairs: 6, columns: 4 },
  hard: { pairs: 8, columns: 4 },
};

export default function MemoryGamePage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const initializeGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const selectedSymbols = CARD_SYMBOLS.slice(0, config.pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];

    // Shuffle cards
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setGameStarted(false);
    setGameComplete(false);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  useEffect(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (matches === config.pairs && matches > 0) {
      setGameComplete(true);
      saveScore();
    }
  }, [matches, difficulty]);

  const saveScore = async () => {
    if (!appUser) return;

    const score = calculateScore();
    const supabase = createClient();

    try {
      await supabase.from('memory_game_scores').insert({
        user_id: appUser.id,
        game_type: 'cards',
        difficulty,
        score,
        time_seconds: timer,
        moves,
        completed: true,
      });

      if (score > highScores[difficulty]) {
        setHighScores((prev) => ({ ...prev, [difficulty]: score }));
        toast({ title: 'New High Score!', description: `You scored ${score} points!` });
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const calculateScore = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const baseScore = config.pairs * 100;
    const timeBonus = Math.max(0, 300 - timer) * 2;
    const moveBonus = Math.max(0, (config.pairs * 3 - moves) * 10);
    return baseScore + timeBonus + moveBonus;
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard?.symbol === secondCard?.symbol) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, isMatched: true } : c
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            <h1 className="text-3xl font-bold">Memory Challenge</h1>
            <p className="text-muted-foreground">Match the pairs to win</p>
          </div>
        </div>
        <Button variant="outline" onClick={initializeGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          New Game
        </Button>
      </div>

      {/* Difficulty Selection */}
      <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
        <TabsList>
          <TabsTrigger value="easy">Easy (4 pairs)</TabsTrigger>
          <TabsTrigger value="medium">Medium (6 pairs)</TabsTrigger>
          <TabsTrigger value="hard">Hard (8 pairs)</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span>{moves} moves</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>{matches}/{DIFFICULTY_CONFIG[difficulty].pairs} matches</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>High Score: {highScores[difficulty]}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center">
        <div
          className={cn(
            'grid gap-3 p-6 rounded-xl bg-muted/30',
            difficulty === 'easy' && 'grid-cols-4',
            difficulty === 'medium' && 'grid-cols-4',
            difficulty === 'hard' && 'grid-cols-4'
          )}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || flippedCards.length >= 2}
              className={cn(
                'w-20 h-20 rounded-xl text-4xl flex items-center justify-center transition-all duration-300 transform',
                card.isFlipped || card.isMatched
                  ? 'bg-primary text-primary-foreground rotate-0'
                  : 'bg-card border-2 border-border hover:border-primary hover:scale-105 cursor-pointer',
                card.isMatched && 'bg-green-500 animate-pulse'
              )}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </button>
          ))}
        </div>
      </div>

      {/* Game Complete Modal */}
      {gameComplete && (
        <Card className="max-w-md mx-auto bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Congratulations!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-green-500">
              {calculateScore()} points
            </div>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div>
                <Clock className="h-4 w-4 mx-auto mb-1" />
                {formatTime(timer)}
              </div>
              <div>
                <Zap className="h-4 w-4 mx-auto mb-1" />
                {moves} moves
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={initializeGame}>
                Play Again
              </Button>
              <Link href="/games">
                <Button>Back to Games</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
