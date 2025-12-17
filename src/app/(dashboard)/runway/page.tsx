'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Calculator,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  Copy,
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
import { useAuth } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency, formatDate, calculateRunwayMonths, getZeroCashDate } from '@/lib/utils';
import type { Scenario, FinancialEvent, RevenueEvent } from '@/types';
import { format, addMonths } from 'date-fns';

export default function RunwayPage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_baseline: false,
    current_cash: 0,
    monthly_burn: 0,
    expected_grants: [] as FinancialEvent[],
    expected_investments: [] as FinancialEvent[],
    expected_revenue: [] as RevenueEvent[],
  });

  useEffect(() => {
    if (appUser) {
      fetchScenarios();
    }
  }, [appUser]);

  const fetchScenarios = async () => {
    if (!appUser) return;

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false });

    const scenarioList = (data || []) as Scenario[];
    setScenarios(scenarioList);

    // Select baseline or first scenario
    const baseline = scenarioList.find((s) => s.is_baseline);
    setSelectedScenario(baseline || scenarioList[0] || null);

    setLoading(false);
  };

  const handleSaveScenario = async () => {
    if (!appUser || !formData.name) return;

    const supabase = createClient();

    // Calculate runway
    const runwayMonths = calculateRunwayMonths(formData.current_cash, formData.monthly_burn);
    const zeroCashDate = getZeroCashDate(formData.current_cash, formData.monthly_burn);

    const scenarioData = {
      name: formData.name,
      description: formData.description || null,
      is_baseline: formData.is_baseline,
      current_cash: formData.current_cash,
      monthly_burn: formData.monthly_burn,
      expected_grants: formData.expected_grants,
      expected_investments: formData.expected_investments,
      expected_revenue: formData.expected_revenue,
      runway_months: runwayMonths === Infinity ? null : runwayMonths,
      zero_cash_date: zeroCashDate?.toISOString().split('T')[0] || null,
    };

    try {
      if (editingScenario) {
        await supabase
          .from('scenarios')
          .update(scenarioData)
          .eq('id', editingScenario.id);
        toast({ title: 'Scenario updated' });
      } else {
        await supabase.from('scenarios').insert({
          ...scenarioData,
          user_id: appUser.id,
        });
        toast({ title: 'Scenario created' });
      }

      setIsDialogOpen(false);
      setEditingScenario(null);
      resetForm();
      fetchScenarios();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error saving scenario' });
    }
  };

  const handleDeleteScenario = async (id: string) => {
    const supabase = createClient();
    await supabase.from('scenarios').delete().eq('id', id);
    toast({ title: 'Scenario deleted' });
    fetchScenarios();
  };

  const handleDuplicateScenario = async (scenario: Scenario) => {
    if (!appUser) return;

    const supabase = createClient();
    await supabase.from('scenarios').insert({
      user_id: appUser.id,
      name: `${scenario.name} (Copy)`,
      description: scenario.description,
      is_baseline: false,
      current_cash: scenario.current_cash,
      monthly_burn: scenario.monthly_burn,
      expected_grants: scenario.expected_grants,
      expected_investments: scenario.expected_investments,
      expected_revenue: scenario.expected_revenue,
      runway_months: scenario.runway_months,
      zero_cash_date: scenario.zero_cash_date,
    });
    toast({ title: 'Scenario duplicated' });
    fetchScenarios();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_baseline: false,
      current_cash: 0,
      monthly_burn: 0,
      expected_grants: [],
      expected_investments: [],
      expected_revenue: [],
    });
  };

  const openEditDialog = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      description: scenario.description || '',
      is_baseline: scenario.is_baseline,
      current_cash: scenario.current_cash,
      monthly_burn: scenario.monthly_burn,
      expected_grants: scenario.expected_grants || [],
      expected_investments: scenario.expected_investments || [],
      expected_revenue: scenario.expected_revenue || [],
    });
    setIsDialogOpen(true);
  };

  const addFinancialEvent = (type: 'grants' | 'investments') => {
    const key = type === 'grants' ? 'expected_grants' : 'expected_investments';
    setFormData({
      ...formData,
      [key]: [
        ...formData[key],
        {
          name: '',
          amount: 0,
          probability: 50,
          expected_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
        },
      ],
    });
  };

  const updateFinancialEvent = (
    type: 'grants' | 'investments',
    index: number,
    field: keyof FinancialEvent,
    value: string | number
  ) => {
    const key = type === 'grants' ? 'expected_grants' : 'expected_investments';
    const events = [...formData[key]];
    events[index] = { ...events[index], [field]: value };
    setFormData({ ...formData, [key]: events });
  };

  const removeFinancialEvent = (type: 'grants' | 'investments', index: number) => {
    const key = type === 'grants' ? 'expected_grants' : 'expected_investments';
    setFormData({
      ...formData,
      [key]: formData[key].filter((_, i) => i !== index),
    });
  };

  // Calculate projections for selected scenario
  const getProjection = (scenario: Scenario) => {
    const months = [];
    let cash = scenario.current_cash;
    const today = new Date();

    for (let i = 0; i < 24; i++) {
      const date = addMonths(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      // Apply burn
      cash -= scenario.monthly_burn;

      // Check for grants/investments
      scenario.expected_grants?.forEach((g) => {
        if (g.expected_date && g.expected_date.startsWith(format(date, 'yyyy-MM'))) {
          cash += g.amount * (g.probability / 100);
        }
      });
      scenario.expected_investments?.forEach((inv) => {
        if (inv.expected_date && inv.expected_date.startsWith(format(date, 'yyyy-MM'))) {
          cash += inv.amount * (inv.probability / 100);
        }
      });

      months.push({
        date: format(date, 'MMM yyyy'),
        cash: Math.max(0, cash),
        isZero: cash <= 0,
      });

      if (cash <= 0) break;
    }

    return months;
  };

  const projection = selectedScenario ? getProjection(selectedScenario) : [];
  const maxCash = Math.max(...projection.map((p) => p.cash), selectedScenario?.current_cash || 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Runway Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Model your financial scenarios and runway
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingScenario(null);
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Scenario
        </Button>
      </div>

      {/* Scenario Tabs */}
      {scenarios.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {scenarios.map((scenario) => (
            <Button
              key={scenario.id}
              variant={selectedScenario?.id === scenario.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedScenario(scenario)}
              className="shrink-0"
            >
              {scenario.name}
              {scenario.is_baseline && (
                <Badge variant="secondary" className="ml-2">
                  Baseline
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {selectedScenario ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={selectedScenario.runway_months && selectedScenario.runway_months < 6 ? 'border-destructive/50' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Runway</span>
                </div>
                <div className={cn(
                  'text-3xl font-bold',
                  selectedScenario.runway_months && selectedScenario.runway_months < 6 && 'text-destructive'
                )}>
                  {selectedScenario.runway_months || '∞'} months
                </div>
                {selectedScenario.zero_cash_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Zero by {formatDate(selectedScenario.zero_cash_date, 'MMM yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Current Cash</span>
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {formatCurrency(selectedScenario.current_cash)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Monthly Burn</span>
                </div>
                <div className="text-3xl font-bold text-red-500">
                  {formatCurrency(selectedScenario.monthly_burn)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Expected Inflows</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">
                  {formatCurrency(
                    (selectedScenario.expected_grants || []).reduce(
                      (acc, g) => acc + g.amount * (g.probability / 100),
                      0
                    ) +
                    (selectedScenario.expected_investments || []).reduce(
                      (acc, i) => acc + i.amount * (i.probability / 100),
                      0
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">probability-weighted</p>
              </CardContent>
            </Card>
          </div>

          {/* Cash Projection Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cash Projection</CardTitle>
                  <CardDescription>24-month runway forecast</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateScenario(selectedScenario)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(selectedScenario)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteScenario(selectedScenario.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-1">
                {projection.map((month, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className={cn(
                        'w-full rounded-t transition-all',
                        month.isZero ? 'bg-destructive/50' : 'bg-primary/50'
                      )}
                      style={{
                        height: `${(month.cash / maxCash) * 100}%`,
                        minHeight: month.cash > 0 ? '4px' : '0',
                      }}
                    />
                    {index % 3 === 0 && (
                      <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-left">
                        {month.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expected Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expected Grants</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedScenario.expected_grants && selectedScenario.expected_grants.length > 0 ? (
                  <div className="space-y-3">
                    {selectedScenario.expected_grants.map((grant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{grant.name || 'Unnamed Grant'}</p>
                          <p className="text-sm text-muted-foreground">
                            {grant.expected_date ? formatDate(grant.expected_date, 'MMM yyyy') : 'TBD'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">{formatCurrency(grant.amount)}</p>
                          <p className="text-xs text-muted-foreground">{grant.probability}% likely</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No grants configured</p>
                )}
              </CardContent>
            </Card>

            {/* Investments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expected Investments</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedScenario.expected_investments && selectedScenario.expected_investments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedScenario.expected_investments.map((inv, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{inv.name || 'Unnamed Investment'}</p>
                          <p className="text-sm text-muted-foreground">
                            {inv.expected_date ? formatDate(inv.expected_date, 'MMM yyyy') : 'TBD'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-500">{formatCurrency(inv.amount)}</p>
                          <p className="text-xs text-muted-foreground">{inv.probability}% likely</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No investments configured</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scenarios Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first scenario to model your runway
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Scenario
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScenario ? 'Edit Scenario' : 'Create Scenario'}
            </DialogTitle>
            <DialogDescription>
              Model your financial future with different assumptions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scenario Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Conservative Path"
                />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_baseline}
                    onChange={(e) => setFormData({ ...formData, is_baseline: e.target.checked })}
                    className="rounded border-input"
                  />
                  <span className="text-sm">Set as baseline scenario</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key assumptions for this scenario..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Cash (£)</Label>
                <Input
                  type="number"
                  value={formData.current_cash}
                  onChange={(e) => setFormData({ ...formData, current_cash: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Burn (£)</Label>
                <Input
                  type="number"
                  value={formData.monthly_burn}
                  onChange={(e) => setFormData({ ...formData, monthly_burn: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Grants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Expected Grants</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addFinancialEvent('grants')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {formData.expected_grants.map((grant, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/50">
                  <Input
                    placeholder="Name"
                    value={grant.name}
                    onChange={(e) => updateFinancialEvent('grants', index, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={grant.amount}
                    onChange={(e) => updateFinancialEvent('grants', index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    type="date"
                    value={grant.expected_date}
                    onChange={(e) => updateFinancialEvent('grants', index, 'expected_date', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="%"
                      value={grant.probability}
                      onChange={(e) => updateFinancialEvent('grants', index, 'probability', parseFloat(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFinancialEvent('grants', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Investments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Expected Investments</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addFinancialEvent('investments')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {formData.expected_investments.map((inv, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/50">
                  <Input
                    placeholder="Name"
                    value={inv.name}
                    onChange={(e) => updateFinancialEvent('investments', index, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={inv.amount}
                    onChange={(e) => updateFinancialEvent('investments', index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    type="date"
                    value={inv.expected_date}
                    onChange={(e) => updateFinancialEvent('investments', index, 'expected_date', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="%"
                      value={inv.probability}
                      onChange={(e) => updateFinancialEvent('investments', index, 'probability', parseFloat(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFinancialEvent('investments', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveScenario} disabled={!formData.name}>
              {editingScenario ? 'Save Changes' : 'Create Scenario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
