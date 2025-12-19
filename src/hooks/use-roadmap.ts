'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RoadmapMilestone } from '@/lib/supabase/types';

export function useRoadmap() {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roadmap');
      if (!response.ok) throw new Error('Failed to fetch milestones');
      const data = await response.json();
      setMilestones(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const addMilestone = async (milestone: {
    title: string;
    description?: string;
    type: 'funding' | 'product' | 'team' | 'revenue' | 'other';
    status: 'planned' | 'in-progress' | 'completed';
    targetDate?: string;
  }) => {
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      if (!response.ok) throw new Error('Failed to add milestone');
      const newMilestone = await response.json();
      setMilestones((prev) => [...prev, newMilestone]);
      return newMilestone;
    } catch (err) {
      throw err;
    }
  };

  const updateMilestone = async (id: string, updates: Partial<RoadmapMilestone>) => {
    try {
      const response = await fetch(`/api/roadmap/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update milestone');
      const updated = await response.json();
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const response = await fetch(`/api/roadmap/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete milestone');
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const updateStatus = async (
    id: string,
    status: 'planned' | 'in-progress' | 'completed'
  ) => {
    const updates: Partial<RoadmapMilestone> = { status };
    if (status === 'completed') {
      updates.completed_date = new Date().toISOString().split('T')[0];
    }
    return updateMilestone(id, updates);
  };

  return {
    milestones,
    loading,
    error,
    refresh: fetchMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    updateStatus,
  };
}
