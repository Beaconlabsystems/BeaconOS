'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CommandPalette } from '@/components/command-palette';

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
    <TooltipProvider>
      <CommandPaletteProvider>
        {children}
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
