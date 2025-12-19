export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      priorities: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'high' | 'medium' | 'low'
          completed: boolean
          created_at: string
          completed_at: string | null
          difficulty: number | null
          reflection: string | null
          tips: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          priority?: 'high' | 'medium' | 'low'
          completed?: boolean
          created_at?: string
          completed_at?: string | null
          difficulty?: number | null
          reflection?: string | null
          tips?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'high' | 'medium' | 'low'
          completed?: boolean
          created_at?: string
          completed_at?: string | null
          difficulty?: number | null
          reflection?: string | null
          tips?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          role: string | null
          category: 'investor' | 'advisor' | 'partner' | 'customer' | 'other'
          notes: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          role?: string | null
          category?: 'investor' | 'advisor' | 'partner' | 'customer' | 'other'
          notes?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          role?: string | null
          category?: 'investor' | 'advisor' | 'partner' | 'customer' | 'other'
          notes?: string | null
          location?: string | null
          created_at?: string
        }
      }
      roadmap_milestones: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: 'funding' | 'product' | 'team' | 'revenue' | 'other'
          status: 'planned' | 'in-progress' | 'completed'
          target_date: string | null
          completed_date: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          type?: 'funding' | 'product' | 'team' | 'revenue' | 'other'
          status?: 'planned' | 'in-progress' | 'completed'
          target_date?: string | null
          completed_date?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: 'funding' | 'product' | 'team' | 'revenue' | 'other'
          status?: 'planned' | 'in-progress' | 'completed'
          target_date?: string | null
          completed_date?: string | null
          order_index?: number
          created_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          mode: 'focus' | 'short-break' | 'long-break'
          duration_minutes: number
          completed: boolean
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          mode: 'focus' | 'short-break' | 'long-break'
          duration_minutes: number
          completed?: boolean
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          mode?: 'focus' | 'short-break' | 'long-break'
          duration_minutes?: number
          completed?: boolean
          started_at?: string
          ended_at?: string | null
        }
      }
      focus_settings: {
        Row: {
          id: string
          user_id: string
          focus_minutes: number
          short_break_minutes: number
          long_break_minutes: number
          sessions_before_long_break: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          focus_minutes?: number
          short_break_minutes?: number
          long_break_minutes?: number
          sessions_before_long_break?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          focus_minutes?: number
          short_break_minutes?: number
          long_break_minutes?: number
          sessions_before_long_break?: number
          updated_at?: string
        }
      }
      japanese_word_progress: {
        Row: {
          id: string
          user_id: string
          word_id: string
          correct_count: number
          incorrect_count: number
          last_seen: string
          next_review: string
          mastered: boolean
        }
        Insert: {
          id?: string
          user_id?: string
          word_id: string
          correct_count?: number
          incorrect_count?: number
          last_seen?: string
          next_review?: string
          mastered?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          correct_count?: number
          incorrect_count?: number
          last_seen?: string
          next_review?: string
          mastered?: boolean
        }
      }
      japanese_level_progress: {
        Row: {
          id: string
          user_id: string
          quest: 'A' | 'B'
          level: number
          questions_answered: number
          correct_answers: number
          completed: boolean
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          quest: 'A' | 'B'
          level: number
          questions_answered?: number
          correct_answers?: number
          completed?: boolean
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quest?: 'A' | 'B'
          level?: number
          questions_answered?: number
          correct_answers?: number
          completed?: boolean
          unlocked?: boolean
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title?: string | null
          content: string
          mood?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      decisions: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'pending' | 'decided' | 'revisiting'
          decision: string | null
          reasoning: string | null
          outcome: string | null
          decided_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          status?: 'pending' | 'decided' | 'revisiting'
          decision?: string | null
          reasoning?: string | null
          outcome?: string | null
          decided_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'decided' | 'revisiting'
          decision?: string | null
          reasoning?: string | null
          outcome?: string | null
          decided_at?: string | null
          created_at?: string
        }
      }
      reading_items: {
        Row: {
          id: string
          user_id: string
          title: string
          author: string | null
          type: 'book' | 'article' | 'paper' | 'other'
          status: 'want-to-read' | 'reading' | 'completed'
          progress: number
          notes: string | null
          rating: number | null
          url: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          author?: string | null
          type?: 'book' | 'article' | 'paper' | 'other'
          status?: 'want-to-read' | 'reading' | 'completed'
          progress?: number
          notes?: string | null
          rating?: number | null
          url?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          author?: string | null
          type?: 'book' | 'article' | 'paper' | 'other'
          status?: 'want-to-read' | 'reading' | 'completed'
          progress?: number
          notes?: string | null
          rating?: number | null
          url?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      vision_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          category: string | null
          position_x: number
          position_y: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          position_x?: number
          position_y?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          position_x?: number
          position_y?: number
          created_at?: string
        }
      }
      daily_focus: {
        Row: {
          id: string
          user_id: string
          date: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          date: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          title?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Priority = Database['public']['Tables']['priorities']['Row']
export type PriorityInsert = Database['public']['Tables']['priorities']['Insert']
export type PriorityUpdate = Database['public']['Tables']['priorities']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type RoadmapMilestone = Database['public']['Tables']['roadmap_milestones']['Row']
export type RoadmapMilestoneInsert = Database['public']['Tables']['roadmap_milestones']['Insert']
export type RoadmapMilestoneUpdate = Database['public']['Tables']['roadmap_milestones']['Update']

export type FocusSession = Database['public']['Tables']['focus_sessions']['Row']
export type FocusSessionInsert = Database['public']['Tables']['focus_sessions']['Insert']

export type FocusSettings = Database['public']['Tables']['focus_settings']['Row']
export type FocusSettingsUpdate = Database['public']['Tables']['focus_settings']['Update']

export type JapaneseWordProgress = Database['public']['Tables']['japanese_word_progress']['Row']
export type JapaneseWordProgressInsert = Database['public']['Tables']['japanese_word_progress']['Insert']
export type JapaneseWordProgressUpdate = Database['public']['Tables']['japanese_word_progress']['Update']

export type JapaneseLevelProgress = Database['public']['Tables']['japanese_level_progress']['Row']
export type JapaneseLevelProgressInsert = Database['public']['Tables']['japanese_level_progress']['Insert']
export type JapaneseLevelProgressUpdate = Database['public']['Tables']['japanese_level_progress']['Update']

export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert']
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update']

export type Decision = Database['public']['Tables']['decisions']['Row']
export type DecisionInsert = Database['public']['Tables']['decisions']['Insert']
export type DecisionUpdate = Database['public']['Tables']['decisions']['Update']

export type ReadingItem = Database['public']['Tables']['reading_items']['Row']
export type ReadingItemInsert = Database['public']['Tables']['reading_items']['Insert']
export type ReadingItemUpdate = Database['public']['Tables']['reading_items']['Update']

export type VisionItem = Database['public']['Tables']['vision_items']['Row']
export type VisionItemInsert = Database['public']['Tables']['vision_items']['Insert']
export type VisionItemUpdate = Database['public']['Tables']['vision_items']['Update']

export type DailyFocus = Database['public']['Tables']['daily_focus']['Row']
export type DailyFocusInsert = Database['public']['Tables']['daily_focus']['Insert']
export type DailyFocusUpdate = Database['public']['Tables']['daily_focus']['Update']
