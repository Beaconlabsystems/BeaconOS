'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import type { Milestone, Swimlane, MilestoneStatus } from '@/types';
import { SWIMLANE_LABELS, SWIMLANE_COLORS } from '@/types';
import { formatDate, cn } from '@/lib/utils';

// Mock data for demo
const MOCK_MILESTONES: Milestone[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'Innovate UK Application',
    description: 'Submit grant application for product development',
    swimlane: 'funding',
    status: 'in_progress',
    target_date: '2025-03-15',
    completed_date: null,
    definition_of_done: ['Application submitted', 'All documents uploaded'],
    prerequisites: ['Finalise budget', 'Get letter of support'],
    risks: ['Tight deadline', 'Complex application process'],
    color: '#0ea5e9',
    position: 0,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'MVP Launch',
    description: 'Release minimum viable product to first customers',
    swimlane: 'product',
    status: 'pending',
    target_date: '2025-06-01',
    completed_date: null,
    definition_of_done: ['Product deployed', '10 beta users onboarded'],
    prerequisites: ['Complete core features', 'Set up analytics'],
    risks: ['Technical delays', 'User feedback may require pivots'],
    color: '#8b5cf6',
    position: 0,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function RoadmapPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [expandedSwimlanes, setExpandedSwimlanes] = useState<Set<string>>(new Set(Object.keys(SWIMLANE_LABELS)));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    swimlane: 'funding' as Swimlane,
    status: 'pending' as MilestoneStatus,
    target_date: '',
    definition_of_done: [''],
    prerequisites: [''],
    risks: [''],
    color: '#0ea5e9',
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);


  const toggleSwimlane = (swimlane: string) => {
    const newExpanded = new Set(expandedSwimlanes);
    if (newExpanded.has(swimlane)) {
      newExpanded.delete(swimlane);
    } else {
      newExpanded.add(swimlane);
    }
    setExpandedSwimlanes(newExpanded);
  };

  const getMilestonesBySwimLane = (swimlane: Swimlane) => {
    return milestones.filter((m) => m.swimlane === swimlane);
  };

  const getSwimlaneprogress = (swimlane: Swimlane) => {
    const swimlaneMilestones = getMilestonesBySwimLane(swimlane);
    if (swimlaneMilestones.length === 0) return 0;
    const completed = swimlaneMilestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / swimlaneMilestones.length) * 100);
  };

  const handleSaveMilestone = () => {
    if (!formData.title) return;

    if (editingMilestone) {
      setMilestones(milestones.map(m =>
        m.id === editingMilestone.id
          ? {
              ...m,
              ...formData,
              definition_of_done: formData.definition_of_done.filter((d) => d.trim()),
              prerequisites: formData.prerequisites.filter((p) => p.trim()),
              risks: formData.risks.filter((r) => r.trim()),
            }
          : m
      ));
      toast({ title: 'Milestone updated' });
    } else {
      const position = milestones.filter((m) => m.swimlane === formData.swimlane).length;
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        user_id: 'demo',
        title: formData.title,
        description: formData.description || null,
        swimlane: formData.swimlane,
        status: formData.status,
        target_date: formData.target_date || null,
        definition_of_done: formData.definition_of_done.filter((d) => d.trim()),
        prerequisites: formData.prerequisites.filter((p) => p.trim()),
        risks: formData.risks.filter((r) => r.trim()),
        color: formData.color,
        position,
        completed_date: null,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMilestones([...milestones, newMilestone]);
      toast({ title: 'Milestone created' });
    }

    setIsDialogOpen(false);
    setEditingMilestone(null);
    resetForm();
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      swimlane: milestone.swimlane,
      status: milestone.status,
      target_date: milestone.target_date || '',
      definition_of_done: milestone.definition_of_done.length ? milestone.definition_of_done : [''],
      prerequisites: milestone.prerequisites.length ? milestone.prerequisites : [''],
      risks: milestone.risks.length ? milestone.risks : [''],
      color: milestone.color,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
    toast({ title: 'Milestone deleted' });
    setSelectedMilestone(null);
  };

  const handleUpdateStatus = (id: string, status: MilestoneStatus) => {
    setMilestones(milestones.map(m => {
      if (m.id === id) {
        const update: any = { ...m, status };
        if (status === 'completed') {
          update.completed_date = new Date().toISOString().split('T')[0];
        }
        return update;
      }
      return m;
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      swimlane: 'funding',
      status: 'pending',
      target_date: '',
      definition_of_done: [''],
      prerequisites: [''],
      risks: [''],
      color: '#0ea5e9',
    });
  };

  const addArrayField = (field: 'definition_of_done' | 'prerequisites' | 'risks') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const updateArrayField = (
    field: 'definition_of_done' | 'prerequisites' | 'risks',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Track your journey from idea to IPO
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingMilestone(null);
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Swimlanes */}
      <div className="space-y-4">
        {(Object.keys(SWIMLANE_LABELS) as Swimlane[]).map((swimlane) => {
          const swimlaneMilestones = getMilestonesBySwimLane(swimlane);
          const progress = getSwimlaneprogress(swimlane);
          const isExpanded = expandedSwimlanes.has(swimlane);

          return (
            <Card key={swimlane}>
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSwimlane(swimlane)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: SWIMLANE_COLORS[swimlane] }}
                  />
                  <div>
                    <h3 className="font-semibold">{SWIMLANE_LABELS[swimlane]}</h3>
                    <p className="text-sm text-muted-foreground">
                      {swimlaneMilestones.length} milestones
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {progress}%
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <CardContent className="pt-0">
                  {swimlaneMilestones.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No milestones yet. Add one to get started!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {swimlaneMilestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                            milestone.status === 'completed' && 'bg-green-500/5 border-green-500/20',
                            milestone.status === 'in_progress' && 'bg-blue-500/5 border-blue-500/20',
                            milestone.status === 'blocked' && 'bg-red-500/5 border-red-500/20',
                            selectedMilestone?.id === milestone.id && 'ring-2 ring-primary'
                          )}
                          onClick={() => setSelectedMilestone(milestone)}
                        >
                          {getStatusIcon(milestone.status)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{milestone.title}</h4>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          {milestone.target_date && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(milestone.target_date, 'MMM yyyy')}
                            </div>
                          )}
                          <Badge
                            variant={
                              milestone.status === 'completed'
                                ? 'success'
                                : milestone.status === 'in_progress'
                                ? 'info'
                                : milestone.status === 'blocked'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Milestone Detail Panel */}
      {selectedMilestone && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMilestone.title}</CardTitle>
                <CardDescription>{selectedMilestone.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditMilestone(selectedMilestone)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Actions */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Update Status</Label>
              <div className="flex gap-2">
                {(['pending', 'in_progress', 'completed', 'blocked'] as MilestoneStatus[]).map(
                  (status) => (
                    <Button
                      key={status}
                      variant={selectedMilestone.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedMilestone.id, status)}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Definition of Done */}
            {selectedMilestone.definition_of_done.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Definition of Done</Label>
                <ul className="space-y-2">
                  {selectedMilestone.definition_of_done.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {selectedMilestone.prerequisites.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Prerequisites</Label>
                <ul className="space-y-2">
                  {selectedMilestone.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {selectedMilestone.risks.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Risks</Label>
                <ul className="space-y-2">
                  {selectedMilestone.risks.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </DialogTitle>
            <DialogDescription>
              Define a key milestone on your journey.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Innovate UK Application"
                />
              </div>
              <div className="space-y-2">
                <Label>Swimlane</Label>
                <Select
                  value={formData.swimlane}
                  onValueChange={(v: Swimlane) => setFormData({ ...formData, swimlane: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SWIMLANE_LABELS) as Swimlane[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {SWIMLANE_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this milestone about?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: MilestoneStatus) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Definition of Done */}
            <div className="space-y-2">
              <Label>Definition of Done</Label>
              {formData.definition_of_done.map((item, i) => (
                <Input
                  key={i}
                  value={item}
                  onChange={(e) => updateArrayField('definition_of_done', i, e.target.value)}
                  placeholder="What must be true when this is done?"
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('definition_of_done')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Criteria
              </Button>
            </div>

            {/* Prerequisites */}
            <div className="space-y-2">
              <Label>Prerequisites</Label>
              {formData.prerequisites.map((item, i) => (
                <Input
                  key={i}
                  value={item}
                  onChange={(e) => updateArrayField('prerequisites', i, e.target.value)}
                  placeholder="What must happen before this?"
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('prerequisites')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Prerequisite
              </Button>
            </div>

            {/* Risks */}
            <div className="space-y-2">
              <Label>Risks</Label>
              {formData.risks.map((item, i) => (
                <Input
                  key={i}
                  value={item}
                  onChange={(e) => updateArrayField('risks', i, e.target.value)}
                  placeholder="What could go wrong?"
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayField('risks')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Risk
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone} disabled={!formData.title}>
              {editingMilestone ? 'Save Changes' : 'Create Milestone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
