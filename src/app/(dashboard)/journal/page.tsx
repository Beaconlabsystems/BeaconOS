'use client';

import { useState } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, addDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

// Mock data
const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: format(new Date(), 'yyyy-MM-dd'),
    content: 'Made good progress on the Innovate UK application today. The technical section is coming together. Need to focus on the budget breakdown tomorrow.',
  },
  {
    id: '2',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    content: 'Thinking about the product roadmap. We need to prioritize ruthlessly - the MVP should be laser-focused on the core value proposition.',
  },
];

const PROMPTS = [
  "What's on your mind?",
  "What are you grateful for today?",
  "What's one thing you learned?",
  "What would make today great?",
  "What's been challenging lately?",
];

export default function JournalPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const getEntryForDate = (date: Date): JournalEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find((e) => e.date === dateStr);
  };

  const openEntryForDate = (date: Date) => {
    setSelectedDate(date);
    const existing = getEntryForDate(date);
    setContent(existing?.content || '');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = getEntryForDate(selectedDate);

    if (existing) {
      setEntries(entries.map(e =>
        e.id === existing.id ? { ...e, content } : e
      ));
    } else {
      setEntries([
        { id: Date.now().toString(), date: dateStr, content },
        ...entries,
      ]);
    }

    toast({ title: 'Entry saved' });
    setIsDialogOpen(false);
    setSaving(false);
  };

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Journal</h1>
          <p className="text-muted-foreground mt-1">Reflect and capture your thoughts</p>
        </div>
        <Button onClick={() => openEntryForDate(new Date())}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Week Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekStart(subDays(weekStart, 7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium">
              {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const entry = getEntryForDate(day);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => openEntryForDate(day)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-colors min-h-[80px]',
                    isToday && 'ring-1 ring-primary',
                    entry ? 'bg-accent/50' : 'hover:bg-accent/30'
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn('text-lg font-medium', isToday && 'text-primary')}>
                    {format(day, 'd')}
                  </div>
                  {entry && (
                    <div className="mt-1 h-1 w-4 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Recent Entries
        </h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No entries yet. Start journaling today.
            </CardContent>
          </Card>
        ) : (
          entries.slice(0, 5).map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => openEntryForDate(parseISO(entry.date))}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="text-center min-w-[40px]">
                    <div className="text-xl font-medium">
                      {format(parseISO(entry.date), 'd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), 'MMM')}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={randomPrompt}
              className="min-h-[200px] resize-none text-base"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!content.trim() || saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
