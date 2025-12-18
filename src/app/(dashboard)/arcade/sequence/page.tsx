'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GameState = 'idle' | 'showing' | 'input' | 'success' | 'failed';

const GRID_SIZE = 9;
const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

export default function SequencePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  const generateSequence = useCallback((length: number) => {
    const newSequence: number[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * GRID_SIZE));
    }
    return newSequence;
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    setGameState('showing');
    setUserInput([]);

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedCell(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setHighlightedCell(null);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setGameState('input');
  }, []);

  const startGame = useCallback(() => {
    const newSequence = generateSequence(level + 2); // Start with 3 items
    setSequence(newSequence);
    showSequence(newSequence);
  }, [generateSequence, level, showSequence]);

  const handleCellClick = (index: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, index];
    setUserInput(newInput);

    // Flash the cell
    setHighlightedCell(index);
    setTimeout(() => setHighlightedCell(null), 200);

    // Check if input is correct so far
    const currentIndex = newInput.length - 1;
    if (newInput[currentIndex] !== sequence[currentIndex]) {
      // Wrong input
      setGameState('failed');
      if (level > highScore) {
        setHighScore(level);
      }
      return;
    }

    // Check if sequence is complete
    if (newInput.length === sequence.length) {
      setGameState('success');
      setTimeout(() => {
        setLevel(l => l + 1);
        const nextSequence = generateSequence(level + 3);
        setSequence(nextSequence);
        showSequence(nextSequence);
      }, 1000);
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setSequence([]);
    setUserInput([]);
    setLevel(1);
    setHighlightedCell(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sequence Memory</h1>
          <p className="text-muted-foreground mt-1">Remember and repeat the pattern</p>
        </div>
        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Level:</span>
          <span className="font-semibold text-lg">{level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sequence:</span>
          <span className="font-semibold">{level + 2} items</span>
        </div>
        {highScore > 0 && (
          <div className="flex items-center gap-2 text-yellow-500">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Best: Level {highScore}</span>
          </div>
        )}
      </div>

      {/* Game Status */}
      {gameState === 'idle' && (
        <Card className="bg-primary/5">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Watch the sequence, then repeat it by clicking the squares in the same order.
            </p>
            <Button onClick={startGame} size="lg">
              Start Game
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'showing' && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="py-4 text-center">
            <p className="text-blue-500 font-medium">Watch the sequence...</p>
          </CardContent>
        </Card>
      )}

      {gameState === 'input' && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="py-4 text-center">
            <p className="text-green-500 font-medium">
              Your turn! ({userInput.length}/{sequence.length})
            </p>
          </CardContent>
        </Card>
      )}

      {gameState === 'success' && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="py-4 text-center">
            <p className="text-green-500 font-medium">Correct! Get ready for level {level + 1}...</p>
          </CardContent>
        </Card>
      )}

      {gameState === 'failed' && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="py-6 text-center">
            <p className="text-red-500 font-medium text-lg mb-2">Game Over!</p>
            <p className="text-muted-foreground mb-4">You reached level {level}</p>
            <Button onClick={() => { resetGame(); setTimeout(startGame, 100); }}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Game Grid */}
      {gameState !== 'idle' && (
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {Array.from({ length: GRID_SIZE }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={gameState !== 'input'}
              className={cn(
                'aspect-square rounded-xl transition-all duration-200',
                highlightedCell === index
                  ? COLORS[index]
                  : 'bg-secondary',
                gameState === 'input' && 'hover:bg-secondary/80 hover:scale-105 cursor-pointer',
                gameState !== 'input' && 'cursor-default'
              )}
            />
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {gameState === 'input' && (
        <div className="flex justify-center gap-1">
          {sequence.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                index < userInput.length ? 'bg-green-500' : 'bg-secondary'
              )}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Watch as squares light up in a sequence</p>
            <p>2. Click the squares in the same order</p>
            <p>3. Each level adds one more to remember</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
