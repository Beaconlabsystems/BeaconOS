import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ============================================
// ONBOARDING SCHEMAS
// ============================================

export const onboardingSchema = z.object({
  topGoals: z.array(z.string().min(1)).min(1, 'Please add at least one goal').max(5),
  currentConstraints: z.string().optional(),
  innovateUkTarget: z.boolean(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ============================================
// TASK SCHEMAS
// ============================================

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
  dueDate: z.string().optional(),
  milestoneId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  estimatedMinutes: z.number().min(1).max(480).optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;

// ============================================
// MILESTONE SCHEMAS
// ============================================

export const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  swimlane: z.enum(['funding', 'product', 'evidence', 'team', 'regulatory', 'commercial']),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
  targetDate: z.string().optional(),
  definitionOfDone: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

// ============================================
// JOURNAL SCHEMAS
// ============================================

export const journalEntrySchema = z.object({
  entryDate: z.string().optional(),
  oneMove: z.string().max(2000).optional(),
  avoiding: z.string().max(2000).optional(),
  sixtyMinutes: z.string().max(2000).optional(),
  winningEvidence: z.string().max(2000).optional(),
  content: z.string().max(10000).optional(),
  mood: z.enum(['great', 'good', 'okay', 'low', 'struggling']).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;

// ============================================
// DECISION SCHEMAS
// ============================================

export const decisionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  decision: z.string().min(1, 'Decision description is required').max(2000),
  rationale: z.string().max(2000).optional(),
  expectedOutcome: z.string().max(2000).optional(),
  reviewDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type DecisionInput = z.infer<typeof decisionSchema>;

// ============================================
// CRM SCHEMAS
// ============================================

export const crmContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  contactType: z.enum(['investor', 'partner', 'advisor', 'customer', 'other']),
  stage: z.enum(['lead', 'contacted', 'meeting', 'due_diligence', 'negotiation', 'closed', 'passed']).optional(),
  investmentStage: z.enum(['seis', 'eis', 'series_a', 'series_b', 'other']).optional(),
  nextAction: z.string().max(500).optional(),
  nextActionDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
  isWarm: z.boolean().optional(),
});

export type CRMContactInput = z.infer<typeof crmContactSchema>;

// ============================================
// SCENARIO SCHEMAS
// ============================================

export const financialEventSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  probability: z.number().min(0).max(100),
  expectedDate: z.string(),
});

export const revenueEventSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  startDate: z.string(),
});

export const scenarioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  isBaseline: z.boolean().optional(),
  currentCash: z.number().min(0),
  monthlyBurn: z.number().min(0),
  expectedGrants: z.array(financialEventSchema).optional(),
  expectedInvestments: z.array(financialEventSchema).optional(),
  expectedRevenue: z.array(revenueEventSchema).optional(),
});

export type ScenarioInput = z.infer<typeof scenarioSchema>;

// ============================================
// VISION CARD SCHEMAS
// ============================================

export const visionCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  caption: z.string().max(500).optional(),
  imageUrl: z.string().url('Please enter a valid URL'),
  category: z.enum(['property', 'vehicle', 'travel', 'impact', 'lifestyle']),
});

export type VisionCardInput = z.infer<typeof visionCardSchema>;

// ============================================
// FLASHCARD SCHEMAS
// ============================================

export const flashcardSchema = z.object({
  japanese: z.string().min(1, 'Japanese text is required'),
  romaji: z.string().min(1, 'Romaji is required'),
  english: z.string().min(1, 'English translation is required'),
  category: z.enum(['phrase', 'number', 'day', 'month', 'pattern', 'vocabulary']),
});

export type FlashcardInput = z.infer<typeof flashcardSchema>;

// ============================================
// SPRINT SCHEMAS
// ============================================

export const sprintSchema = z.object({
  sprintType: z.enum(['grant_writing', 'investor_outreach', 'product_spec', 'japanese', 'deep_work', 'admin']),
  durationMinutes: z.number().min(5).max(120).default(25),
  taskId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
});

export type SprintInput = z.infer<typeof sprintSchema>;
