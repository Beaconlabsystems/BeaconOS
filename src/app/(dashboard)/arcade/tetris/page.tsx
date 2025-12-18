'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TICK_SPEED = 500;

type Cell = string | null;
type Board = Cell[][];

const TETROMINOS: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-stone-400' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-stone-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-stone-400' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-stone-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-stone-400' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-stone-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-stone-400' },
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

function createEmptyBoard(): Board {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}

function randomTetromino() {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  return { ...TETROMINOS[key], type: key };
}

function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

export default function TetrisPage() {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState(() => randomTetromino());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const checkCollision = useCallback((piece: typeof currentPiece, pos: { x: number; y: number }, b: Board) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const newY = pos.y + r;
          const newX = pos.x + c;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          if (newY >= 0 && b[newY][newX]) return true;
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const y = position.y + r;
          const x = position.x + c;
          if (y >= 0) {
            newBoard[y][x] = currentPiece.color;
          }
        }
      }
    }

    // Check for completed lines
    let clearedLines = 0;
    for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
      if (newBoard[r].every(cell => cell !== null)) {
        newBoard.splice(r, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        clearedLines++;
        r++; // Check the same row again
      }
    }

    if (clearedLines > 0) {
      setLines(prev => prev + clearedLines);
      setScore(prev => prev + clearedLines * 100);
    }

    setBoard(newBoard);

    // Spawn new piece
    const newPiece = randomTetromino();
    const newPos = { x: 3, y: 0 };

    if (checkCollision(newPiece, newPos, newBoard)) {
      setGameOver(true);
      setIsPaused(true);
    } else {
      setCurrentPiece(newPiece);
      setPosition(newPos);
    }
  }, [board, currentPiece, position, checkCollision]);

  const moveDown = useCallback(() => {
    const newPos = { ...position, y: position.y + 1 };
    if (checkCollision(currentPiece, newPos, board)) {
      mergePiece();
    } else {
      setPosition(newPos);
    }
  }, [position, currentPiece, board, checkCollision, mergePiece]);

  const moveHorizontal = useCallback((dir: number) => {
    const newPos = { ...position, x: position.x + dir };
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [position, currentPiece, board, checkCollision]);

  const rotate = useCallback(() => {
    const rotated = { ...currentPiece, shape: rotateMatrix(currentPiece.shape) };
    if (!checkCollision(rotated, position, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, board, checkCollision]);

  const hardDrop = useCallback(() => {
    let newY = position.y;
    while (!checkCollision(currentPiece, { ...position, y: newY + 1 }, board)) {
      newY++;
    }
    setPosition({ ...position, y: newY });
    setTimeout(mergePiece, 50);
  }, [position, currentPiece, board, checkCollision, mergePiece]);

  // Game loop
  useEffect(() => {
    if (!isPaused && !gameOver) {
      gameLoopRef.current = setInterval(moveDown, TICK_SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, gameOver, moveDown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver, moveHorizontal, moveDown, rotate, hardDrop]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(randomTetromino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPaused(true);
  };

  // Render board with current piece
  const renderBoard = () => {
    const display = board.map(row => [...row]);

    // Add current piece to display
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const y = position.y + r;
          const x = position.x + c;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            display[y][x] = currentPiece.color;
          }
        }
      }
    }

    return display;
  };

  const displayBoard = renderBoard();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tetris</h1>
          <p className="text-muted-foreground mt-1">Clear lines, challenge yourself</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver}
          >
            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {isPaused ? 'Play' : 'Pause'}
          </Button>
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Game Board */}
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div className="border border-border bg-muted/50">
              {displayBoard.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={cn(
                        'w-6 h-6 border border-border/50',
                        cell || 'bg-background'
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
            {gameOver && (
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Game Over</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{score}</p>
              <p className="text-sm text-muted-foreground">{lines} lines cleared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd> Move</p>
              <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd> Rotate</p>
              <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd> Soft drop</p>
              <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> Hard drop</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
