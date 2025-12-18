'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Target,
  Rocket,
  TrendingUp,
  DollarSign,
  Users,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type MilestoneStatus = 'planned' | 'in-progress' | 'completed';
type MilestoneType = 'funding' | 'product' | 'team' | 'revenue' | 'other';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  type: MilestoneType;
  status: MilestoneStatus;
  targetDate?: string;
  completedDate?: string;
  order: number;
}

const TYPE_ICONS: Record<MilestoneType, typeof Rocket> = {
  funding: DollarSign,
  product: Rocket,
  team: Users,
  revenue: TrendingUp,
  other: Target,
};

const TYPE_LABELS: Record<MilestoneType, string> = {
  funding: 'Funding',
  product: 'Product',
  team: 'Team',
  revenue: 'Revenue',
  other: 'Other',
};

const TYPE_COLORS: Record<MilestoneType, string> = {
  funding: 'text-green-500',
  product: 'text-blue-500',
  team: 'text-purple-500',
  revenue: 'text-orange-500',
  other: 'text-muted-foreground',
};

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const MOCK_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'MVP Launch',
    description: 'Launch minimum viable product to first beta users',
    type: 'product',
    status: 'completed',
    targetDate: '2025-06-01',
    completedDate: '2025-05-28',
    order: 1,
  },
  {
    id: '2',
    title: 'SEIS/EIS Investment',
    description: 'Close £150k angel round with SEIS/EIS tax relief for investors',
    type: 'funding',
    status: 'in-progress',
    targetDate: '2025-09-01',
    order: 2,
  },
  {
    id: '3',
    title: 'First 10 Paying Customers',
    description: 'Achieve product-market fit with recurring revenue',
    type: 'revenue',
    status: 'in-progress',
    targetDate: '2025-10-01',
    order: 3,
  },
  {
    id: '4',
    title: 'Hire CTO',
    description: 'Bring on technical co-founder or senior technical lead',
    type: 'team',
    status: 'planned',
    targetDate: '2025-12-01',
    order: 4,
  },
  {
    id: '5',
    title: 'Seed Round',
    description: '£500k-£1M seed round from institutional investors',
    type: 'funding',
    status: 'planned',
    targetDate: '2026-03-01',
    order: 5,
  },
  {
    id: '6',
    title: '£100k ARR',
    description: 'Reach annual recurring revenue milestone',
    type: 'revenue',
    status: 'planned',
    targetDate: '2026-06-01',
    order: 6,
  },
  {
    id: '7',
    title: 'Series A',
    description: '£3-5M Series A to scale sales and product',
    type: 'funding',
    status: 'planned',
    targetDate: '2027-01-01',
    order: 7,
  },
];

export default function RoadmapPage() {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other' as MilestoneType,
    status: 'planned' as MilestoneStatus,
    targetDate: '',
  });

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const inProgressCount = milestones.filter(m => m.status === 'in-progress').length;

  const handleSave = () => {
    if (!formData.title) return;

    if (editingMilestone) {
      setMilestones(milestones.map(m =>
        m.id === editingMilestone.id ? { ...m, ...formData } : m
      ));
      toast({ title: 'Milestone updated' });
    } else {
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        ...formData,
        order: milestones.length + 1,
      };
      setMilestones([...milestones, newMilestone]);
      toast({ title: 'Milestone added' });
    }

    closeDialog();
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      type: milestone.type,
      status: milestone.status,
      targetDate: milestone.targetDate || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
    toast({ title: 'Milestone removed' });
  };

  const handleStatusChange = (id: string, newStatus: MilestoneStatus) => {
    setMilestones(milestones.map(m =>
      m.id === id
        ? {
            ...m,
            status: newStatus,
            completedDate: newStatus === 'completed' ? format(new Date(), 'yyyy-MM-dd') : undefined,
          }
        : m
    ));
    toast({ title: `Milestone ${STATUS_LABELS[newStatus].toLowerCase()}` });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingMilestone(null);
    setFormData({
      title: '',
      description: '',
      type: 'other',
      status: 'planned',
      targetDate: '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Roadmap</h1>
          <p className="text-muted-foreground mt-1">Your path to success</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-green-500">{completedCount}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{inProgressCount}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{milestones.length - completedCount - inProgressCount}</p>
            <p className="text-sm text-muted-foreground">Planned</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="timeline-line" />

        <div className="space-y-4">
          {sortedMilestones.map((milestone, index) => {
            const Icon = TYPE_ICONS[milestone.type];
            const isExpanded = expandedId === milestone.id;

            return (
              <div key={milestone.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className={cn(
                  'timeline-dot',
                  milestone.status === 'completed' && 'completed',
                  milestone.status === 'in-progress' && 'active'
                )}>
                  {milestone.status === 'completed' && (
                    <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>

                <Card className={cn(
                  'transition-all',
                  milestone.status === 'completed' && 'opacity-70',
                  isExpanded && 'ring-1 ring-primary'
                )}>
                  <CardContent className="py-4">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg bg-secondary', TYPE_COLORS[milestone.type])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className={cn(
                            'font-medium',
                            milestone.status === 'completed' && 'line-through'
                          )}>
                            {milestone.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {TYPE_LABELS[milestone.type]}
                            </Badge>
                            {milestone.targetDate && (
                              <span className="text-xs text-muted-foreground">
                                {milestone.status === 'completed' && milestone.completedDate
                                  ? `Completed ${format(parseISO(milestone.completedDate), 'MMM d, yyyy')}`
                                  : `Target: ${format(parseISO(milestone.targetDate), 'MMM yyyy')}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={milestone.status === 'completed' ? 'default' : 'outline'}
                          className={cn(
                            milestone.status === 'in-progress' && 'border-blue-500 text-blue-500'
                          )}
                        >
                          {STATUS_LABELS[milestone.status]}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        )}

                        {/* Status buttons */}
                        <div className="flex flex-wrap gap-2">
                          {milestone.status !== 'planned' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(milestone.id, 'planned')}
                            >
                              Mark as Planned
                            </Button>
                          )}
                          {milestone.status !== 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(milestone.id, 'in-progress')}
                            >
                              Start Working
                            </Button>
                          )}
                          {milestone.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(milestone.id, 'completed')}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                        </div>

                        {/* Edit/Delete */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(milestone)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(milestone.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {milestones.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No milestones yet. Plan your journey to success.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Milestone
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Close Seed Round"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this milestone involve?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: MilestoneType) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as MilestoneType[]).map(type => (
                      <SelectItem key={type} value={type}>{TYPE_LABELS[type]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: MilestoneStatus) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as MilestoneStatus[]).map(status => (
                      <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title}>
              {editingMilestone ? 'Save' : 'Add Milestone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
