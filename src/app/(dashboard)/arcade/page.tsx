'use client';

import Link from 'next/link';
import { Brain, Zap, Grid3X3, Puzzle, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const games = [
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Classic block-stacking puzzle. Clear lines and challenge your spatial skills.',
    href: '/arcade/tetris',
    icon: Grid3X3,
    color: 'text-cyan-500',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Find matching pairs. Train your visual memory and concentration.',
    href: '/arcade/memory',
    icon: Brain,
    color: 'text-purple-500',
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    description: 'Test your reflexes. How fast can you respond to visual cues?',
    href: '/arcade/reaction',
    icon: Zap,
    color: 'text-yellow-500',
  },
  {
    id: 'sequence',
    title: 'Sequence Memory',
    description: 'Remember the pattern. Challenge your short-term memory.',
    href: '/arcade/sequence',
    icon: Puzzle,
    color: 'text-green-500',
  },
  {
    id: 'japanese',
    title: 'Japanese',
    description: 'Learn vocabulary with romaji flashcards. Greetings, numbers, and more.',
    href: '/arcade/japanese',
    icon: Languages,
    color: 'text-red-500',
  },
];

export default function ArcadePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Polymath Arcade</h1>
        <p className="text-muted-foreground mt-1">Games and brain training for the curious mind</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link key={game.id} href={game.href}>
            <Card className="h-full cursor-pointer card-interactive group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${game.color}`}>
                    <game.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {game.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {game.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-card to-muted/50">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Train your brain daily</p>
            <p className="text-xs text-muted-foreground">
              Regular brain training can improve memory, focus, and cognitive flexibility.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
