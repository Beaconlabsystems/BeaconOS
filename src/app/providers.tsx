'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { User as AppUser } from '@/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CommandPalette } from '@/components/command-palette';

// Auth Context
interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAppUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setAppUser(data as AppUser);
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchAppUser(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAppUser(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAppUser(session.user.id);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Command Palette Context
interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
});

export const useCommandPalette = () => useContext(CommandPaletteContext);

function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </CommandPaletteContext.Provider>
  );
}

// Combined Providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
