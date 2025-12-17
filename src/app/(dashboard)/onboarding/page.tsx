'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, Check, Target, AlertTriangle, Calendar, Plus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_VISION_CARDS, DEFAULT_MILESTONES, DEFAULT_FLASHCARDS } from '@/lib/seed-data';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Let\'s get you set up' },
  { id: 2, title: 'Goals', description: 'What are you working towards?' },
  { id: 3, title: 'Constraints', description: 'What challenges do you face?' },
  { id: 4, title: 'Innovate UK', description: 'Key funding milestone' },
  { id: 5, title: 'Complete', description: 'You\'re all set!' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { appUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<string[]>(['']);
  const [constraints, setConstraints] = useState('');
  const [innovateUkTarget, setInnovateUkTarget] = useState(true);

  const addGoal = () => {
    if (goals.length < 5) {
      setGoals([...goals, '']);
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const handleComplete = async () => {
    if (!appUser) return;

    setLoading(true);
    const supabase = createClient();

    try {
      // Update user profile
      await supabase
        .from('users')
        .update({
          top_goals: goals.filter((g) => g.trim()),
          current_constraints: constraints || null,
          innovate_uk_target: innovateUkTarget,
          onboarding_completed: true,
        })
        .eq('id', appUser.id);

      // Seed default vision cards
      const visionCards = DEFAULT_VISION_CARDS.map((card) => ({
        ...card,
        user_id: appUser.id,
      }));
      await supabase.from('vision_cards').insert(visionCards);

      // Seed default milestones
      const milestones = DEFAULT_MILESTONES.map((milestone) => ({
        ...milestone,
        user_id: appUser.id,
      }));
      await supabase.from('milestones').insert(milestones);

      // Seed default flashcards
      const today = new Date().toISOString().split('T')[0];
      const flashcards = DEFAULT_FLASHCARDS.map((card) => ({
        ...card,
        user_id: appUser.id,
        box_number: 1,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: today,
        times_correct: 0,
        times_incorrect: 0,
      }));
      await supabase.from('flashcards').insert(flashcards);

      // Create baseline scenario
      await supabase.from('scenarios').insert({
        user_id: appUser.id,
        name: 'Baseline',
        description: 'Default runway scenario',
        is_baseline: true,
        current_cash: 0,
        monthly_burn: 0,
      });

      toast({
        title: 'Welcome to Beacon OS!',
        description: 'Your dashboard is ready.',
      });

      await refreshUser();
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return goals.some((g) => g.trim().length > 0);
      default:
        return true;
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-beacon-950/20">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-beacon-gradient flex items-center justify-center animate-pulse-glow">
              <Sparkles className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Beacon OS</h1>
          <p className="text-muted-foreground mt-2">Setting up your founder cockpit</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={cn(
                  'transition-colors',
                  currentStep >= step.id && 'text-primary font-medium'
                )}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-border/50 shadow-xl">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome, Founder</CardTitle>
                <CardDescription>
                  Let&apos;s personalize Beacon OS for your journey.
                  This will only take a minute.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 py-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Track Goals</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Plan Roadmap</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Stay Focused</p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your Top Goals
                </CardTitle>
                <CardDescription>
                  What are the 3-5 most important things you want to achieve in the next 6 months?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={`Goal ${index + 1} (e.g., "Close SEIS round")`}
                    />
                    {goals.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGoal(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {goals.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addGoal}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Goal
                  </Button>
                )}
              </CardContent>
            </>
          )}

          {/* Step 3: Constraints */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Current Constraints
                </CardTitle>
                <CardDescription>
                  What are the main challenges or limitations you&apos;re facing?
                  (Time, money, team, technical, regulatory...)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., Limited runway, need to balance NHS work with startup, need technical co-founder..."
                  rows={5}
                />
              </CardContent>
            </>
          )}

          {/* Step 4: Innovate UK */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Innovate UK Target
                </CardTitle>
                <CardDescription>
                  Are you targeting the June Innovate UK grant deadline?
                  This helps us prioritize your tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={cn(
                      'cursor-pointer transition-all',
                      innovateUkTarget
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setInnovateUkTarget(true)}
                  >
                    <CardContent className="p-6 text-center">
                      <Check className={cn('h-8 w-8 mx-auto mb-2', innovateUkTarget ? 'text-primary' : 'text-muted-foreground')} />
                      <p className="font-medium">Yes, targeting June</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Prioritize grant-related tasks
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn(
                      'cursor-pointer transition-all',
                      !innovateUkTarget
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setInnovateUkTarget(false)}
                  >
                    <CardContent className="p-6 text-center">
                      <X className={cn('h-8 w-8 mx-auto mb-2', !innovateUkTarget ? 'text-primary' : 'text-muted-foreground')} />
                      <p className="font-medium">Not right now</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Focus on other priorities
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl">You&apos;re All Set!</CardTitle>
                <CardDescription>
                  Your Beacon OS is configured and ready.
                  We&apos;ve set up your default vision board, roadmap milestones, and Japanese flashcards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium">What&apos;s been set up:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      6 default vision board cards
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Complete funding roadmap (SEIS → IPO)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      48 Japanese flashcards with SRS
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Baseline runway scenario
                    </li>
                  </ul>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="beacon"
                onClick={handleComplete}
                loading={loading}
              >
                Launch Dashboard
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
