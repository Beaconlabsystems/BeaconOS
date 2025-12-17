'use client';

import { useState } from 'react';
import {
  Flame,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockMilestones = [
  { id: '1', title: 'Innovate UK Grant', swimlane: 'funding', status: 'in_progress', color: '#0ea5e9', target_date: '2025-03-01' },
  { id: '2', title: 'MVP Launch', swimlane: 'product', status: 'pending', color: '#8b5cf6', target_date: '2025-04-01' },
  { id: '3', title: 'First Pilot Customer', swimlane: 'commercial', status: 'pending', color: '#10b981', target_date: '2025-05-01' },
  { id: '4', title: 'SEIS Round', swimlane: 'funding', status: 'pending', color: '#f59e0b', target_date: '2025-06-01' },
];

const mockNextAction = {
  task: {
    id: '1',
    title: 'Complete Innovate UK application draft',
    description: 'Finish the technical approach section and budget breakdown',
    priority: 'high' as const,
  },
  reasons: ['High priority', 'Due soon', 'Funding milestone'],
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [quickJournal, setQuickJournal] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);

  const handleQuickJournal = async () => {
    if (!quickJournal.trim()) return;
    setSavingJournal(true);

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Journal saved',
      description: 'Your quick note has been added.',
    });
    setQuickJournal('');
    setSavingJournal(false);
  };

  const handleCompleteTask = () => {
    toast({
      title: 'Task completed!',
      description: 'Great job! Keep the momentum going.',
    });
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting()}, Tungi
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-500">7 day streak</span>
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Runway</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 months</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(450000)} at {formatCurrency(25000)}/mo
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <Progress value={80} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">80% completion rate</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">2 due today</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Milestones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">1 completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Action Card */}
        <Card className="lg:col-span-2 overflow-hidden relative">
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
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{mockNextAction.task.title}</h3>
                  <p className="text-muted-foreground">{mockNextAction.task.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {mockNextAction.reasons.map((reason, i) => (
                      <Badge key={i} variant="secondary">{reason}</Badge>
                    ))}
                  </div>
                </div>
                <Badge variant="warning">{mockNextAction.task.priority}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleCompleteTask} variant="beacon">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
                <Button variant="outline">
                  Start Working
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Journal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Journal
            </CardTitle>
            <CardDescription>What&apos;s on your mind?</CardDescription>
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
            >
              {savingJournal ? 'Saving...' : 'Save Entry'}
            </Button>
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
            {mockMilestones.map((milestone) => (
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
                  <p className="text-sm text-muted-foreground capitalize">{milestone.swimlane}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(milestone.target_date, 'MMM yyyy')}
                </div>
                <Badge variant={milestone.status === 'in_progress' ? 'info' : 'secondary'}>
                  {milestone.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
