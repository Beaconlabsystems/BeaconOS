'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Image,
  Map,
  BookOpen,
  Gamepad2,
  Timer,
  Calculator,
  Users,
  Plus,
  Search,
  Settings,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Flame,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const navigate = useCallback((path: string) => {
    router.push(path);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: 'G D',
      action: () => navigate('/dashboard'),
      category: 'navigation',
    },
    {
      id: 'vision',
      label: 'Go to Vision Board',
      icon: <Image className="h-4 w-4" />,
      shortcut: 'G V',
      action: () => navigate('/vision'),
      category: 'navigation',
    },
    {
      id: 'roadmap',
      label: 'Go to Roadmap',
      icon: <Map className="h-4 w-4" />,
      shortcut: 'G R',
      action: () => navigate('/roadmap'),
      category: 'navigation',
    },
    {
      id: 'journal',
      label: 'Go to Journal',
      icon: <BookOpen className="h-4 w-4" />,
      shortcut: 'G J',
      action: () => navigate('/journal'),
      category: 'navigation',
    },
    {
      id: 'games',
      label: 'Go to Games',
      icon: <Gamepad2 className="h-4 w-4" />,
      shortcut: 'G G',
      action: () => navigate('/games'),
      category: 'navigation',
    },
    {
      id: 'focus',
      label: 'Go to Focus',
      icon: <Timer className="h-4 w-4" />,
      shortcut: 'G F',
      action: () => navigate('/focus'),
      category: 'navigation',
    },
    {
      id: 'runway',
      label: 'Go to Runway Simulator',
      icon: <Calculator className="h-4 w-4" />,
      shortcut: 'G $',
      action: () => navigate('/runway'),
      category: 'navigation',
    },
    {
      id: 'crm',
      label: 'Go to Investor CRM',
      icon: <Users className="h-4 w-4" />,
      shortcut: 'G C',
      action: () => navigate('/crm'),
      category: 'navigation',
    },
    // Actions
    {
      id: 'new-task',
      label: 'Create New Task',
      icon: <Plus className="h-4 w-4" />,
      shortcut: 'N T',
      action: () => {
        navigate('/dashboard?action=new-task');
      },
      category: 'actions',
    },
    {
      id: 'quick-journal',
      label: 'Quick Journal Entry',
      icon: <BookOpen className="h-4 w-4" />,
      shortcut: 'N J',
      action: () => {
        navigate('/journal?action=quick-entry');
      },
      category: 'actions',
    },
    {
      id: 'start-sprint',
      label: 'Start Focus Sprint',
      icon: <Flame className="h-4 w-4" />,
      shortcut: 'S S',
      action: () => {
        navigate('/focus?action=start');
      },
      category: 'actions',
    },
    {
      id: 'motivation',
      label: 'Motivation Mode',
      icon: <Sparkles className="h-4 w-4" />,
      shortcut: 'M M',
      action: () => {
        navigate('/vision?mode=motivation');
      },
      category: 'actions',
    },
    // Settings
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/settings'),
      category: 'settings',
    },
  ];

  // Group commands by category
  const navigationCommands = commands.filter((c) => c.category === 'navigation');
  const actionCommands = commands.filter((c) => c.category === 'actions');
  const settingsCommands = commands.filter((c) => c.category === 'settings');

  // Handle keyboard navigation shortcuts (G + key sequences)
  useEffect(() => {
    let keySequence = '';
    let sequenceTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input or command palette is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        open
      ) {
        return;
      }

      keySequence += e.key.toLowerCase();
      clearTimeout(sequenceTimeout);

      // Check for key sequences
      if (keySequence === 'gd') {
        navigate('/dashboard');
        keySequence = '';
      } else if (keySequence === 'gv') {
        navigate('/vision');
        keySequence = '';
      } else if (keySequence === 'gr') {
        navigate('/roadmap');
        keySequence = '';
      } else if (keySequence === 'gj') {
        navigate('/journal');
        keySequence = '';
      } else if (keySequence === 'gg') {
        navigate('/games');
        keySequence = '';
      } else if (keySequence === 'gf') {
        navigate('/focus');
        keySequence = '';
      } else if (keySequence === 'gc') {
        navigate('/crm');
        keySequence = '';
      }

      // Reset sequence after 500ms
      sequenceTimeout = setTimeout(() => {
        keySequence = '';
      }, 500);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeout);
    };
  }, [navigate, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Navigation">
              {navigationCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  onSelect={command.action}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                    {command.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{command.label}</span>
                  </div>
                  {command.shortcut && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      {command.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions */}
            <Command.Group heading="Actions">
              {actionCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  onSelect={command.action}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                    {command.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{command.label}</span>
                  </div>
                  {command.shortcut && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      {command.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Settings */}
            <Command.Group heading="Settings">
              {settingsCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  onSelect={command.action}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer aria-selected:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                    {command.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{command.label}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↑</kbd>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
