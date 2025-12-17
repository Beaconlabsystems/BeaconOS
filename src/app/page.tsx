'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuth } from './providers';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, appUser } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (appUser?.onboarding_completed) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, appUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-beacon-950/20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-beacon-gradient flex items-center justify-center animate-pulse-glow">
          <Sparkles className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">Beacon OS</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
}
