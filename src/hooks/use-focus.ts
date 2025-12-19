'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FocusSettings, FocusSession } from '@/lib/supabase/types';

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

export function useFocus() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/focus/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings({
        focusMinutes: data.focus_minutes || 25,
        shortBreakMinutes: data.short_break_minutes || 5,
        longBreakMinutes: data.long_break_minutes || 15,
        sessionsBeforeLongBreak: data.sessions_before_long_break || 4,
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const fetchTodaySessions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/focus/sessions?date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchTodaySessions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSettings, fetchTodaySessions]);

  const saveSettings = async (newSettings: TimerSettings) => {
    try {
      const response = await fetch('/api/focus/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      setSettings(newSettings);
    } catch (err) {
      throw err;
    }
  };

  const startSession = async (mode: 'focus' | 'short-break' | 'long-break', durationMinutes: number) => {
    try {
      const response = await fetch('/api/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, durationMinutes }),
      });
      if (!response.ok) throw new Error('Failed to start session');
      const session = await response.json();
      setSessions((prev) => [session, ...prev]);
      return session;
    } catch (err) {
      throw err;
    }
  };

  const completeSession = async (id: string) => {
    try {
      const response = await fetch(`/api/focus/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      if (!response.ok) throw new Error('Failed to complete session');
      const updated = await response.json();
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const completedFocusSessions = sessions.filter(
    (s) => s.mode === 'focus' && s.completed
  ).length;

  const totalFocusMinutes = sessions
    .filter((s) => s.mode === 'focus' && s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  return {
    settings,
    sessions,
    loading,
    error,
    saveSettings,
    startSession,
    completeSession,
    completedFocusSessions,
    totalFocusMinutes,
    refresh: () => Promise.all([fetchSettings(), fetchTodaySessions()]),
  };
}
