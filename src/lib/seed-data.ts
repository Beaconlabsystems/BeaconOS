/**
 * Seed Data for New Users
 *
 * This module contains default data that gets inserted
 * when a new user completes onboarding.
 */

import type { VisionCard, Milestone, Flashcard } from '@/types';

// ============================================
// DEFAULT VISION CARDS
// ============================================

export const DEFAULT_VISION_CARDS: Omit<VisionCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Knightsbridge Property',
    caption: 'The London residence - a symbol of making it',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    category: 'property',
    position: 0,
    is_default: true,
    is_visible: true,
  },
  {
    title: 'Cessna Citation Jet',
    caption: 'Freedom to move at the speed of ambition',
    image_url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80',
    category: 'vehicle',
    position: 1,
    is_default: true,
    is_visible: true,
  },
  {
    title: 'Range Rover',
    caption: 'The daily driver of success',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80',
    category: 'vehicle',
    position: 2,
    is_default: true,
    is_visible: true,
  },
  {
    title: 'Ponteland Home',
    caption: 'Roots in the North - never forget where you came from',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80',
    category: 'property',
    position: 3,
    is_default: true,
    is_visible: true,
  },
  {
    title: 'Beacon Labs Impact',
    caption: 'Dignity-first care through innovation',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80',
    category: 'impact',
    position: 4,
    is_default: true,
    is_visible: true,
  },
  {
    title: 'Travel & Freedom',
    caption: 'The world awaits - experiences over possessions',
    image_url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1600&q=80',
    category: 'lifestyle',
    position: 5,
    is_default: true,
    is_visible: true,
  },
];

// ============================================
// DEFAULT MILESTONES
// ============================================

type MilestoneData = Omit<Milestone, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const DEFAULT_MILESTONES: MilestoneData[] = [
  // FUNDING SWIMLANE
  {
    title: 'Innovate UK Application',
    description: 'Submit Innovate UK grant application targeting June deadline',
    swimlane: 'funding',
    status: 'in_progress',
    target_date: '2025-06-01',
    completed_date: null,
    definition_of_done: [
      'Application submitted',
      'All sections completed',
      'Letters of support attached',
      'Budget approved',
    ],
    prerequisites: [
      'Product prototype ready',
      'Clinical evidence compiled',
      'Team bios finalized',
    ],
    risks: [
      'Competitive process',
      'Timeline constraints',
      'Technical review concerns',
    ],
    position: 0,
    is_default: true,
    color: '#10b981',
  },
  {
    title: 'IoCT 70/30 Bridging',
    description: 'Alternative funding path - own money + IoCT partnership',
    swimlane: 'funding',
    status: 'pending',
    target_date: '2025-07-01',
    completed_date: null,
    definition_of_done: [
      'IoCT agreement signed',
      'Personal capital committed',
      'Milestone plan agreed',
    ],
    prerequisites: [
      'IoCT relationship established',
      'Financial runway calculated',
    ],
    risks: [
      'Personal capital exposure',
      'Dependency on single partner',
    ],
    position: 1,
    is_default: true,
    color: '#f59e0b',
  },
  {
    title: 'SEIS Round',
    description: 'Raise initial SEIS funding from angels',
    swimlane: 'funding',
    status: 'pending',
    target_date: '2025-09-01',
    completed_date: null,
    definition_of_done: [
      '£150k committed',
      'SEIS advance assurance received',
      'Shareholder agreement signed',
    ],
    prerequisites: [
      'Pitch deck finalized',
      'Financial model complete',
      'Legal docs prepared',
    ],
    risks: [
      'Market conditions',
      'Investor appetite',
      'Valuation expectations',
    ],
    position: 2,
    is_default: true,
    color: '#8b5cf6',
  },
  {
    title: 'EIS Round',
    description: 'Follow-on EIS funding round',
    swimlane: 'funding',
    status: 'pending',
    target_date: '2026-03-01',
    completed_date: null,
    definition_of_done: [
      '£500k committed',
      'EIS advance assurance received',
      'Lead investor secured',
    ],
    prerequisites: [
      'SEIS round closed',
      'Key milestones hit',
      'Product-market fit evidence',
    ],
    risks: [
      'Scale-up challenges',
      'Investor fatigue',
      'Competition',
    ],
    position: 3,
    is_default: true,
    color: '#ec4899',
  },
  {
    title: 'Series A',
    description: 'Institutional Series A round',
    swimlane: 'funding',
    status: 'pending',
    target_date: '2027-01-01',
    completed_date: null,
    definition_of_done: [
      '£2-5M raised',
      'Institutional lead secured',
      'Board formed',
    ],
    prerequisites: [
      'Revenue traction',
      'Team scaled',
      'Market expansion plan',
    ],
    risks: [
      'VC market conditions',
      'Due diligence scrutiny',
      'Dilution',
    ],
    position: 4,
    is_default: true,
    color: '#06b6d4',
  },
  {
    title: 'Series B',
    description: 'Growth Series B round',
    swimlane: 'funding',
    status: 'pending',
    target_date: '2028-06-01',
    completed_date: null,
    definition_of_done: [
      '£10-20M raised',
      'International expansion funded',
      'Key hires made',
    ],
    prerequisites: [
      'Series A KPIs met',
      'Market leadership position',
      'Clear path to profitability',
    ],
    risks: [
      'Macro environment',
      'Execution risk',
      'Team scaling',
    ],
    position: 5,
    is_default: true,
    color: '#14b8a6',
  },
  {
    title: 'IPO',
    description: 'Public listing',
    swimlane: 'funding',
    status: 'pending',
    target_date: '2030-01-01',
    completed_date: null,
    definition_of_done: [
      'Regulatory approval',
      'Financial audits complete',
      'Underwriters engaged',
    ],
    prerequisites: [
      'Profitability achieved',
      'Governance structures',
      'Market timing right',
    ],
    risks: [
      'Market volatility',
      'Regulatory scrutiny',
      'Founder lock-up',
    ],
    position: 6,
    is_default: true,
    color: '#f97316',
  },
  // PRODUCT SWIMLANE
  {
    title: 'MVP Complete',
    description: 'Functional mmWave fall detection prototype',
    swimlane: 'product',
    status: 'in_progress',
    target_date: '2025-05-01',
    completed_date: null,
    definition_of_done: [
      'Core detection algorithm working',
      'Basic UI implemented',
      'Test coverage >70%',
    ],
    prerequisites: [
      'Technical research complete',
      'Hardware sourced',
    ],
    risks: [
      'Technical complexity',
      'Edge cases in detection',
    ],
    position: 0,
    is_default: true,
    color: '#0ea5e9',
  },
  {
    title: 'Beta Launch',
    description: 'Limited beta with care homes',
    swimlane: 'product',
    status: 'pending',
    target_date: '2025-08-01',
    completed_date: null,
    definition_of_done: [
      '3 care homes onboarded',
      'Feedback collection system',
      'Bug tracking live',
    ],
    prerequisites: [
      'MVP complete',
      'Partnerships secured',
      'Support process defined',
    ],
    risks: [
      'User adoption',
      'Technical issues',
      'Regulatory concerns',
    ],
    position: 1,
    is_default: true,
    color: '#0ea5e9',
  },
  // EVIDENCE SWIMLANE
  {
    title: 'Pilot Study',
    description: 'Initial clinical evidence generation',
    swimlane: 'evidence',
    status: 'pending',
    target_date: '2025-10-01',
    completed_date: null,
    definition_of_done: [
      'Study protocol approved',
      '50+ participants',
      'Data analysis complete',
    ],
    prerequisites: [
      'Ethics approval',
      'Care home partnerships',
      'Equipment deployed',
    ],
    risks: [
      'Recruitment challenges',
      'Data quality',
      'Unexpected results',
    ],
    position: 0,
    is_default: true,
    color: '#a855f7',
  },
  {
    title: 'Clinical Trial',
    description: 'Full clinical trial for regulatory submission',
    swimlane: 'evidence',
    status: 'pending',
    target_date: '2026-06-01',
    completed_date: null,
    definition_of_done: [
      '200+ participants',
      'Peer-reviewed publication',
      'Regulatory-grade evidence',
    ],
    prerequisites: [
      'Pilot study success',
      'Funding secured',
      'Regulatory guidance',
    ],
    risks: [
      'Scale complexity',
      'Adverse events',
      'Competition',
    ],
    position: 1,
    is_default: true,
    color: '#a855f7',
  },
  // TEAM SWIMLANE
  {
    title: 'CTO Hire',
    description: 'Full-time technical co-founder or CTO',
    swimlane: 'team',
    status: 'pending',
    target_date: '2025-09-01',
    completed_date: null,
    definition_of_done: [
      'Candidate identified',
      'Offer accepted',
      'Equity package agreed',
    ],
    prerequisites: [
      'Funding runway',
      'Network expansion',
      'Clear role definition',
    ],
    risks: [
      'Talent competition',
      'Equity negotiations',
      'Culture fit',
    ],
    position: 0,
    is_default: true,
    color: '#eab308',
  },
  {
    title: 'Core Team',
    description: 'Build initial team of 5-7',
    swimlane: 'team',
    status: 'pending',
    target_date: '2026-01-01',
    completed_date: null,
    definition_of_done: [
      'Key roles filled',
      'Onboarding complete',
      'Team rhythm established',
    ],
    prerequisites: [
      'CTO hired',
      'Funding closed',
      'Office/remote setup',
    ],
    risks: [
      'Hiring timeline',
      'Budget constraints',
      'Team dynamics',
    ],
    position: 1,
    is_default: true,
    color: '#eab308',
  },
  // REGULATORY SWIMLANE
  {
    title: 'CE Marking',
    description: 'Achieve CE mark for EU market',
    swimlane: 'regulatory',
    status: 'pending',
    target_date: '2026-03-01',
    completed_date: null,
    definition_of_done: [
      'Technical file complete',
      'Notified body engaged',
      'Declaration signed',
    ],
    prerequisites: [
      'Product finalized',
      'Clinical evidence',
      'Quality system',
    ],
    risks: [
      'Regulatory changes',
      'Notified body delays',
      'Non-conformities',
    ],
    position: 0,
    is_default: true,
    color: '#ef4444',
  },
  {
    title: 'FDA 510(k)',
    description: 'US market clearance',
    swimlane: 'regulatory',
    status: 'pending',
    target_date: '2027-01-01',
    completed_date: null,
    definition_of_done: [
      '510(k) submitted',
      'FDA clearance received',
      'US launch ready',
    ],
    prerequisites: [
      'CE mark achieved',
      'US clinical data',
      'Regulatory consultant',
    ],
    risks: [
      'FDA requirements',
      'Predicate device',
      'Timeline',
    ],
    position: 1,
    is_default: true,
    color: '#ef4444',
  },
  // COMMERCIAL SWIMLANE
  {
    title: 'First Revenue',
    description: 'First paying customer',
    swimlane: 'commercial',
    status: 'pending',
    target_date: '2025-12-01',
    completed_date: null,
    definition_of_done: [
      'Contract signed',
      'Payment received',
      'Service delivered',
    ],
    prerequisites: [
      'Beta success',
      'Pricing validated',
      'Sales process',
    ],
    risks: [
      'Sales cycle length',
      'Procurement complexity',
      'Competition',
    ],
    position: 0,
    is_default: true,
    color: '#22c55e',
  },
  {
    title: 'NHS Pilot',
    description: 'NHS trust pilot program',
    swimlane: 'commercial',
    status: 'pending',
    target_date: '2026-06-01',
    completed_date: null,
    definition_of_done: [
      'Trust partnership signed',
      'Implementation complete',
      'Outcomes measured',
    ],
    prerequisites: [
      'NHSX engagement',
      'Clinical evidence',
      'Procurement route',
    ],
    risks: [
      'NHS procurement',
      'Integration complexity',
      'Budget cycles',
    ],
    position: 1,
    is_default: true,
    color: '#22c55e',
  },
];

// ============================================
// DEFAULT JAPANESE FLASHCARDS
// ============================================

type FlashcardData = Omit<Flashcard, 'id' | 'user_id' | 'box_number' | 'ease_factor' | 'interval_days' | 'repetitions' | 'next_review_date' | 'last_reviewed_at' | 'times_correct' | 'times_incorrect' | 'created_at' | 'updated_at'>;

export const DEFAULT_FLASHCARDS: FlashcardData[] = [
  // Starter Phrases
  { japanese: 'おはようございます', romaji: 'ohayou gozaimasu', english: 'Good morning (polite)', category: 'phrase', is_default: true },
  { japanese: 'こんにちは', romaji: 'konnichiwa', english: 'Hello / Good afternoon', category: 'phrase', is_default: true },
  { japanese: 'こんばんは', romaji: 'konbanwa', english: 'Good evening', category: 'phrase', is_default: true },
  { japanese: 'ありがとうございます', romaji: 'arigatou gozaimasu', english: 'Thank you (polite)', category: 'phrase', is_default: true },
  { japanese: 'すみません', romaji: 'sumimasen', english: 'Excuse me / Sorry', category: 'phrase', is_default: true },
  { japanese: 'はい', romaji: 'hai', english: 'Yes', category: 'phrase', is_default: true },
  { japanese: 'いいえ', romaji: 'iie', english: 'No', category: 'phrase', is_default: true },
  { japanese: 'お願いします', romaji: 'onegaishimasu', english: 'Please', category: 'phrase', is_default: true },
  { japanese: 'わかりました', romaji: 'wakarimashita', english: 'I understand', category: 'phrase', is_default: true },
  { japanese: 'わかりません', romaji: 'wakarimasen', english: "I don't understand", category: 'phrase', is_default: true },

  // Numbers 1-10
  { japanese: '一 (いち)', romaji: 'ichi', english: 'One (1)', category: 'number', is_default: true },
  { japanese: '二 (に)', romaji: 'ni', english: 'Two (2)', category: 'number', is_default: true },
  { japanese: '三 (さん)', romaji: 'san', english: 'Three (3)', category: 'number', is_default: true },
  { japanese: '四 (よん/し)', romaji: 'yon/shi', english: 'Four (4)', category: 'number', is_default: true },
  { japanese: '五 (ご)', romaji: 'go', english: 'Five (5)', category: 'number', is_default: true },
  { japanese: '六 (ろく)', romaji: 'roku', english: 'Six (6)', category: 'number', is_default: true },
  { japanese: '七 (なな/しち)', romaji: 'nana/shichi', english: 'Seven (7)', category: 'number', is_default: true },
  { japanese: '八 (はち)', romaji: 'hachi', english: 'Eight (8)', category: 'number', is_default: true },
  { japanese: '九 (きゅう/く)', romaji: 'kyuu/ku', english: 'Nine (9)', category: 'number', is_default: true },
  { japanese: '十 (じゅう)', romaji: 'juu', english: 'Ten (10)', category: 'number', is_default: true },

  // Days of the Week
  { japanese: '月曜日', romaji: 'getsuyoubi', english: 'Monday', category: 'day', is_default: true },
  { japanese: '火曜日', romaji: 'kayoubi', english: 'Tuesday', category: 'day', is_default: true },
  { japanese: '水曜日', romaji: 'suiyoubi', english: 'Wednesday', category: 'day', is_default: true },
  { japanese: '木曜日', romaji: 'mokuyoubi', english: 'Thursday', category: 'day', is_default: true },
  { japanese: '金曜日', romaji: 'kinyoubi', english: 'Friday', category: 'day', is_default: true },
  { japanese: '土曜日', romaji: 'doyoubi', english: 'Saturday', category: 'day', is_default: true },
  { japanese: '日曜日', romaji: 'nichiyoubi', english: 'Sunday', category: 'day', is_default: true },

  // Months
  { japanese: '一月', romaji: 'ichigatsu', english: 'January', category: 'month', is_default: true },
  { japanese: '二月', romaji: 'nigatsu', english: 'February', category: 'month', is_default: true },
  { japanese: '三月', romaji: 'sangatsu', english: 'March', category: 'month', is_default: true },
  { japanese: '四月', romaji: 'shigatsu', english: 'April', category: 'month', is_default: true },
  { japanese: '五月', romaji: 'gogatsu', english: 'May', category: 'month', is_default: true },
  { japanese: '六月', romaji: 'rokugatsu', english: 'June', category: 'month', is_default: true },
  { japanese: '七月', romaji: 'shichigatsu', english: 'July', category: 'month', is_default: true },
  { japanese: '八月', romaji: 'hachigatsu', english: 'August', category: 'month', is_default: true },
  { japanese: '九月', romaji: 'kugatsu', english: 'September', category: 'month', is_default: true },
  { japanese: '十月', romaji: 'juugatsu', english: 'October', category: 'month', is_default: true },
  { japanese: '十一月', romaji: 'juuichigatsu', english: 'November', category: 'month', is_default: true },
  { japanese: '十二月', romaji: 'juunigatsu', english: 'December', category: 'month', is_default: true },

  // Sentence Patterns
  { japanese: '今晩予定がありますか？', romaji: 'konban yotei ga arimasu ka?', english: 'Do you have plans tonight?', category: 'pattern', is_default: true },
  { japanese: '〜はどこですか？', romaji: '~ wa doko desu ka?', english: 'Where is ~?', category: 'pattern', is_default: true },
  { japanese: '〜をください', romaji: '~ wo kudasai', english: 'Please give me ~', category: 'pattern', is_default: true },
  { japanese: '〜が好きです', romaji: '~ ga suki desu', english: 'I like ~', category: 'pattern', is_default: true },
  { japanese: '〜に行きたいです', romaji: '~ ni ikitai desu', english: 'I want to go to ~', category: 'pattern', is_default: true },
  { japanese: 'これは何ですか？', romaji: 'kore wa nan desu ka?', english: 'What is this?', category: 'pattern', is_default: true },
  { japanese: 'いくらですか？', romaji: 'ikura desu ka?', english: 'How much is it?', category: 'pattern', is_default: true },
  { japanese: '〜てもいいですか？', romaji: '~ temo ii desu ka?', english: 'May I ~?', category: 'pattern', is_default: true },
];
