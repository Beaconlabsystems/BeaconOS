'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EMOJIS = ['🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎮'];

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function createDeck(): MemoryCard[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  const shuffled = pairs.sort(() => Math.random() - 0.5);
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

export default function MemoryPage() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    setCards(createDeck());
  }, []);

  useEffect(() => {
    if (matches === EMOJIS.length) {
      setGameComplete(true);
      if (bestScore === null || moves < bestScore) {
        setBestScore(moves);
      }
    }
  }, [matches, moves, bestScore]);

  const handleCardClick = (id: number) => {
    if (isChecking) return;
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setMatches(m => m + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(createDeck());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsChecking(false);
    setGameComplete(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Memory Match</h1>
          <p className="text-muted-foreground mt-1">Find all the matching pairs</p>
        </div>
        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          New Game
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Moves:</span>
          <span className="font-semibold text-lg">{moves}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Matches:</span>
          <span className="font-semibold text-lg">{matches}/{EMOJIS.length}</span>
        </div>
        {bestScore !== null && (
          <div className="flex items-center gap-2 text-yellow-500">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Best: {bestScore} moves</span>
          </div>
        )}
      </div>

      {/* Game Complete */}
      {gameComplete && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="py-6 text-center">
            <h2 className="text-2xl font-semibold text-green-500 mb-2">Congratulations!</h2>
            <p className="text-muted-foreground">
              You completed the game in {moves} moves!
            </p>
            <Button onClick={resetGame} className="mt-4">
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || isChecking}
            className={cn(
              'aspect-square rounded-xl text-4xl flex items-center justify-center transition-all duration-300 transform',
              card.isFlipped || card.isMatched
                ? 'bg-primary text-primary-foreground rotate-0'
                : 'bg-secondary hover:bg-secondary/80 hover:scale-105',
              card.isMatched && 'bg-green-500/20 border-2 border-green-500',
              !card.isFlipped && !card.isMatched && 'hover:shadow-lg'
            )}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Click cards to flip them. Match all pairs in as few moves as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
