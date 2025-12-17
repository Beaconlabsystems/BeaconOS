'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { getNextAction, getTaskStats } from '@/lib/next-action-engine';
import type { Task, Milestone, JournalEntry, Scenario, NextActionResult } from '@/types';
import { formatDate, formatCurrency, calculateRunwayMonths } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [nextAction, setNextAction] = useState<NextActionResult | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [quickJournal, setQuickJournal] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);

  useEffect(() => {
    if (appUser) {
      fetchDashboardData();
    }
  }, [appUser]);

  const fetchDashboardData = async () => {
    if (!appUser) return;

    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', appUser.id)
        .neq('status', 'archived')
        .order('due_date', { ascending: true });

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', appUser.id)
        .order('position', { ascending: true });

      // Fetch today's journal entry
      const today = new Date().toISOString().split('T')[0];
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', appUser.id)
        .eq('entry_date', today)
        .single();

      // Fetch baseline scenario
      const { data: scenarioData } = await supabase
        .from('scenarios')
        .select('*')
        .eq('user_id', appUser.id)
        .eq('is_baseline', true)
        .single();

      const fetchedTasks = (tasksData || []) as Task[];
      const fetchedMilestones = (milestonesData || []) as Milestone[];

      setTasks(fetchedTasks);
      setMilestones(fetchedMilestones);
      setTodayEntry(journalData as JournalEntry | null);
      setScenario(scenarioData as Scenario | null);

      // Calculate next action
      const action = getNextAction({
        tasks: fetchedTasks,
        milestones: fetchedMilestones,
        currentStreak: appUser.current_streak || 0,
        todayEntryExists: !!journalData,
      });
      setNextAction(action);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJournal = async () => {
    if (!quickJournal.trim() || !appUser) return;

    setSavingJournal(true);
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    try {
      if (todayEntry) {
        // Update existing entry
        await supabase
          .from('journal_entries')
          .update({
            content: todayEntry.content
              ? `${todayEntry.content}\n\n${quickJournal}`
              : quickJournal,
          })
          .eq('id', todayEntry.id);
      } else {
        // Create new entry
        await supabase.from('journal_entries').insert({
          user_id: appUser.id,
          entry_date: today,
          content: quickJournal,
        });
      }

      toast({
        title: 'Journal saved',
        description: 'Your quick note has been added.',
      });

      setQuickJournal('');
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save journal entry.',
      });
    } finally {
      setSavingJournal(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const supabase = createClient();

    try {
      await supabase
        .from('tasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      toast({
        title: 'Task completed!',
        description: 'Great job! Keep the momentum going.',
      });

      fetchDashboardData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to complete task.',
      });
    }
  };

  const stats = getTaskStats(tasks);
  const runwayMonths = scenario
    ? calculateRunwayMonths(scenario.current_cash, scenario.monthly_burn)
    : null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting()}, {appUser?.full_name?.split(' ')[0] || 'Founder'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {appUser?.current_streak && appUser.current_streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-5 w-5 text-orange-500 fire-icon" />
              <span className="font-semibold text-orange-500">
                {appUser.current_streak} day streak
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Runway */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Runway
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {runwayMonths !== null ? (
                runwayMonths === Infinity ? (
                  '∞'
                ) : (
                  `${runwayMonths} months`
                )
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </div>
            {scenario && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(scenario.current_cash)} at {formatCurrency(scenario.monthly_burn)}/mo
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasks Progress */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completed}/{stats.total}
            </div>
            <Progress value={stats.completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className={`card-hover ${stats.overdue > 0 ? 'border-destructive/50' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Tasks
            </CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats.overdue > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-destructive' : ''}`}>
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.dueToday} due today
            </p>
          </CardContent>
        </Card>

        {/* Active Milestones */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Milestones
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {milestones.filter((m) => m.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {milestones.filter((m) => m.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Action Card */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Next Action</CardTitle>
                <CardDescription>Your recommended next step</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {nextAction ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{nextAction.task.title}</h3>
                    {nextAction.task.description && (
                      <p className="text-muted-foreground">
                        {nextAction.task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {nextAction.reasons.map((reason, i) => (
                        <Badge key={i} variant="secondary">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge
                    variant={
                      nextAction.task.priority === 'urgent'
                        ? 'destructive'
                        : nextAction.task.priority === 'high'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {nextAction.task.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleCompleteTask(nextAction.task.id)}
                    variant="beacon"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                  <Button variant="outline">
                    Start Working
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-muted-foreground mt-1">
                  No pending tasks. Time to add new goals!
                </p>
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Journal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Journal
            </CardTitle>
            <CardDescription>
              What&apos;s on your mind?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type a quick thought..."
              value={quickJournal}
              onChange={(e) => setQuickJournal(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <Button
              onClick={handleQuickJournal}
              disabled={!quickJournal.trim() || savingJournal}
              className="w-full"
              loading={savingJournal}
            >
              Save Entry
            </Button>
            {todayEntry && (
              <p className="text-xs text-muted-foreground text-center">
                You&apos;ve already journaled today
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Milestones</CardTitle>
              <CardDescription>Key targets on your roadmap</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/roadmap">View Roadmap</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones
              .filter((m) => m.status !== 'completed')
              .slice(0, 4)
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: milestone.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {milestone.swimlane}
                    </p>
                  </div>
                  {milestone.target_date && (
                    <div className="text-sm text-muted-foreground">
                      {formatDate(milestone.target_date, 'MMM yyyy')}
                    </div>
                  )}
                  <Badge
                    variant={
                      milestone.status === 'in_progress'
                        ? 'info'
                        : milestone.status === 'blocked'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {milestone.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            {milestones.filter((m) => m.status !== 'completed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active milestones. Visit the Roadmap to add some!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
