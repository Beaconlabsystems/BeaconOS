'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Zap, Timer, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GameState = 'idle' | 'waiting' | 'ready' | 'clicked' | 'too-early';

export default function ReactionPage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = useCallback(() => {
    setGameState('waiting');
    setReactionTime(null);

    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;

    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  }, []);

  const handleClick = () => {
    if (gameState === 'idle') {
      startGame();
    } else if (gameState === 'waiting') {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState('too-early');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setAttempts(prev => [...prev, time].slice(-5)); // Keep last 5 attempts
      setGameState('clicked');
    } else if (gameState === 'clicked' || gameState === 'too-early') {
      startGame();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const averageTime = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

  const bestTime = attempts.length > 0
    ? Math.min(...attempts)
    : null;

  const resetGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState('idle');
    setReactionTime(null);
    setAttempts([]);
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting':
        return 'bg-red-500';
      case 'ready':
        return 'bg-green-500';
      case 'too-early':
        return 'bg-yellow-500';
      default:
        return 'bg-secondary';
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case 'idle':
        return 'Click to start';
      case 'waiting':
        return 'Wait for green...';
      case 'ready':
        return 'CLICK NOW!';
      case 'clicked':
        return `${reactionTime}ms`;
      case 'too-early':
        return 'Too early! Click to try again';
    }
  };

  const getReactionRating = (time: number) => {
    if (time < 200) return { label: 'Incredible!', color: 'text-green-500' };
    if (time < 250) return { label: 'Excellent', color: 'text-emerald-500' };
    if (time < 300) return { label: 'Good', color: 'text-blue-500' };
    if (time < 400) return { label: 'Average', color: 'text-yellow-500' };
    return { label: 'Keep practicing', color: 'text-orange-500' };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reaction Time</h1>
          <p className="text-muted-foreground mt-1">Test your reflexes</p>
        </div>
        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Stats */}
      {attempts.length > 0 && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Average:</span>
            <span className="font-semibold">{averageTime}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Best:</span>
            <span className="font-semibold text-yellow-500">{bestTime}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Attempts:</span>
            <span className="font-semibold">{attempts.length}</span>
          </div>
        </div>
      )}

      {/* Game Area */}
      <button
        onClick={handleClick}
        className={cn(
          'w-full aspect-[2/1] rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
          getBackgroundColor(),
          gameState === 'ready' && 'animate-pulse'
        )}
      >
        <span className={cn(
          'text-4xl font-bold',
          gameState === 'ready' || gameState === 'waiting' ? 'text-white' : 'text-foreground'
        )}>
          {getMessage()}
        </span>
        {gameState === 'clicked' && reactionTime && (
          <span className={cn('text-lg mt-2', getReactionRating(reactionTime).color)}>
            {getReactionRating(reactionTime).label}
          </span>
        )}
      </button>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground mb-3">Recent attempts</p>
            <div className="flex gap-2">
              {attempts.map((time, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 text-center py-2 rounded-lg text-sm font-medium',
                    time === bestTime
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-secondary'
                  )}
                >
                  {time}ms
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Click the box to start</p>
            <p>2. Wait for the box to turn green</p>
            <p>3. Click as fast as you can when it turns green</p>
            <p className="text-yellow-500">Don&apos;t click while it&apos;s red!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
