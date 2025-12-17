'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  BookOpen,
  Lightbulb,
  AlertCircle,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { JournalEntry, Decision, Mood } from '@/types';
import { JOURNAL_PROMPTS } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const MOOD_COLORS: Record<Mood, string> = {
  great: 'bg-green-500',
  good: 'bg-emerald-400',
  okay: 'bg-yellow-400',
  low: 'bg-orange-400',
  struggling: 'bg-red-500',
};

const MOOD_LABELS: Record<Mood, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low: 'Low',
  struggling: 'Struggling',
};

export default function JournalPage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [entryForm, setEntryForm] = useState({
    one_move: '',
    avoiding: '',
    sixty_minutes: '',
    winning_evidence: '',
    content: '',
    mood: '' as Mood | '',
    energy_level: 3,
  });

  const [decisionForm, setDecisionForm] = useState({
    title: '',
    decision: '',
    rationale: '',
    expected_outcome: '',
    review_date: '',
  });

  useEffect(() => {
    if (appUser) {
      fetchData();
    }
  }, [appUser]);

  const fetchData = async () => {
    if (!appUser) return;

    setLoading(true);
    const supabase = createClient();

    // Fetch journal entries
    const { data: entriesData } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', appUser.id)
      .order('entry_date', { ascending: false });

    // Fetch decisions
    const { data: decisionsData } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', appUser.id)
      .order('decision_date', { ascending: false });

    setEntries((entriesData || []) as JournalEntry[]);
    setDecisions((decisionsData || []) as Decision[]);
    setLoading(false);
  };

  const getEntryForDate = (date: Date): JournalEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find((e) => e.entry_date === dateStr);
  };

  const handleSaveEntry = async () => {
    if (!appUser) return;

    setSaving(true);
    const supabase = createClient();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingEntry = getEntryForDate(selectedDate);

    try {
      const entryData = {
        user_id: appUser.id,
        entry_date: dateStr,
        one_move: entryForm.one_move || null,
        avoiding: entryForm.avoiding || null,
        sixty_minutes: entryForm.sixty_minutes || null,
        winning_evidence: entryForm.winning_evidence || null,
        content: entryForm.content || null,
        mood: entryForm.mood || null,
        energy_level: entryForm.energy_level,
      };

      if (existingEntry) {
        await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', existingEntry.id);
      } else {
        await supabase.from('journal_entries').insert(entryData);
      }

      toast({ title: 'Entry saved' });
      setIsEntryDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error saving entry' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDecision = async () => {
    if (!appUser || !decisionForm.title || !decisionForm.decision) return;

    setSaving(true);
    const supabase = createClient();

    try {
      await supabase.from('decisions').insert({
        user_id: appUser.id,
        decision_date: format(new Date(), 'yyyy-MM-dd'),
        title: decisionForm.title,
        decision: decisionForm.decision,
        rationale: decisionForm.rationale || null,
        expected_outcome: decisionForm.expected_outcome || null,
        review_date: decisionForm.review_date || null,
      });

      toast({ title: 'Decision logged' });
      setIsDecisionDialogOpen(false);
      setDecisionForm({
        title: '',
        decision: '',
        rationale: '',
        expected_outcome: '',
        review_date: '',
      });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error saving decision' });
    } finally {
      setSaving(false);
    }
  };

  const openEntryForDate = (date: Date) => {
    setSelectedDate(date);
    const existing = getEntryForDate(date);
    if (existing) {
      setEntryForm({
        one_move: existing.one_move || '',
        avoiding: existing.avoiding || '',
        sixty_minutes: existing.sixty_minutes || '',
        winning_evidence: existing.winning_evidence || '',
        content: existing.content || '',
        mood: existing.mood || '',
        energy_level: existing.energy_level || 3,
      });
    } else {
      setEntryForm({
        one_move: '',
        avoiding: '',
        sixty_minutes: '',
        winning_evidence: '',
        content: '',
        mood: '',
        energy_level: 3,
      });
    }
    setIsEntryDialogOpen(true);
  };

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal</h1>
          <p className="text-muted-foreground mt-1">
            Reflect on your journey and log key decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsDecisionDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Log Decision
          </Button>
          <Button onClick={() => openEntryForDate(new Date())}>
            <Plus className="mr-2 h-4 w-4" />
            Today&apos;s Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="decisions">Decision Log</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          {/* Week Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekStart(subDays(weekStart, 7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">
                  {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </h3>
                <Button
                  variant="outline"
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
                    <div
                      key={day.toISOString()}
                      onClick={() => openEntryForDate(day)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-colors min-h-[100px]',
                        isToday && 'ring-2 ring-primary',
                        entry ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted'
                      )}
                    >
                      <div className="text-sm font-medium">
                        {format(day, 'EEE')}
                      </div>
                      <div className={cn('text-2xl font-bold', isToday && 'text-primary')}>
                        {format(day, 'd')}
                      </div>
                      {entry && (
                        <div className="mt-2 space-y-1">
                          {entry.mood && (
                            <div className={cn('h-2 w-2 rounded-full', MOOD_COLORS[entry.mood])} />
                          )}
                          {entry.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {entry.content.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => openEntryForDate(parseISO(entry.entry_date))}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">
                        {format(parseISO(entry.entry_date), 'd')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(entry.entry_date), 'MMM')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {entry.one_move && (
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="truncate">{entry.one_move}</span>
                        </div>
                      )}
                      {entry.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.content}
                        </p>
                      )}
                    </div>
                    {entry.mood && (
                      <Badge variant="secondary">{MOOD_LABELS[entry.mood]}</Badge>
                    )}
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No entries yet. Start journaling today!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision Log</CardTitle>
              <CardDescription>
                Track important decisions for future reflection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{decision.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(decision.decision_date, 'MMM d, yyyy')}
                        </p>
                      </div>
                      {decision.review_date && (
                        <Badge variant="outline">
                          Review: {formatDate(decision.review_date, 'MMM d')}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3">{decision.decision}</p>
                    {decision.rationale && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Rationale:</p>
                        <p className="text-sm text-muted-foreground">{decision.rationale}</p>
                      </div>
                    )}
                    {decision.expected_outcome && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Expected outcome: </span>
                        <span className="text-muted-foreground">{decision.expected_outcome}</span>
                      </div>
                    )}
                  </div>
                ))}
                {decisions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No decisions logged yet. Start tracking important choices!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Dialog */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Journal Entry - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Prompts */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {JOURNAL_PROMPTS.one_move}
                </Label>
                <Textarea
                  value={entryForm.one_move}
                  onChange={(e) => setEntryForm({ ...entryForm, one_move: e.target.value })}
                  placeholder="The one thing that would move the needle..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  {JOURNAL_PROMPTS.avoiding}
                </Label>
                <Textarea
                  value={entryForm.avoiding}
                  onChange={(e) => setEntryForm({ ...entryForm, avoiding: e.target.value })}
                  placeholder="Be honest with yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {JOURNAL_PROMPTS.sixty_minutes}
                </Label>
                <Textarea
                  value={entryForm.sixty_minutes}
                  onChange={(e) => setEntryForm({ ...entryForm, sixty_minutes: e.target.value })}
                  placeholder="Your highest-leverage hour..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-500" />
                  {JOURNAL_PROMPTS.winning_evidence}
                </Label>
                <Textarea
                  value={entryForm.winning_evidence}
                  onChange={(e) => setEntryForm({ ...entryForm, winning_evidence: e.target.value })}
                  placeholder="Celebrate your wins..."
                />
              </div>
            </div>

            {/* Free-form content */}
            <div className="space-y-2">
              <Label>Free Writing</Label>
              <Textarea
                value={entryForm.content}
                onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                placeholder="Any other thoughts..."
                className="min-h-[100px]"
              />
            </div>

            {/* Mood & Energy */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mood</Label>
                <Select
                  value={entryForm.mood}
                  onValueChange={(v: Mood) => setEntryForm({ ...entryForm, mood: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MOOD_LABELS) as Mood[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-3 w-3 rounded-full', MOOD_COLORS[m])} />
                          {MOOD_LABELS[m]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Energy Level (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={entryForm.energy_level === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEntryForm({ ...entryForm, energy_level: level })}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} loading={saving}>
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Decision</DialogTitle>
            <DialogDescription>
              Record important decisions for future reflection and accountability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Decision Title</Label>
              <Input
                value={decisionForm.title}
                onChange={(e) => setDecisionForm({ ...decisionForm, title: e.target.value })}
                placeholder="e.g., Decided to pursue Innovate UK grant"
              />
            </div>

            <div className="space-y-2">
              <Label>The Decision</Label>
              <Textarea
                value={decisionForm.decision}
                onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                placeholder="What did you decide?"
              />
            </div>

            <div className="space-y-2">
              <Label>Rationale</Label>
              <Textarea
                value={decisionForm.rationale}
                onChange={(e) => setDecisionForm({ ...decisionForm, rationale: e.target.value })}
                placeholder="Why did you make this decision?"
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Outcome</Label>
              <Textarea
                value={decisionForm.expected_outcome}
                onChange={(e) => setDecisionForm({ ...decisionForm, expected_outcome: e.target.value })}
                placeholder="What do you expect to happen?"
              />
            </div>

            <div className="space-y-2">
              <Label>Review Date</Label>
              <Input
                type="date"
                value={decisionForm.review_date}
                onChange={(e) => setDecisionForm({ ...decisionForm, review_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDecisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveDecision}
              loading={saving}
              disabled={!decisionForm.title || !decisionForm.decision}
            >
              Log Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
