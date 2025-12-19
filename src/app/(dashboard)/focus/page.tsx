'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Loader2 } from 'lucide-react';
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
import { useFocus } from '@/hooks/use-focus';
import { cn } from '@/lib/utils';

type TimerMode = 'focus' | 'short-break' | 'long-break';

export default function FocusPage() {
  const { toast } = useToast();
  const {
    settings,
    loading,
    saveSettings,
    startSession,
    completeSession,
    completedFocusSessions,
    totalFocusMinutes,
  } = useFocus();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timeLeft when settings load
  useEffect(() => {
    if (!loading) {
      setTimeLeft(settings.focusMinutes * 60);
      setTempSettings(settings);
    }
  }, [loading, settings]);

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
    setCurrentSessionId(null);
  }, [mode, getModeMinutes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentSessionId) {
      // Timer completed - mark session as complete
      completeSession(currentSessionId).catch(console.error);

      if (mode === 'focus') {
        toast({
          title: 'Focus session complete!',
          description: 'Time for a break.',
        });

        // Determine break type
        const newSessionCount = completedFocusSessions + 1;
        if (newSessionCount % settings.sessionsBeforeLongBreak === 0) {
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
      setCurrentSessionId(null);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, settings, toast, currentSessionId, completedFocusSessions, completeSession]);

  const toggleTimer = async () => {
    if (!isRunning && !currentSessionId) {
      // Starting a new session
      try {
        const session = await startSession(mode, getModeMinutes(mode));
        setCurrentSessionId(session.id);
      } catch (err) {
        console.error('Failed to start session:', err);
      }
    }
    setIsRunning(!isRunning);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getModeMinutes(newMode) * 60);
    setIsRunning(false);
    setCurrentSessionId(null);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings(tempSettings);
      setTimeLeft(tempSettings.focusMinutes * 60);
      setMode('focus');
      setIsRunning(false);
      setCurrentSessionId(null);
      setIsSettingsOpen(false);
      toast({ title: 'Settings saved' });
    } catch {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <p className="text-2xl font-semibold">{completedFocusSessions}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total focus time</p>
              <p className="text-2xl font-semibold">{totalFocusMinutes} min</p>
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
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
