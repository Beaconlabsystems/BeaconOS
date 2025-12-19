-- Beacon OS Database Schema
-- Run this in your Supabase SQL editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Default user ID for demo mode (when not using auth)
-- In production, this would come from Supabase Auth
CREATE OR REPLACE FUNCTION get_default_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$$ LANGUAGE plpgsql;

-- Priorities (Daily Tasks)
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  reflection TEXT,
  tips TEXT
);

CREATE INDEX idx_priorities_user ON priorities(user_id);
CREATE INDEX idx_priorities_created ON priorities(created_at DESC);

-- Contacts (Rolodex)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('investor', 'advisor', 'partner', 'customer', 'other')),
  notes TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_name ON contacts(name);

-- Roadmap Milestones
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('funding', 'product', 'team', 'revenue', 'other')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed')),
  target_date DATE,
  completed_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roadmap_user ON roadmap_milestones(user_id);
CREATE INDEX idx_roadmap_order ON roadmap_milestones(order_index);

-- Focus Sessions (Pomodoro tracking)
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  mode TEXT NOT NULL CHECK (mode IN ('focus', 'short-break', 'long-break')),
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_date ON focus_sessions(started_at DESC);

-- Focus Settings
CREATE TABLE IF NOT EXISTS focus_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE DEFAULT get_default_user_id(),
  focus_minutes INTEGER DEFAULT 25,
  short_break_minutes INTEGER DEFAULT 5,
  long_break_minutes INTEGER DEFAULT 15,
  sessions_before_long_break INTEGER DEFAULT 4,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Japanese Word Progress (Spaced Repetition)
CREATE TABLE IF NOT EXISTS japanese_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  word_id TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  next_review TIMESTAMPTZ DEFAULT NOW(),
  mastered BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_japanese_word_user ON japanese_word_progress(user_id);
CREATE INDEX idx_japanese_word_review ON japanese_word_progress(next_review);

-- Japanese Level Progress
CREATE TABLE IF NOT EXISTS japanese_level_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  quest TEXT NOT NULL CHECK (quest IN ('A', 'B')),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  unlocked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest, level)
);

CREATE INDEX idx_japanese_level_user ON japanese_level_progress(user_id);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_created ON journal_entries(created_at DESC);

-- Decisions
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'decided', 'revisiting')),
  decision TEXT,
  reasoning TEXT,
  outcome TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_user ON decisions(user_id);
CREATE INDEX idx_decisions_status ON decisions(status);

-- Reading Items
CREATE TABLE IF NOT EXISTS reading_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  title TEXT NOT NULL,
  author TEXT,
  type TEXT NOT NULL DEFAULT 'book' CHECK (type IN ('book', 'article', 'paper', 'other')),
  status TEXT NOT NULL DEFAULT 'want-to-read' CHECK (status IN ('want-to-read', 'reading', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_reading_user ON reading_items(user_id);
CREATE INDEX idx_reading_status ON reading_items(status);

-- Vision Board Items
CREATE TABLE IF NOT EXISTS vision_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vision_user ON vision_items(user_id);

-- Daily Focus
CREATE TABLE IF NOT EXISTS daily_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT get_default_user_id(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_focus_user ON daily_focus(user_id);
CREATE INDEX idx_daily_focus_date ON daily_focus(date DESC);

-- Initialize default Japanese level progress (unlock level 1 of Quest A)
INSERT INTO japanese_level_progress (user_id, quest, level, unlocked)
SELECT get_default_user_id(), 'A', 1, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM japanese_level_progress
  WHERE user_id = get_default_user_id() AND quest = 'A' AND level = 1
);

-- Initialize default focus settings
INSERT INTO focus_settings (user_id)
SELECT get_default_user_id()
WHERE NOT EXISTS (
  SELECT 1 FROM focus_settings WHERE user_id = get_default_user_id()
);
