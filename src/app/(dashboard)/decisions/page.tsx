'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface Decision {
  id: string;
  date: string;
  title: string;
  decision: string;
  rationale?: string;
  expectedOutcome?: string;
  reviewDate?: string;
}

const MOCK_DECISIONS: Decision[] = [
  {
    id: '1',
    date: '2025-12-15',
    title: 'Postpone Series A fundraising',
    decision: 'Decided to delay Series A by 6 months to focus on product-market fit.',
    rationale: 'Current metrics are not strong enough for favorable terms. Better to show more traction.',
    expectedOutcome: 'Stronger negotiating position, better valuation.',
    reviewDate: '2026-06-15',
  },
  {
    id: '2',
    date: '2025-12-10',
    title: 'Hire part-time designer',
    decision: 'Bring on a contractor for 20 hours/week instead of full-time hire.',
    rationale: 'Preserves runway while getting design support we need.',
    expectedOutcome: 'Improved UI/UX without overcommitting on fixed costs.',
  },
];

export default function DecisionsPage() {
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<Decision[]>(MOCK_DECISIONS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    decision: '',
    rationale: '',
    expectedOutcome: '',
    reviewDate: '',
  });

  const handleSave = () => {
    if (!formData.title || !formData.decision) return;

    const newDecision: Decision = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      title: formData.title,
      decision: formData.decision,
      rationale: formData.rationale || undefined,
      expectedOutcome: formData.expectedOutcome || undefined,
      reviewDate: formData.reviewDate || undefined,
    };

    setDecisions([newDecision, ...decisions]);
    toast({ title: 'Decision logged' });
    setIsDialogOpen(false);
    setFormData({
      title: '',
      decision: '',
      rationale: '',
      expectedOutcome: '',
      reviewDate: '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Decision Log</h1>
          <p className="text-muted-foreground mt-1">Track important decisions for future reflection</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Decision
        </Button>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {decisions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No decisions logged yet.
            </CardContent>
          </Card>
        ) : (
          decisions.map((decision) => (
            <Collapsible
              key={decision.id}
              open={expandedId === decision.id}
              onOpenChange={(open) => setExpandedId(open ? decision.id : null)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{decision.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(decision.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      {expandedId === decision.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Decision</h4>
                      <p className="text-sm">{decision.decision}</p>
                    </div>
                    {decision.rationale && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Rationale</h4>
                        <p className="text-sm">{decision.rationale}</p>
                      </div>
                    )}
                    {decision.expectedOutcome && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Expected Outcome</h4>
                        <p className="text-sm">{decision.expectedOutcome}</p>
                      </div>
                    )}
                    {decision.reviewDate && (
                      <div className="text-sm text-muted-foreground">
                        Review: {format(parseISO(decision.reviewDate), 'MMMM d, yyyy')}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Decision</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What decision did you make?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <Textarea
                id="decision"
                placeholder="Describe the decision..."
                value={formData.decision}
                onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale (optional)</Label>
              <Textarea
                id="rationale"
                placeholder="Why did you make this decision?"
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedOutcome">Expected Outcome (optional)</Label>
              <Textarea
                id="expectedOutcome"
                placeholder="What do you expect to happen?"
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date (optional)</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title || !formData.decision}
            >
              Log Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
