'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image,
  BookOpen,
  Gamepad2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Command,
  FileText,
  Quote,
  Library,
  Scale,
  Target,
  Users,
  Map,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCommandPalette } from '@/app/providers';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigation = [
  { name: 'Command Centre', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Daily Priorities', href: '/priorities', icon: Target },
  { name: 'Focus Timer', href: '/focus', icon: Timer },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Rolodex', href: '/contacts', icon: Users },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Vision Board', href: '/vision', icon: Image },
  { name: 'Decisions', href: '/decisions', icon: Scale },
  { name: 'Daily Quote', href: '/quote', icon: Quote },
  { name: 'Reading Vault', href: '/reading', icon: Library },
  { name: 'Polymath Arcade', href: '/arcade', icon: Gamepad2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toggle } = useCommandPalette();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-semibold text-lg">Beacon OS</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
              <FileText className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Command Palette Trigger */}
        <div className="p-3">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-muted-foreground',
              collapsed && 'justify-center px-0'
            )}
            onClick={toggle}
          >
            <Command className="h-4 w-4" />
            {!collapsed && (
              <>
                <span className="ml-2 flex-1 text-left">Search...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                  ⌘K
                </kbd>
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const NavItem = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavItem;
          })}
        </nav>

        <Separator />

        {/* User Profile & Settings */}
        <div className="p-3 space-y-2">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              collapsed && 'justify-center px-0'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <Separator />

          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2',
              collapsed && 'justify-center px-0'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                TM
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Tungi</p>
                <p className="text-xs text-muted-foreground truncate">
                  Beacon Labs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
