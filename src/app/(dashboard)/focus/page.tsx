'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Coffee,
  Zap,
  Target,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SprintType, Sprint, Task } from '@/types';
import { SPRINT_TYPE_LABELS, SPRINT_TYPE_COLORS } from '@/types';

type TimerState = 'idle' | 'running' | 'paused' | 'break';

const DURATIONS = {
  focus: [15, 25, 45, 60],
  break: [5, 10, 15],
};

// Mock data for demo
const MOCK_SPRINTS: Sprint[] = [
  {
    id: '1',
    user_id: 'demo',
    sprint_type: 'deep_work',
    duration_minutes: 25,
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    completed: true,
    task_id: null,
    notes: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    sprint_type: 'deep_work',
    duration_minutes: 15,
    started_at: new Date(Date.now() - 3600000).toISOString(),
    ended_at: new Date(Date.now() - 2700000).toISOString(),
    completed: true,
    task_id: null,
    notes: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const MOCK_TASKS: Task[] = [];

export default function FocusPage() {
  const { toast } = useToast();
  const [sprintType, setSprintType] = useState<SprintType>('deep_work');
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [ambientMode, setAmbientMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentSprintId, setCurrentSprintId] = useState<string | null>(null);
  const [todaysSprints, setTodaysSprints] = useState<Sprint[]>(MOCK_SPRINTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSessionsCompleted(todaysSprints.filter(s => s.completed).length);
  }, []);

  const startTimer = () => {
    if (timerState === 'idle') {
      // Start new sprint
      const newSprintId = Date.now().toString();
      setCurrentSprintId(newSprintId);
      setTimeLeft(focusDuration * 60);
    }

    setTimerState('running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState('idle');
    setTimeLeft(focusDuration * 60);
    setCurrentSprintId(null);
  };

  const completeSprt = () => {
    if (!currentSprintId) return;

    const newSprint: Sprint = {
      id: currentSprintId,
      user_id: 'demo',
      sprint_type: sprintType,
      duration_minutes: focusDuration,
      started_at: new Date(Date.now() - focusDuration * 60 * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      completed: true,
      task_id: selectedTaskId,
      notes: null,
      created_at: new Date().toISOString(),
    };

    setTodaysSprints([newSprint, ...todaysSprints]);
    setSessionsCompleted((prev) => prev + 1);

    if (soundEnabled) {
      // Play completion sound (browser audio API)
      try {
        const audio = new Audio('/sounds/complete.mp3');
        audio.play().catch(() => {});
      } catch {}
    }

    toast({
      title: 'Sprint Complete!',
      description: `Great work! Take a ${breakDuration} minute break.`,
    });

    // Start break timer
    setTimeLeft(breakDuration * 60);
    setTimerState('break');
    setCurrentSprintId(null);
  };

  useEffect(() => {
    if (timerState === 'running' || timerState === 'break') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerState === 'running') {
              completeSprt();
            } else {
              // Break complete
              toast({
                title: 'Break Over!',
                description: 'Ready for another focus session?',
              });
              setTimerState('idle');
              setTimeLeft(focusDuration * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, focusDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timerState === 'break'
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100;

  const totalFocusMinutes = todaysSprints
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.duration_minutes, 0);

  // Ambient mode
  if (ambientMode && timerState === 'running') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-pointer"
        onClick={() => setAmbientMode(false)}
      >
        <div className="text-center">
          <div
            className="text-[12rem] font-mono font-bold mb-8"
            style={{ color: SPRINT_TYPE_COLORS[sprintType] }}
          >
            {formatTime(timeLeft)}
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 border-white/20 text-white/60">
            {SPRINT_TYPE_LABELS[sprintType]}
          </Badge>
          <p className="text-white/40 mt-8 text-sm">Click anywhere to exit ambient mode</p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(to right, ${SPRINT_TYPE_COLORS[sprintType]} ${progress}%, transparent ${progress}%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Focus Sprints</h1>
          <p className="text-muted-foreground mt-1">
            Deep work sessions with Pomodoro technique
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{sessionsCompleted}</div>
              <p className="text-sm text-muted-foreground">Sessions Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalFocusMinutes} min</div>
              <p className="text-sm text-muted-foreground">Total Focus Time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round((totalFocusMinutes / 60) * 10) / 10}h
              </div>
              <p className="text-sm text-muted-foreground">Productivity Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>
            {timerState === 'break' ? (
              <span className="flex items-center justify-center gap-2">
                <Coffee className="h-5 w-5" />
                Break Time
              </span>
            ) : (
              SPRINT_TYPE_LABELS[sprintType]
            )}
          </CardTitle>
          <CardDescription>
            {timerState === 'idle' && 'Configure your session and press start'}
            {timerState === 'running' && 'Stay focused! You got this.'}
            {timerState === 'paused' && 'Timer paused'}
            {timerState === 'break' && 'Rest and recharge'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Timer Display */}
          <div className="text-center">
            <div
              className={cn(
                'text-8xl font-mono font-bold transition-colors',
                timerState === 'break' && 'text-green-500',
                timerState === 'running' && 'text-primary'
              )}
            >
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="mt-4 h-2" />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {timerState === 'idle' || timerState === 'paused' ? (
              <Button size="lg" onClick={startTimer} className="w-32">
                <Play className="h-5 w-5 mr-2" />
                {timerState === 'paused' ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={pauseTimer} className="w-32">
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5" />
            </Button>
            {timerState === 'running' && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setAmbientMode(true)}
              >
                <Target className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Settings (only when idle) */}
          {timerState === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sprint Type</label>
                <Select
                  value={sprintType}
                  onValueChange={(v: SprintType) => setSprintType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SPRINT_TYPE_LABELS) as SprintType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: SPRINT_TYPE_COLORS[type] }}
                          />
                          {SPRINT_TYPE_LABELS[type]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Duration</label>
                <Select
                  value={focusDuration.toString()}
                  onValueChange={(v) => {
                    setFocusDuration(parseInt(v));
                    setTimeLeft(parseInt(v) * 60);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.focus.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Break Duration</label>
                <Select
                  value={breakDuration.toString()}
                  onValueChange={(v) => setBreakDuration(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.break.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Link to Task */}
          {timerState === 'idle' && tasks.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium">Link to Task (optional)</label>
              <Select
                value={selectedTaskId || 'none'}
                onValueChange={(v) => setSelectedTaskId(v === 'none' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a task to work on" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific task</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {todaysSprints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysSprints.slice(0, 5).map((sprint) => (
                <div
                  key={sprint.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: SPRINT_TYPE_COLORS[sprint.sprint_type] }}
                    />
                    <span>{SPRINT_TYPE_LABELS[sprint.sprint_type]}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{sprint.duration_minutes} min</span>
                    {sprint.completed ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">Incomplete</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
