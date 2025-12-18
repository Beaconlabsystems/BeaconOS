'use client';

import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;
type PieceColor = 'white' | 'black';
type Piece = { type: PieceType; color: PieceColor } | null;

const PIECE_SYMBOLS: Record<string, string> = {
  'white-K': '♔', 'white-Q': '♕', 'white-R': '♖', 'white-B': '♗', 'white-N': '♘', 'white-P': '♙',
  'black-K': '♚', 'black-Q': '♛', 'black-R': '♜', 'black-B': '♝', 'black-N': '♞', 'black-P': '♟',
};

function createInitialBoard(): Piece[][] {
  const board: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces (top)
  board[0] = [
    { type: 'R', color: 'black' }, { type: 'N', color: 'black' }, { type: 'B', color: 'black' },
    { type: 'Q', color: 'black' }, { type: 'K', color: 'black' }, { type: 'B', color: 'black' },
    { type: 'N', color: 'black' }, { type: 'R', color: 'black' },
  ];
  board[1] = Array(8).fill(null).map(() => ({ type: 'P' as PieceType, color: 'black' as PieceColor }));

  // White pieces (bottom)
  board[6] = Array(8).fill(null).map(() => ({ type: 'P' as PieceType, color: 'white' as PieceColor }));
  board[7] = [
    { type: 'R', color: 'white' }, { type: 'N', color: 'white' }, { type: 'B', color: 'white' },
    { type: 'Q', color: 'white' }, { type: 'K', color: 'white' }, { type: 'B', color: 'white' },
    { type: 'N', color: 'white' }, { type: 'R', color: 'white' },
  ];

  return board;
}

export default function ChessPage() {
  const [board, setBoard] = useState<Piece[][]>(createInitialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    const piece = board[row][col];

    if (selected) {
      const [selectedRow, selectedCol] = selected;
      const selectedPiece = board[selectedRow][selectedCol];

      // If clicking on own piece, select it instead
      if (piece && piece.color === turn) {
        setSelected([row, col]);
        return;
      }

      // Move piece (basic move, no validation)
      if (selectedPiece) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = selectedPiece;
        newBoard[selectedRow][selectedCol] = null;
        setBoard(newBoard);

        const files = 'abcdefgh';
        const move = `${PIECE_SYMBOLS[`${selectedPiece.color}-${selectedPiece.type}`]} ${files[selectedCol]}${8 - selectedRow} → ${files[col]}${8 - row}`;
        setMoveHistory(prev => [...prev, move]);

        setTurn(turn === 'white' ? 'black' : 'white');
      }
      setSelected(null);
    } else if (piece && piece.color === turn) {
      setSelected([row, col]);
    }
  }, [board, selected, turn]);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelected(null);
    setTurn('white');
    setMoveHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Chess</h1>
          <p className="text-muted-foreground mt-1">
            {turn === 'white' ? 'White' : 'Black'} to move
          </p>
        </div>
        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Chess Board */}
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-8 border border-border">
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  const isSelected = selected?.[0] === rowIndex && selected?.[1] === colIndex;

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                      className={cn(
                        'w-12 h-12 flex items-center justify-center text-3xl',
                        isLight ? 'chess-square-light' : 'chess-square-dark',
                        isSelected && 'ring-2 ring-primary ring-inset'
                      )}
                    >
                      {piece && PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Move History */}
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Move History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {moveHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No moves yet</p>
              ) : (
                moveHistory.map((move, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {move}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Click a piece to select it, then click a destination square to move.
        This is a simplified version without move validation.
      </p>
    </div>
  );
}
