'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TimerMode = 'focus' | 'short-break' | 'long-break';

interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

export default function FocusPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getModeMinutes = useCallback((m: TimerMode) => {
    switch (m) {
      case 'focus': return settings.focusMinutes;
      case 'short-break': return settings.shortBreakMinutes;
      case 'long-break': return settings.longBreakMinutes;
    }
  }, [settings]);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode || mode;
    setTimeLeft(getModeMinutes(targetMode) * 60);
    setIsRunning(false);
  }, [mode, getModeMinutes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'focus') {
        const newSessions = completedSessions + 1;
        setCompletedSessions(newSessions);
        toast({
          title: 'Focus session complete!',
          description: 'Time for a break.',
        });

        // Determine break type
        if (newSessions % settings.sessionsBeforeLongBreak === 0) {
          setMode('long-break');
          setTimeLeft(settings.longBreakMinutes * 60);
        } else {
          setMode('short-break');
          setTimeLeft(settings.shortBreakMinutes * 60);
        }
      } else {
        // Break completed
        toast({
          title: 'Break over!',
          description: 'Ready to focus again?',
        });
        setMode('focus');
        setTimeLeft(settings.focusMinutes * 60);
      }
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, completedSessions, settings, toast]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getModeMinutes(newMode) * 60);
    setIsRunning(false);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setTimeLeft(tempSettings.focusMinutes * 60);
    setMode('focus');
    setIsRunning(false);
    setIsSettingsOpen(false);
    toast({ title: 'Settings saved' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = getModeMinutes(mode) * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Focus</h1>
          <p className="text-muted-foreground mt-1">Pomodoro timer for deep work</p>
        </div>
        <Button variant="outline" onClick={() => { setTempSettings(settings); setIsSettingsOpen(true); }}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'focus' ? 'default' : 'outline'}
          onClick={() => switchMode('focus')}
          className="flex-1"
        >
          <Brain className="h-4 w-4 mr-2" />
          Focus
        </Button>
        <Button
          variant={mode === 'short-break' ? 'default' : 'outline'}
          onClick={() => switchMode('short-break')}
          className="flex-1"
        >
          <Coffee className="h-4 w-4 mr-2" />
          Short Break
        </Button>
        <Button
          variant={mode === 'long-break' ? 'default' : 'outline'}
          onClick={() => switchMode('long-break')}
          className="flex-1"
        >
          <Coffee className="h-4 w-4 mr-2" />
          Long Break
        </Button>
      </div>

      {/* Timer */}
      <Card className="overflow-hidden">
        <CardContent className="py-12">
          <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className="relative">
              <svg width="280" height="280" className="-rotate-90">
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  fill="none"
                  strokeWidth="8"
                  className="timer-bg"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={cn(
                    'timer-ring',
                    mode === 'focus' ? 'stroke-primary' : 'stroke-green-500'
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold font-heading tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">
                  {mode === 'focus' ? 'Focus Time' : mode === 'short-break' ? 'Short Break' : 'Long Break'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-8">
              <Button
                size="lg"
                variant={isRunning ? 'outline' : 'default'}
                onClick={toggleTimer}
                className="w-32"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => resetTimer()}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sessions completed today</p>
              <p className="text-2xl font-semibold">{completedSessions}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total focus time</p>
              <p className="text-2xl font-semibold">{completedSessions * settings.focusMinutes} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Focus for {settings.focusMinutes} minutes on a single task</p>
          <p>2. Take a {settings.shortBreakMinutes} minute break</p>
          <p>3. After {settings.sessionsBeforeLongBreak} sessions, take a {settings.longBreakMinutes} minute break</p>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusMinutes">Focus Duration (min)</Label>
                <Input
                  id="focusMinutes"
                  type="number"
                  min={1}
                  max={90}
                  value={tempSettings.focusMinutes}
                  onChange={(e) => setTempSettings({ ...tempSettings, focusMinutes: parseInt(e.target.value) || 25 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreakMinutes">Short Break (min)</Label>
                <Input
                  id="shortBreakMinutes"
                  type="number"
                  min={1}
                  max={30}
                  value={tempSettings.shortBreakMinutes}
                  onChange={(e) => setTempSettings({ ...tempSettings, shortBreakMinutes: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longBreakMinutes">Long Break (min)</Label>
                <Input
                  id="longBreakMinutes"
                  type="number"
                  min={1}
                  max={60}
                  value={tempSettings.longBreakMinutes}
                  onChange={(e) => setTempSettings({ ...tempSettings, longBreakMinutes: parseInt(e.target.value) || 15 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionsBeforeLongBreak">Sessions before long break</Label>
                <Input
                  id="sessionsBeforeLongBreak"
                  type="number"
                  min={1}
                  max={10}
                  value={tempSettings.sessionsBeforeLongBreak}
                  onChange={(e) => setTempSettings({ ...tempSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
