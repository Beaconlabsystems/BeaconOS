-- Beacon OS Seed Data
-- Run this after schema.sql to populate default data
-- Note: Replace 'USER_ID_HERE' with the actual user ID after signup

-- This file provides template data. In production, this data
-- is inserted via the onboarding flow or API calls.

-- ============================================
-- DEFAULT VISION CARDS (Template)
-- ============================================
-- These are inserted for each new user during onboarding

/*
INSERT INTO public.vision_cards (user_id, title, caption, image_url, category, position, is_default) VALUES
(USER_ID_HERE, 'Knightsbridge Property', 'The London residence - a symbol of making it', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80', 'property', 0, true),
(USER_ID_HERE, 'Cessna Citation Jet', 'Freedom to move at the speed of ambition', 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80', 'vehicle', 1, true),
(USER_ID_HERE, 'Range Rover', 'The daily driver of success', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80', 'vehicle', 2, true),
(USER_ID_HERE, 'Ponteland Home', 'Roots in the North - never forget where you came from', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80', 'property', 3, true),
(USER_ID_HERE, 'Beacon Labs Impact', 'Dignity-first care through innovation', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80', 'impact', 4, true),
(USER_ID_HERE, 'Travel & Freedom', 'The world awaits - experiences over possessions', 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1600&q=80', 'lifestyle', 5, true);
*/

-- ============================================
-- DEFAULT MILESTONES (Template)
-- ============================================

/*
-- FUNDING SWIMLANE
INSERT INTO public.milestones (user_id, title, description, swimlane, status, target_date, definition_of_done, prerequisites, risks, position, is_default, color) VALUES
(USER_ID_HERE, 'Innovate UK Application', 'Submit Innovate UK grant application targeting June deadline', 'funding', 'in_progress', '2025-06-01',
  ARRAY['Application submitted', 'All sections completed', 'Letters of support attached', 'Budget approved'],
  ARRAY['Product prototype ready', 'Clinical evidence compiled', 'Team bios finalized'],
  ARRAY['Competitive process', 'Timeline constraints', 'Technical review concerns'],
  0, true, '#10b981'),

(USER_ID_HERE, 'IoCT 70/30 Bridging', 'Alternative funding path - own money + IoCT partnership', 'funding', 'pending', '2025-07-01',
  ARRAY['IoCT agreement signed', 'Personal capital committed', 'Milestone plan agreed'],
  ARRAY['IoCT relationship established', 'Financial runway calculated'],
  ARRAY['Personal capital exposure', 'Dependency on single partner'],
  1, true, '#f59e0b'),

(USER_ID_HERE, 'SEIS Round', 'Raise initial SEIS funding from angels', 'funding', 'pending', '2025-09-01',
  ARRAY['£150k committed', 'SEIS advance assurance received', 'Shareholder agreement signed'],
  ARRAY['Pitch deck finalized', 'Financial model complete', 'Legal docs prepared'],
  ARRAY['Market conditions', 'Investor appetite', 'Valuation expectations'],
  2, true, '#8b5cf6'),

(USER_ID_HERE, 'EIS Round', 'Follow-on EIS funding round', 'funding', 'pending', '2026-03-01',
  ARRAY['£500k committed', 'EIS advance assurance received', 'Lead investor secured'],
  ARRAY['SEIS round closed', 'Key milestones hit', 'Product-market fit evidence'],
  ARRAY['Scale-up challenges', 'Investor fatigue', 'Competition'],
  3, true, '#ec4899'),

(USER_ID_HERE, 'Series A', 'Institutional Series A round', 'funding', 'pending', '2027-01-01',
  ARRAY['£2-5M raised', 'Institutional lead secured', 'Board formed'],
  ARRAY['Revenue traction', 'Team scaled', 'Market expansion plan'],
  ARRAY['VC market conditions', 'Due diligence scrutiny', 'Dilution'],
  4, true, '#06b6d4'),

(USER_ID_HERE, 'Series B', 'Growth Series B round', 'funding', 'pending', '2028-06-01',
  ARRAY['£10-20M raised', 'International expansion funded', 'Key hires made'],
  ARRAY['Series A KPIs met', 'Market leadership position', 'Clear path to profitability'],
  ARRAY['Macro environment', 'Execution risk', 'Team scaling'],
  5, true, '#14b8a6'),

(USER_ID_HERE, 'IPO', 'Public listing', 'funding', 'pending', '2030-01-01',
  ARRAY['Regulatory approval', 'Financial audits complete', 'Underwriters engaged'],
  ARRAY['Profitability achieved', 'Governance structures', 'Market timing right'],
  ARRAY['Market volatility', 'Regulatory scrutiny', 'Founder lock-up'],
  6, true, '#f97316'),

-- PRODUCT SWIMLANE
(USER_ID_HERE, 'MVP Complete', 'Functional mmWave fall detection prototype', 'product', 'in_progress', '2025-05-01',
  ARRAY['Core detection algorithm working', 'Basic UI implemented', 'Test coverage >70%'],
  ARRAY['Technical research complete', 'Hardware sourced'],
  ARRAY['Technical complexity', 'Edge cases in detection'],
  0, true, '#0ea5e9'),

(USER_ID_HERE, 'Beta Launch', 'Limited beta with care homes', 'product', 'pending', '2025-08-01',
  ARRAY['3 care homes onboarded', 'Feedback collection system', 'Bug tracking live'],
  ARRAY['MVP complete', 'Partnerships secured', 'Support process defined'],
  ARRAY['User adoption', 'Technical issues', 'Regulatory concerns'],
  1, true, '#0ea5e9'),

-- EVIDENCE SWIMLANE
(USER_ID_HERE, 'Pilot Study', 'Initial clinical evidence generation', 'evidence', 'pending', '2025-10-01',
  ARRAY['Study protocol approved', '50+ participants', 'Data analysis complete'],
  ARRAY['Ethics approval', 'Care home partnerships', 'Equipment deployed'],
  ARRAY['Recruitment challenges', 'Data quality', 'Unexpected results'],
  0, true, '#a855f7'),

(USER_ID_HERE, 'Clinical Trial', 'Full clinical trial for regulatory submission', 'evidence', 'pending', '2026-06-01',
  ARRAY['200+ participants', 'Peer-reviewed publication', 'Regulatory-grade evidence'],
  ARRAY['Pilot study success', 'Funding secured', 'Regulatory guidance'],
  ARRAY['Scale complexity', 'Adverse events', 'Competition'],
  1, true, '#a855f7'),

-- TEAM SWIMLANE
(USER_ID_HERE, 'CTO Hire', 'Full-time technical co-founder or CTO', 'team', 'pending', '2025-09-01',
  ARRAY['Candidate identified', 'Offer accepted', 'Equity package agreed'],
  ARRAY['Funding runway', 'Network expansion', 'Clear role definition'],
  ARRAY['Talent competition', 'Equity negotiations', 'Culture fit'],
  0, true, '#eab308'),

(USER_ID_HERE, 'Core Team', 'Build initial team of 5-7', 'team', 'pending', '2026-01-01',
  ARRAY['Key roles filled', 'Onboarding complete', 'Team rhythm established'],
  ARRAY['CTO hired', 'Funding closed', 'Office/remote setup'],
  ARRAY['Hiring timeline', 'Budget constraints', 'Team dynamics'],
  1, true, '#eab308'),

-- REGULATORY SWIMLANE
(USER_ID_HERE, 'CE Marking', 'Achieve CE mark for EU market', 'regulatory', 'pending', '2026-03-01',
  ARRAY['Technical file complete', 'Notified body engaged', 'Declaration signed'],
  ARRAY['Product finalized', 'Clinical evidence', 'Quality system'],
  ARRAY['Regulatory changes', 'Notified body delays', 'Non-conformities'],
  0, true, '#ef4444'),

(USER_ID_HERE, 'FDA 510(k)', 'US market clearance', 'regulatory', 'pending', '2027-01-01',
  ARRAY['510(k) submitted', 'FDA clearance received', 'US launch ready'],
  ARRAY['CE mark achieved', 'US clinical data', 'Regulatory consultant'],
  ARRAY['FDA requirements', 'Predicate device', 'Timeline'],
  1, true, '#ef4444'),

-- COMMERCIAL SWIMLANE
(USER_ID_HERE, 'First Revenue', 'First paying customer', 'commercial', 'pending', '2025-12-01',
  ARRAY['Contract signed', 'Payment received', 'Service delivered'],
  ARRAY['Beta success', 'Pricing validated', 'Sales process'],
  ARRAY['Sales cycle length', 'Procurement complexity', 'Competition'],
  0, true, '#22c55e'),

(USER_ID_HERE, 'NHS Pilot', 'NHS trust pilot program', 'commercial', 'pending', '2026-06-01',
  ARRAY['Trust partnership signed', 'Implementation complete', 'Outcomes measured'],
  ARRAY['NHSX engagement', 'Clinical evidence', 'Procurement route'],
  ARRAY['NHS procurement', 'Integration complexity', 'Budget cycles'],
  1, true, '#22c55e');
*/

-- ============================================
-- DEFAULT JAPANESE FLASHCARDS
-- ============================================
-- These are inserted for all users during onboarding

/*
-- Starter Phrases
INSERT INTO public.flashcards (user_id, japanese, romaji, english, category, is_default) VALUES
(USER_ID_HERE, 'おはようございます', 'ohayou gozaimasu', 'Good morning (polite)', 'phrase', true),
(USER_ID_HERE, 'こんにちは', 'konnichiwa', 'Hello / Good afternoon', 'phrase', true),
(USER_ID_HERE, 'こんばんは', 'konbanwa', 'Good evening', 'phrase', true),
(USER_ID_HERE, 'ありがとうございます', 'arigatou gozaimasu', 'Thank you (polite)', 'phrase', true),
(USER_ID_HERE, 'すみません', 'sumimasen', 'Excuse me / Sorry', 'phrase', true),
(USER_ID_HERE, 'はい', 'hai', 'Yes', 'phrase', true),
(USER_ID_HERE, 'いいえ', 'iie', 'No', 'phrase', true),
(USER_ID_HERE, 'お願いします', 'onegaishimasu', 'Please', 'phrase', true),
(USER_ID_HERE, 'わかりました', 'wakarimashita', 'I understand', 'phrase', true),
(USER_ID_HERE, 'わかりません', 'wakarimasen', 'I don''t understand', 'phrase', true),

-- Numbers 1-10
(USER_ID_HERE, '一 (いち)', 'ichi', 'One (1)', 'number', true),
(USER_ID_HERE, '二 (に)', 'ni', 'Two (2)', 'number', true),
(USER_ID_HERE, '三 (さん)', 'san', 'Three (3)', 'number', true),
(USER_ID_HERE, '四 (よん/し)', 'yon/shi', 'Four (4)', 'number', true),
(USER_ID_HERE, '五 (ご)', 'go', 'Five (5)', 'number', true),
(USER_ID_HERE, '六 (ろく)', 'roku', 'Six (6)', 'number', true),
(USER_ID_HERE, '七 (なな/しち)', 'nana/shichi', 'Seven (7)', 'number', true),
(USER_ID_HERE, '八 (はち)', 'hachi', 'Eight (8)', 'number', true),
(USER_ID_HERE, '九 (きゅう/く)', 'kyuu/ku', 'Nine (9)', 'number', true),
(USER_ID_HERE, '十 (じゅう)', 'juu', 'Ten (10)', 'number', true),

-- Days of the Week
(USER_ID_HERE, '月曜日', 'getsuyoubi', 'Monday', 'day', true),
(USER_ID_HERE, '火曜日', 'kayoubi', 'Tuesday', 'day', true),
(USER_ID_HERE, '水曜日', 'suiyoubi', 'Wednesday', 'day', true),
(USER_ID_HERE, '木曜日', 'mokuyoubi', 'Thursday', 'day', true),
(USER_ID_HERE, '金曜日', 'kinyoubi', 'Friday', 'day', true),
(USER_ID_HERE, '土曜日', 'doyoubi', 'Saturday', 'day', true),
(USER_ID_HERE, '日曜日', 'nichiyoubi', 'Sunday', 'day', true),

-- Months
(USER_ID_HERE, '一月', 'ichigatsu', 'January', 'month', true),
(USER_ID_HERE, '二月', 'nigatsu', 'February', 'month', true),
(USER_ID_HERE, '三月', 'sangatsu', 'March', 'month', true),
(USER_ID_HERE, '四月', 'shigatsu', 'April', 'month', true),
(USER_ID_HERE, '五月', 'gogatsu', 'May', 'month', true),
(USER_ID_HERE, '六月', 'rokugatsu', 'June', 'month', true),
(USER_ID_HERE, '七月', 'shichigatsu', 'July', 'month', true),
(USER_ID_HERE, '八月', 'hachigatsu', 'August', 'month', true),
(USER_ID_HERE, '九月', 'kugatsu', 'September', 'month', true),
(USER_ID_HERE, '十月', 'juugatsu', 'October', 'month', true),
(USER_ID_HERE, '十一月', 'juuichigatsu', 'November', 'month', true),
(USER_ID_HERE, '十二月', 'juunigatsu', 'December', 'month', true),

-- Sentence Patterns
(USER_ID_HERE, '今晩予定がありますか？', 'konban yotei ga arimasu ka?', 'Do you have plans tonight?', 'pattern', true),
(USER_ID_HERE, '〜はどこですか？', '~ wa doko desu ka?', 'Where is ~?', 'pattern', true),
(USER_ID_HERE, '〜をください', '~ wo kudasai', 'Please give me ~', 'pattern', true),
(USER_ID_HERE, '〜が好きです', '~ ga suki desu', 'I like ~', 'pattern', true),
(USER_ID_HERE, '〜に行きたいです', '~ ni ikitai desu', 'I want to go to ~', 'pattern', true),
(USER_ID_HERE, 'これは何ですか？', 'kore wa nan desu ka?', 'What is this?', 'pattern', true),
(USER_ID_HERE, 'いくらですか？', 'ikura desu ka?', 'How much is it?', 'pattern', true),
(USER_ID_HERE, '〜てもいいですか？', '~ temo ii desu ka?', 'May I ~?', 'pattern', true);
*/

-- ============================================
-- Notes for Implementation
-- ============================================
--
-- The seed data above is commented out because it requires
-- a valid user_id. In the actual application, this data is
-- inserted through the onboarding flow:
--
-- 1. User signs up (auth.users entry created)
-- 2. Trigger creates public.users entry
-- 3. Onboarding wizard collects preferences
-- 4. API call seeds default vision cards, milestones, flashcards
--
-- See src/lib/seed-data.ts for the TypeScript implementation
-- that handles this seeding process.
