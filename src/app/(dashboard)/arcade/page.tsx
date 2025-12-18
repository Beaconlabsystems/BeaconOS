'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const games = [
  {
    id: 'chess',
    title: 'Chess',
    description: 'Classic strategy game. Play against yourself or practice openings.',
    href: '/arcade/chess',
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Clear lines and challenge your spatial reasoning.',
    href: '/arcade/tetris',
  },
  {
    id: 'japanese',
    title: 'Japanese',
    description: 'Learn hiragana, katakana, and basic vocabulary.',
    href: '/arcade/japanese',
  },
];

export default function ArcadePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Polymath Arcade</h1>
        <p className="text-muted-foreground mt-1">Games for the curious mind</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link key={game.id} href={game.href}>
            <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardTitle className="text-lg">{game.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{game.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
