/**
 * Next Action Engine
 *
 * A deterministic rules-based recommender that picks the next best step
 * based on weighted scoring:
 *
 * 1. Overdue tasks (highest weight)
 * 2. Milestone prerequisites
 * 3. High-impact tags (Innovate/IoCT/Revenue)
 * 4. Streak continuity
 * 5. Priority level
 * 6. Due date proximity
 */

import type { Task, Milestone, ScoredTask, NextActionResult } from '@/types';
import { PRIORITY_WEIGHTS, TAG_WEIGHTS } from '@/types';
import { parseISO, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

// Weight configuration
const WEIGHTS = {
  OVERDUE: 200,
  DUE_TODAY: 150,
  DUE_TOMORROW: 100,
  DUE_THIS_WEEK: 50,
  IS_PREREQUISITE: 75,
  IN_PROGRESS_MILESTONE: 40,
  QUICK_WIN_BONUS: 30,
  STREAK_CONTINUITY: 25,
  RECURRING_BONUS: 15,
} as const;

interface NextActionEngineInput {
  tasks: Task[];
  milestones: Milestone[];
  currentStreak: number;
  todayEntryExists: boolean;
}

/**
 * Calculate score for a single task
 */
function calculateTaskScore(
  task: Task,
  milestones: Milestone[],
  currentStreak: number,
  todayEntryExists: boolean
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const today = startOfDay(new Date());

  // Skip completed or archived tasks
  if (task.status === 'done' || task.status === 'archived') {
    return { score: -1, reasons: [] };
  }

  // 1. Due date scoring
  if (task.due_date) {
    const dueDate = startOfDay(parseISO(task.due_date));
    const daysUntilDue = differenceInDays(dueDate, today);

    if (daysUntilDue < 0) {
      // Overdue - highest priority
      const overdueDays = Math.abs(daysUntilDue);
      score += WEIGHTS.OVERDUE + (overdueDays * 10); // More overdue = higher score
      reasons.push(`Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`);
    } else if (daysUntilDue === 0) {
      score += WEIGHTS.DUE_TODAY;
      reasons.push('Due today');
    } else if (daysUntilDue === 1) {
      score += WEIGHTS.DUE_TOMORROW;
      reasons.push('Due tomorrow');
    } else if (daysUntilDue <= 7) {
      score += WEIGHTS.DUE_THIS_WEEK;
      reasons.push('Due this week');
    }
  }

  // 2. Priority scoring
  const priorityScore = PRIORITY_WEIGHTS[task.priority] || 0;
  score += priorityScore;
  if (task.priority === 'urgent') {
    reasons.push('Urgent priority');
  } else if (task.priority === 'high') {
    reasons.push('High priority');
  }

  // 3. Tag scoring (impact tags)
  if (task.tags && task.tags.length > 0) {
    let tagScore = 0;
    const impactTags: string[] = [];

    for (const tag of task.tags) {
      const tagLower = tag.toLowerCase();
      if (TAG_WEIGHTS[tagLower]) {
        tagScore += TAG_WEIGHTS[tagLower];
        impactTags.push(tag);
      }
    }

    if (tagScore > 0) {
      score += tagScore;
      reasons.push(`High-impact: ${impactTags.join(', ')}`);
    }
  }

  // 4. Milestone relationship scoring
  if (task.milestone_id) {
    const milestone = milestones.find(m => m.id === task.milestone_id);

    if (milestone) {
      // Boost tasks linked to in-progress milestones
      if (milestone.status === 'in_progress') {
        score += WEIGHTS.IN_PROGRESS_MILESTONE;
        reasons.push(`Linked to active milestone: ${milestone.title}`);
      }

      // Check if this task is a prerequisite for any upcoming milestone
      const isPrerequisite = milestones.some(
        m =>
          m.status === 'pending' &&
          m.prerequisites?.some(p =>
            p.toLowerCase().includes(task.title.toLowerCase())
          )
      );

      if (isPrerequisite) {
        score += WEIGHTS.IS_PREREQUISITE;
        reasons.push('Prerequisite for upcoming milestone');
      }
    }
  }

  // 5. Quick win bonus (tasks with estimated time under 30 mins)
  if (task.estimated_minutes && task.estimated_minutes <= 30) {
    score += WEIGHTS.QUICK_WIN_BONUS;
    reasons.push('Quick win (<30 min)');
  }

  // 6. Streak continuity
  if (currentStreak > 0 && !todayEntryExists) {
    // Encourage maintaining streak by slightly boosting all tasks
    score += WEIGHTS.STREAK_CONTINUITY;
    reasons.push(`Maintain ${currentStreak}-day streak`);
  }

  // 7. Recurring task bonus
  if (task.is_recurring) {
    score += WEIGHTS.RECURRING_BONUS;
    reasons.push('Recurring task');
  }

  // 8. In-progress tasks get a small boost (finish what you started)
  if (task.status === 'in_progress') {
    score += 20;
    reasons.push('Already in progress');
  }

  return { score, reasons };
}

/**
 * Get the next recommended action
 */
export function getNextAction(input: NextActionEngineInput): NextActionResult | null {
  const { tasks, milestones, currentStreak, todayEntryExists } = input;

  // Filter to only actionable tasks
  const actionableTasks = tasks.filter(
    t => t.status === 'todo' || t.status === 'in_progress'
  );

  if (actionableTasks.length === 0) {
    return null;
  }

  // Score all tasks
  const scoredTasks: ScoredTask[] = actionableTasks.map(task => {
    const { score, reasons } = calculateTaskScore(
      task,
      milestones,
      currentStreak,
      todayEntryExists
    );
    return { ...task, score, reasons };
  });

  // Sort by score (descending)
  scoredTasks.sort((a, b) => b.score - a.score);

  // Return the highest scored task
  const topTask = scoredTasks[0];
  return {
    task: topTask,
    score: topTask.score,
    reasons: topTask.reasons,
  };
}

/**
 * Get top N recommended actions
 */
export function getTopActions(
  input: NextActionEngineInput,
  limit: number = 5
): NextActionResult[] {
  const { tasks, milestones, currentStreak, todayEntryExists } = input;

  // Filter to only actionable tasks
  const actionableTasks = tasks.filter(
    t => t.status === 'todo' || t.status === 'in_progress'
  );

  if (actionableTasks.length === 0) {
    return [];
  }

  // Score all tasks
  const scoredTasks: ScoredTask[] = actionableTasks.map(task => {
    const { score, reasons } = calculateTaskScore(
      task,
      milestones,
      currentStreak,
      todayEntryExists
    );
    return { ...task, score, reasons };
  });

  // Sort by score (descending) and take top N
  scoredTasks.sort((a, b) => b.score - a.score);
  const topTasks = scoredTasks.slice(0, limit);

  return topTasks.map(task => ({
    task,
    score: task.score,
    reasons: task.reasons,
  }));
}

/**
 * Get overdue task count
 */
export function getOverdueCount(tasks: Task[]): number {
  const today = startOfDay(new Date());

  return tasks.filter(task => {
    if (task.status === 'done' || task.status === 'archived') return false;
    if (!task.due_date) return false;

    const dueDate = startOfDay(parseISO(task.due_date));
    return isBefore(dueDate, today);
  }).length;
}

/**
 * Get tasks due today
 */
export function getTasksDueToday(tasks: Task[]): Task[] {
  const today = startOfDay(new Date());

  return tasks.filter(task => {
    if (task.status === 'done' || task.status === 'archived') return false;
    if (!task.due_date) return false;

    const dueDate = startOfDay(parseISO(task.due_date));
    return differenceInDays(dueDate, today) === 0;
  });
}

/**
 * Get progress statistics
 */
export function getTaskStats(tasks: Task[]): {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
} {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = getOverdueCount(tasks);
  const dueToday = getTasksDueToday(tasks).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    overdue,
    dueToday,
    completionRate,
  };
}
