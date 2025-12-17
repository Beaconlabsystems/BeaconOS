-- Beacon OS Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  -- Onboarding data
  top_goals TEXT[],
  current_constraints TEXT,
  innovate_uk_target BOOLEAN DEFAULT FALSE,
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VISION CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.vision_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  category TEXT, -- 'property', 'vehicle', 'travel', 'impact', 'lifestyle'
  position INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MILESTONES TABLE (Roadmap)
-- ============================================
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  swimlane TEXT NOT NULL CHECK (swimlane IN ('funding', 'product', 'evidence', 'team', 'regulatory', 'commercial')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  target_date DATE,
  completed_date DATE,
  -- Definition of done
  definition_of_done TEXT[],
  prerequisites TEXT[],
  risks TEXT[],
  -- Metadata
  position INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#0ea5e9',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  -- Impact tags for Next Action Engine
  tags TEXT[] DEFAULT '{}', -- e.g., ['innovate', 'ioct', 'revenue', 'quick-win']
  estimated_minutes INTEGER,
  -- Recurring
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  -- Position for ordering
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Prompt responses
  one_move TEXT, -- "What's the one move that makes everything easier?"
  avoiding TEXT, -- "What am I avoiding?"
  sixty_minutes TEXT, -- "If I had 60 minutes only, what would I do?"
  winning_evidence TEXT, -- "Evidence I'm winning"
  -- Free-form
  content TEXT,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'low', 'struggling')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One entry per day
  UNIQUE(user_id, entry_date)
);

-- ============================================
-- DECISIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  decision TEXT NOT NULL,
  rationale TEXT,
  expected_outcome TEXT,
  review_date DATE,
  actual_outcome TEXT,
  was_correct BOOLEAN,
  lessons_learned TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SPRINTS TABLE (Focus Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  sprint_type TEXT NOT NULL CHECK (sprint_type IN ('grant_writing', 'investor_outreach', 'product_spec', 'japanese', 'deep_work', 'admin')),
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FLASHCARDS TABLE (Japanese Learning)
-- ============================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Content
  japanese TEXT NOT NULL,
  romaji TEXT NOT NULL,
  english TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('phrase', 'number', 'day', 'month', 'pattern', 'vocabulary')),
  -- SRS Data (SM-2 / Leitner)
  box_number INTEGER DEFAULT 1, -- Leitner box (1-5)
  ease_factor REAL DEFAULT 2.5, -- SM-2 ease factor
  interval_days INTEGER DEFAULT 1, -- Days until next review
  repetitions INTEGER DEFAULT 0, -- Number of successful reviews
  -- Scheduling
  next_review_date DATE DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  -- Stats
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE (Flashcard Review History)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  quality INTEGER NOT NULL CHECK (quality BETWEEN 0 AND 5), -- SM-2 quality (0-5)
  was_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CRM CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Contact Info
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  -- CRM Data
  contact_type TEXT DEFAULT 'investor' CHECK (contact_type IN ('investor', 'partner', 'advisor', 'customer', 'other')),
  stage TEXT CHECK (stage IN ('lead', 'contacted', 'meeting', 'due_diligence', 'negotiation', 'closed', 'passed')),
  investment_stage TEXT CHECK (investment_stage IN ('seis', 'eis', 'series_a', 'series_b', 'other')),
  -- Interaction tracking
  last_contact_date DATE,
  next_action TEXT,
  next_action_date DATE,
  -- Notes & Templates
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  -- Metadata
  is_warm BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCENARIOS TABLE (Runway Simulator)
-- ============================================
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_baseline BOOLEAN DEFAULT FALSE,
  -- Financials
  current_cash DECIMAL(12, 2) NOT NULL DEFAULT 0,
  monthly_burn DECIMAL(12, 2) NOT NULL DEFAULT 0,
  -- Expected inflows
  expected_grants JSONB DEFAULT '[]', -- [{name, amount, probability, expected_date}]
  expected_investments JSONB DEFAULT '[]', -- [{name, amount, probability, expected_date}]
  expected_revenue JSONB DEFAULT '[]', -- [{name, amount, start_date}]
  -- Calculated fields (cached)
  runway_months DECIMAL(4, 1),
  zero_cash_date DATE,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEMORY GAME SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.memory_game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('cards', 'sequence')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL,
  time_seconds INTEGER,
  moves INTEGER,
  completed BOOLEAN DEFAULT TRUE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_game_scores ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Vision Cards policies
CREATE POLICY "Users can view their own vision cards" ON public.vision_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vision cards" ON public.vision_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vision cards" ON public.vision_cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vision cards" ON public.vision_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view their own milestones" ON public.milestones
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestones" ON public.milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.milestones
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own milestones" ON public.milestones
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Journal Entries policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Decisions policies
CREATE POLICY "Users can view their own decisions" ON public.decisions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own decisions" ON public.decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decisions" ON public.decisions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decisions" ON public.decisions
  FOR DELETE USING (auth.uid() = user_id);

-- Sprints policies
CREATE POLICY "Users can view their own sprints" ON public.sprints
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sprints" ON public.sprints
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sprints" ON public.sprints
  FOR UPDATE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view their own flashcards" ON public.flashcards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcards" ON public.flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcards" ON public.flashcards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcards" ON public.flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CRM Contacts policies
CREATE POLICY "Users can view their own contacts" ON public.crm_contacts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contacts" ON public.crm_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contacts" ON public.crm_contacts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON public.crm_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Scenarios policies
CREATE POLICY "Users can view their own scenarios" ON public.scenarios
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scenarios" ON public.scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scenarios" ON public.scenarios
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scenarios" ON public.scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Memory Game Scores policies
CREATE POLICY "Users can view their own scores" ON public.memory_game_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scores" ON public.memory_game_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vision_cards_updated_at BEFORE UPDATE ON public.vision_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_vision_cards_user_id ON public.vision_cards(user_id);
CREATE INDEX idx_vision_cards_position ON public.vision_cards(user_id, position);
CREATE INDEX idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX idx_milestones_swimlane ON public.milestones(user_id, swimlane);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_milestone ON public.tasks(milestone_id);
CREATE INDEX idx_tasks_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON public.tasks(user_id, due_date);
CREATE INDEX idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date);
CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_sprints_user_id ON public.sprints(user_id);
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_next_review ON public.flashcards(user_id, next_review_date);
CREATE INDEX idx_reviews_flashcard ON public.reviews(flashcard_id);
CREATE INDEX idx_crm_contacts_user_id ON public.crm_contacts(user_id);
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);
CREATE INDEX idx_memory_scores_user ON public.memory_game_scores(user_id);
