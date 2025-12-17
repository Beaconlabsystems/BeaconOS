'use client';

import Link from 'next/link';
import { Gamepad2, Brain, BookOpen, Trophy, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/app/providers';

export default function GamesPage() {
  const { appUser } = useAuth();

  const games = [
    {
      id: 'memory',
      title: 'Memory Challenge',
      description: 'Train your memory with card matching and sequence recall',
      icon: Brain,
      href: '/games/memory',
      color: 'from-purple-500 to-pink-500',
      stats: {
        highScore: 1250,
        gamesPlayed: 24,
      },
    },
    {
      id: 'japanese',
      title: 'Japanese Learning',
      description: 'Master Japanese with spaced repetition flashcards',
      icon: BookOpen,
      href: '/games/japanese',
      color: 'from-orange-500 to-red-500',
      stats: {
        cardsLearned: 45,
        dueToday: 12,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Games & Learning</h1>
          <p className="text-muted-foreground mt-1">
            Train your brain while taking a break
          </p>
        </div>
        <div className="flex items-center gap-3">
          {appUser?.current_streak && appUser.current_streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-orange-500">
                {appUser.current_streak} day streak
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={game.href}>
            <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${game.color}`}>
                    <game.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {game.title}
                    </CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {game.id === 'memory' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">High Score: {game.stats.highScore}</span>
                      </div>
                      <Badge variant="secondary">
                        {game.stats.gamesPlayed} games played
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{game.stats.cardsLearned} cards learned</span>
                      </div>
                      <Badge variant={game.stats.dueToday > 0 ? 'default' : 'secondary'}>
                        {game.stats.dueToday} due today
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Daily Challenge */}
      <Card className="bg-gradient-to-br from-beacon-500/10 to-beacon-600/5 border-beacon-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-beacon-500" />
                Daily Challenge
              </CardTitle>
              <CardDescription>
                Complete today&apos;s challenge to maintain your streak
              </CardDescription>
            </div>
            <Badge variant="beacon" className="bg-beacon-500/20 text-beacon-400">
              +50 XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Today&apos;s Progress</span>
              <span>2/3 activities</span>
            </div>
            <Progress value={66} className="h-2" />
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <Brain className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-green-500">Memory</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <BookOpen className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-green-500">Japanese</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border text-center">
                <Trophy className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs">Bonus Round</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
