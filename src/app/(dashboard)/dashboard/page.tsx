'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowRight,
  Plus,
  BookOpen,
  Scale,
  Library,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockFocus = {
  title: 'Complete Innovate UK application',
  description: 'Focus on the technical approach section',
};

const mockCurrentReading = {
  title: 'Zero to One',
  author: 'Peter Thiel',
  progress: 45,
};

const mockRecentDecisions = [
  { id: '1', title: 'Postpone Series A fundraising', date: '2025-12-15' },
  { id: '2', title: 'Hire part-time designer', date: '2025-12-10' },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [quickNote, setQuickNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleQuickCapture = async () => {
    if (!quickNote.trim()) return;
    setSaving(true);

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Note captured',
      description: 'Added to your journal.',
    });
    setQuickNote('');
    setSaving(false);
  };

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-muted-foreground">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {greeting()}, Tungi
        </h1>
      </div>

      {/* Today's Focus */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Today&apos;s Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-medium">{mockFocus.title}</h2>
          <p className="text-muted-foreground mt-1">{mockFocus.description}</p>
        </CardContent>
      </Card>

      {/* Quick Capture */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Quick Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleQuickCapture}
              disabled={!quickNote.trim() || saving}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Add to Journal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Reading */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Currently Reading
              </CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{mockCurrentReading.title}</h3>
            <p className="text-sm text-muted-foreground">{mockCurrentReading.author}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex-1 bg-secondary rounded-full h-1.5 mr-3">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${mockCurrentReading.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{mockCurrentReading.progress}%</span>
            </div>
            <Link href="/reading">
              <Button variant="ghost" size="sm" className="mt-3 -ml-2 text-muted-foreground">
                View Reading Vault
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent Decisions
              </CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentDecisions.map((decision) => (
                <div key={decision.id} className="flex items-start justify-between">
                  <span className="text-sm">{decision.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(decision.date), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/decisions">
              <Button variant="ghost" size="sm" className="mt-3 -ml-2 text-muted-foreground">
                View All Decisions
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Journal Link */}
      <Link href="/journal">
        <Card className="group cursor-pointer transition-colors hover:bg-accent/50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Open Journal</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
