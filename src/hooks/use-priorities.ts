'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Priority } from '@/lib/supabase/types';

export function usePriorities() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPriorities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/priorities');
      if (!response.ok) throw new Error('Failed to fetch priorities');
      const data = await response.json();
      setPriorities(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriorities();
  }, [fetchPriorities]);

  const addPriority = async (priority: {
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
  }) => {
    try {
      const response = await fetch('/api/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priority),
      });
      if (!response.ok) throw new Error('Failed to add priority');
      const newPriority = await response.json();
      setPriorities((prev) => [newPriority, ...prev]);
      return newPriority;
    } catch (err) {
      throw err;
    }
  };

  const updatePriority = async (id: string, updates: Partial<Priority>) => {
    try {
      const response = await fetch(`/api/priorities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update priority');
      const updated = await response.json();
      setPriorities((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deletePriority = async (id: string) => {
    try {
      const response = await fetch(`/api/priorities/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete priority');
      setPriorities((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const completePriority = async (
    id: string,
    data: {
      difficulty: number;
      reflection?: string;
      tips?: string;
    }
  ) => {
    return updatePriority(id, {
      completed: true,
      completed_at: new Date().toISOString(),
      difficulty: data.difficulty,
      reflection: data.reflection,
      tips: data.tips,
    });
  };

  const reopenPriority = async (id: string) => {
    return updatePriority(id, {
      completed: false,
      completed_at: null,
      difficulty: null,
      reflection: null,
      tips: null,
    });
  };

  return {
    priorities,
    loading,
    error,
    refresh: fetchPriorities,
    addPriority,
    updatePriority,
    deletePriority,
    completePriority,
    reopenPriority,
  };
}
