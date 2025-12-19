'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  MessageSquare,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePriorities } from '@/hooks/use-priorities';
import { cn } from '@/lib/utils';
import type { Priority } from '@/lib/supabase/types';

type Difficulty = 1 | 2 | 3 | 4 | 5;
type PriorityLevel = 'high' | 'medium' | 'low';

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Moderate',
  4: 'Hard',
  5: 'Very Hard',
};

export default function PrioritiesPage() {
  const { toast } = useToast();
  const {
    priorities,
    loading,
    addPriority,
    completePriority,
    reopenPriority,
    deletePriority,
  } = usePriorities();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<Priority | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as PriorityLevel,
  });

  const [completeData, setCompleteData] = useState({
    difficulty: 3 as Difficulty,
    reflection: '',
    tips: '',
  });

  const activeTasks = priorities.filter(t => !t.completed);
  const completedTasks = priorities.filter(t => t.completed);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      setIsSaving(true);
      await addPriority({
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
      });
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsAddDialogOpen(false);
      toast({ title: 'Priority added' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add priority', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartComplete = (task: Priority) => {
    setCompletingTask(task);
    setCompleteData({ difficulty: 3, reflection: '', tips: '' });
    setIsCompleteDialogOpen(true);
  };

  const handleCompleteTask = async () => {
    if (!completingTask) return;

    try {
      setIsSaving(true);
      await completePriority(completingTask.id, {
        difficulty: completeData.difficulty,
        reflection: completeData.reflection || undefined,
        tips: completeData.tips || undefined,
      });
      setIsCompleteDialogOpen(false);
      setCompletingTask(null);
      toast({ title: 'Task completed!', description: 'Reflection saved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to complete task', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUncomplete = async (taskId: string) => {
    try {
      await reopenPriority(taskId);
      toast({ title: 'Task reopened' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reopen task', variant: 'destructive' });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deletePriority(taskId);
      toast({ title: 'Task removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
    }
  };

  const renderDifficultyStars = (difficulty: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              i <= difficulty ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  const today = format(new Date(), 'EEEE, MMMM d');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Daily Priorities</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Priority
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{activeTasks.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Check className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-amber-400" />
            <p className="text-2xl font-bold">
              {completedTasks.length > 0
                ? (completedTasks.reduce((sum, t) => sum + (t.difficulty || 3), 0) / completedTasks.length).toFixed(1)
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Avg Difficulty</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Active Priorities ({activeTasks.length})
        </h2>

        {activeTasks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No active priorities. Add one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeTasks.map(task => (
              <Card
                key={task.id}
                className={cn(
                  'transition-all cursor-pointer',
                  expandedId === task.id ? 'ring-1 ring-primary' : 'hover:bg-accent/30'
                )}
              >
                <CardContent className="py-4">
                  <div
                    className="flex items-start gap-3"
                    onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  >
                    <button
                      className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartComplete(task);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={cn('text-xs shrink-0', PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    {expandedId === task.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {expandedId === task.id && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStartComplete(task)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <button
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Completed ({completedTasks.length})
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map(task => (
                <Card
                  key={task.id}
                  className={cn(
                    'transition-all cursor-pointer opacity-70',
                    expandedId === task.id ? 'ring-1 ring-primary opacity-100' : 'hover:opacity-100'
                  )}
                >
                  <CardContent className="py-4">
                    <div
                      className="flex items-start gap-3"
                      onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                    >
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                          {task.difficulty && renderDifficultyStars(task.difficulty)}
                        </div>
                        {task.completed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed {format(new Date(task.completed_at), 'MMM d')}
                          </p>
                        )}
                      </div>
                      {(task.reflection || task.tips) && (
                        expandedId === task.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )
                      )}
                    </div>

                    {expandedId === task.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                        {task.difficulty && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Difficulty:</span>
                            <span>{DIFFICULTY_LABELS[task.difficulty as Difficulty]}</span>
                          </div>
                        )}

                        {task.reflection && (
                          <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Reflection
                            </div>
                            <p className="text-sm text-muted-foreground">{task.reflection}</p>
                          </div>
                        )}

                        {task.tips && (
                          <div className="bg-amber-500/10 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                              <Lightbulb className="h-4 w-4" />
                              Tip for Future
                            </div>
                            <p className="text-sm text-amber-700/80">{task.tips}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUncomplete(task.id)}
                          >
                            Reopen Task
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Priority</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">What needs to be done? *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Review pitch deck"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Details (optional)</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Any additional context..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as PriorityLevel[]).map(p => (
                  <Button
                    key={p}
                    type="button"
                    variant={newTask.priority === p ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      newTask.priority === p && PRIORITY_COLORS[p]
                    )}
                    onClick={() => setNewTask({ ...newTask, priority: p })}
                  >
                    {PRIORITY_LABELS[p].replace(' Priority', '')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title.trim() || isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>

          {completingTask && (
            <div className="space-y-4 py-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="font-medium">{completingTask.title}</p>
                {completingTask.description && (
                  <p className="text-sm text-muted-foreground mt-1">{completingTask.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>How hard was this task?</Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as Difficulty[]).map(d => (
                    <Button
                      key={d}
                      type="button"
                      variant={completeData.difficulty === d ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setCompleteData({ ...completeData, difficulty: d })}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {DIFFICULTY_LABELS[completeData.difficulty]}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reflection">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Reflection (optional)
                </Label>
                <Textarea
                  id="reflection"
                  value={completeData.reflection}
                  onChange={(e) => setCompleteData({ ...completeData, reflection: e.target.value })}
                  placeholder="How did it go? What did you learn?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tips">
                  <Lightbulb className="h-4 w-4 inline mr-1" />
                  Tip for Future (optional)
                </Label>
                <Textarea
                  id="tips"
                  value={completeData.tips}
                  onChange={(e) => setCompleteData({ ...completeData, tips: e.target.value })}
                  placeholder="What would you do differently next time?"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteTask} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
