// Beacon OS Type Definitions

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  preferences: UserPreferences;
  top_goals: string[] | null;
  current_constraints: string | null;
  innovate_uk_target: boolean;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'system';
  sidebar_collapsed?: boolean;
  focus_duration?: number;
  daily_goal_tasks?: number;
  notifications_enabled?: boolean;
}

// ============================================
// VISION BOARD TYPES
// ============================================

export interface VisionCard {
  id: string;
  user_id: string;
  title: string;
  caption: string | null;
  image_url: string;
  category: VisionCategory;
  position: number;
  is_default: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type VisionCategory = 'property' | 'vehicle' | 'travel' | 'impact' | 'lifestyle';

// ============================================
// ROADMAP TYPES
// ============================================

export interface Milestone {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  swimlane: Swimlane;
  status: MilestoneStatus;
  target_date: string | null;
  completed_date: string | null;
  definition_of_done: string[];
  prerequisites: string[];
  risks: string[];
  position: number;
  is_default: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export type Swimlane = 'funding' | 'product' | 'evidence' | 'team' | 'regulatory' | 'commercial';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export const SWIMLANE_LABELS: Record<Swimlane, string> = {
  funding: 'Funding',
  product: 'Product',
  evidence: 'Evidence / Trials',
  team: 'Team',
  regulatory: 'Regulatory',
  commercial: 'Commercial',
};

export const SWIMLANE_COLORS: Record<Swimlane, string> = {
  funding: '#10b981',
  product: '#0ea5e9',
  evidence: '#a855f7',
  team: '#eab308',
  regulatory: '#ef4444',
  commercial: '#22c55e',
};

// ============================================
// TASK TYPES
// ============================================

export interface Task {
  id: string;
  user_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  tags: string[];
  estimated_minutes: number | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 100,
  high: 75,
  medium: 50,
  low: 25,
};

export const TAG_WEIGHTS: Record<string, number> = {
  innovate: 50,
  ioct: 45,
  revenue: 40,
  fundraising: 35,
  product: 30,
  'quick-win': 25,
};

// ============================================
// JOURNAL TYPES
// ============================================

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  one_move: string | null;
  avoiding: string | null;
  sixty_minutes: string | null;
  winning_evidence: string | null;
  content: string | null;
  mood: Mood | null;
  energy_level: number | null;
  created_at: string;
  updated_at: string;
}

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'struggling';

export const JOURNAL_PROMPTS = {
  one_move: "What's the one move that makes everything easier?",
  avoiding: "What am I avoiding?",
  sixty_minutes: "If I had 60 minutes only, what would I do?",
  winning_evidence: "Evidence I'm winning",
};

// ============================================
// DECISION LOG TYPES
// ============================================

export interface Decision {
  id: string;
  user_id: string;
  decision_date: string;
  title: string;
  decision: string;
  rationale: string | null;
  expected_outcome: string | null;
  review_date: string | null;
  actual_outcome: string | null;
  was_correct: boolean | null;
  lessons_learned: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// SPRINT / FOCUS TYPES
// ============================================

export interface Sprint {
  id: string;
  user_id: string;
  task_id: string | null;
  sprint_type: SprintType;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export type SprintType =
  | 'grant_writing'
  | 'investor_outreach'
  | 'product_spec'
  | 'japanese'
  | 'deep_work'
  | 'admin';

export const SPRINT_TYPE_LABELS: Record<SprintType, string> = {
  grant_writing: 'Grant Writing',
  investor_outreach: 'Investor Outreach',
  product_spec: 'Product Spec',
  japanese: 'Japanese Study',
  deep_work: 'Deep Work',
  admin: 'Admin',
};

export const SPRINT_TYPE_COLORS: Record<SprintType, string> = {
  grant_writing: '#10b981',
  investor_outreach: '#8b5cf6',
  product_spec: '#0ea5e9',
  japanese: '#f97316',
  deep_work: '#6366f1',
  admin: '#64748b',
};

// ============================================
// FLASHCARD / SRS TYPES
// ============================================

export interface Flashcard {
  id: string;
  user_id: string;
  japanese: string;
  romaji: string;
  english: string;
  category: FlashcardCategory;
  box_number: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  times_correct: number;
  times_incorrect: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type FlashcardCategory = 'phrase' | 'number' | 'day' | 'month' | 'pattern' | 'vocabulary';

export const FLASHCARD_CATEGORY_LABELS: Record<FlashcardCategory, string> = {
  phrase: 'Phrases',
  number: 'Numbers',
  day: 'Days',
  month: 'Months',
  pattern: 'Sentence Patterns',
  vocabulary: 'Vocabulary',
};

export interface Review {
  id: string;
  user_id: string;
  flashcard_id: string;
  quality: number;
  was_correct: boolean;
  response_time_ms: number | null;
  reviewed_at: string;
}

// ============================================
// CRM TYPES
// ============================================

export interface CRMContact {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  contact_type: ContactType;
  stage: ContactStage | null;
  investment_stage: InvestmentStage | null;
  last_contact_date: string | null;
  next_action: string | null;
  next_action_date: string | null;
  notes: string | null;
  tags: string[];
  is_warm: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type ContactType = 'investor' | 'partner' | 'advisor' | 'customer' | 'other';

export type ContactStage =
  | 'lead'
  | 'contacted'
  | 'meeting'
  | 'due_diligence'
  | 'negotiation'
  | 'closed'
  | 'passed';

export type InvestmentStage = 'seis' | 'eis' | 'series_a' | 'series_b' | 'other';

export const CONTACT_STAGE_LABELS: Record<ContactStage, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  meeting: 'Meeting',
  due_diligence: 'Due Diligence',
  negotiation: 'Negotiation',
  closed: 'Closed',
  passed: 'Passed',
};

export const INVESTMENT_STAGE_LABELS: Record<InvestmentStage, string> = {
  seis: 'SEIS',
  eis: 'EIS',
  series_a: 'Series A',
  series_b: 'Series B',
  other: 'Other',
};

// ============================================
// SCENARIO / RUNWAY TYPES
// ============================================

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_baseline: boolean;
  current_cash: number;
  monthly_burn: number;
  expected_grants: FinancialEvent[];
  expected_investments: FinancialEvent[];
  expected_revenue: RevenueEvent[];
  runway_months: number | null;
  zero_cash_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialEvent {
  name: string;
  amount: number;
  probability: number;
  expected_date: string;
}

export interface RevenueEvent {
  name: string;
  amount: number;
  start_date: string;
}

// ============================================
// MEMORY GAME TYPES
// ============================================

export interface MemoryGameScore {
  id: string;
  user_id: string;
  game_type: 'cards' | 'sequence';
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  time_seconds: number | null;
  moves: number | null;
  completed: boolean;
  played_at: string;
}

// ============================================
// COMMAND PALETTE TYPES
// ============================================

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
  category?: 'navigation' | 'action' | 'search';
}

// ============================================
// NEXT ACTION ENGINE TYPES
// ============================================

export interface ScoredTask extends Task {
  score: number;
  reasons: string[];
}

export interface NextActionResult {
  task: Task;
  score: number;
  reasons: string[];
}
