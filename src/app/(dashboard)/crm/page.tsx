'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Linkedin,
  Calendar,
  Target,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/providers';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDate } from '@/lib/utils';
import type { CRMContact, ContactType, ContactStage, InvestmentStage } from '@/types';
import { CONTACT_STAGE_LABELS, INVESTMENT_STAGE_LABELS } from '@/types';

const STAGE_COLORS: Record<ContactStage, string> = {
  lead: 'bg-gray-500',
  contacted: 'bg-blue-500',
  meeting: 'bg-purple-500',
  due_diligence: 'bg-yellow-500',
  negotiation: 'bg-orange-500',
  closed: 'bg-green-500',
  passed: 'bg-red-500',
};

export default function CRMPage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<CRMContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<ContactStage | 'all'>('all');
  const [filterType, setFilterType] = useState<ContactType | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    email: '',
    phone: '',
    linkedin_url: '',
    contact_type: 'investor' as ContactType,
    stage: 'lead' as ContactStage,
    investment_stage: '' as InvestmentStage | '',
    next_action: '',
    next_action_date: '',
    notes: '',
    is_warm: false,
  });

  useEffect(() => {
    if (appUser) {
      fetchContacts();
    }
  }, [appUser]);

  useEffect(() => {
    let filtered = contacts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }

    if (filterStage !== 'all') {
      filtered = filtered.filter((c) => c.stage === filterStage);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((c) => c.contact_type === filterType);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, filterStage, filterType]);

  const fetchContacts = async () => {
    if (!appUser) return;

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('user_id', appUser.id)
      .order('priority', { ascending: false });

    setContacts((data || []) as CRMContact[]);
    setLoading(false);
  };

  const handleSaveContact = async () => {
    if (!appUser || !formData.name) return;

    const supabase = createClient();

    const contactData = {
      name: formData.name,
      company: formData.company || null,
      role: formData.role || null,
      email: formData.email || null,
      phone: formData.phone || null,
      linkedin_url: formData.linkedin_url || null,
      contact_type: formData.contact_type,
      stage: formData.stage,
      investment_stage: formData.investment_stage || null,
      next_action: formData.next_action || null,
      next_action_date: formData.next_action_date || null,
      notes: formData.notes || null,
      is_warm: formData.is_warm,
    };

    try {
      if (editingContact) {
        await supabase
          .from('crm_contacts')
          .update(contactData)
          .eq('id', editingContact.id);
        toast({ title: 'Contact updated' });
      } else {
        await supabase.from('crm_contacts').insert({
          ...contactData,
          user_id: appUser.id,
        });
        toast({ title: 'Contact added' });
      }

      setIsDialogOpen(false);
      setEditingContact(null);
      resetForm();
      fetchContacts();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error saving contact' });
    }
  };

  const handleDeleteContact = async (id: string) => {
    const supabase = createClient();
    await supabase.from('crm_contacts').delete().eq('id', id);
    toast({ title: 'Contact deleted' });
    setSelectedContact(null);
    fetchContacts();
  };

  const handleUpdateStage = async (id: string, stage: ContactStage) => {
    const supabase = createClient();
    const update: any = { stage };
    if (stage === 'contacted') {
      update.last_contact_date = new Date().toISOString().split('T')[0];
    }
    await supabase.from('crm_contacts').update(update).eq('id', id);
    fetchContacts();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      role: '',
      email: '',
      phone: '',
      linkedin_url: '',
      contact_type: 'investor',
      stage: 'lead',
      investment_stage: '',
      next_action: '',
      next_action_date: '',
      notes: '',
      is_warm: false,
    });
  };

  const openEditDialog = (contact: CRMContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      company: contact.company || '',
      role: contact.role || '',
      email: contact.email || '',
      phone: contact.phone || '',
      linkedin_url: contact.linkedin_url || '',
      contact_type: contact.contact_type,
      stage: contact.stage || 'lead',
      investment_stage: contact.investment_stage || '',
      next_action: contact.next_action || '',
      next_action_date: contact.next_action_date || '',
      notes: contact.notes || '',
      is_warm: contact.is_warm,
    });
    setIsDialogOpen(true);
  };

  // Group contacts by stage for pipeline view
  const contactsByStage = Object.keys(CONTACT_STAGE_LABELS).reduce((acc, stage) => {
    acc[stage as ContactStage] = filteredContacts.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<ContactStage, CRMContact[]>);

  // Stats
  const stats = {
    total: contacts.length,
    warm: contacts.filter((c) => c.is_warm).length,
    investors: contacts.filter((c) => c.contact_type === 'investor').length,
    needsFollowUp: contacts.filter((c) => c.next_action_date && new Date(c.next_action_date) <= new Date()).length,
  };

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
          <h1 className="text-3xl font-bold">Investor CRM</h1>
          <p className="text-muted-foreground mt-1">
            Manage your investor and partner relationships
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingContact(null);
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.warm}</div>
            <p className="text-sm text-muted-foreground">Warm Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{stats.investors}</div>
            <p className="text-sm text-muted-foreground">Investors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-500">{stats.needsFollowUp}</div>
            <p className="text-sm text-muted-foreground">Need Follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={(v) => setFilterStage(v as ContactStage | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {(Object.keys(CONTACT_STAGE_LABELS) as ContactStage[]).map((stage) => (
              <SelectItem key={stage} value={stage}>
                {CONTACT_STAGE_LABELS[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as ContactType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="advisor">Advisor</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline">
          <div className="grid grid-cols-7 gap-2 overflow-x-auto">
            {(Object.keys(CONTACT_STAGE_LABELS) as ContactStage[]).map((stage) => (
              <div key={stage} className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('h-3 w-3 rounded-full', STAGE_COLORS[stage])} />
                  <span className="font-medium text-sm">{CONTACT_STAGE_LABELS[stage]}</span>
                  <Badge variant="secondary" className="text-xs">
                    {contactsByStage[stage]?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {contactsByStage[stage]?.map((contact) => (
                    <Card
                      key={contact.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <CardContent className="p-3">
                        <div className="font-medium text-sm truncate">{contact.name}</div>
                        {contact.company && (
                          <div className="text-xs text-muted-foreground truncate">
                            {contact.company}
                          </div>
                        )}
                        {contact.investment_stage && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {INVESTMENT_STAGE_LABELS[contact.investment_stage]}
                          </Badge>
                        )}
                        {contact.is_warm && (
                          <Badge variant="success" className="mt-2 ml-1 text-xs">
                            Warm
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Company</th>
                    <th className="text-left p-4 font-medium">Stage</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Next Action</th>
                    <th className="text-left p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {contact.is_warm && (
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          )}
                          <span className="font-medium">{contact.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{contact.company || '-'}</td>
                      <td className="p-4">
                        {contact.stage && (
                          <Badge variant="secondary">{CONTACT_STAGE_LABELS[contact.stage]}</Badge>
                        )}
                      </td>
                      <td className="p-4 capitalize">{contact.contact_type}</td>
                      <td className="p-4 text-sm">
                        {contact.next_action && (
                          <div>
                            <p className="truncate max-w-[200px]">{contact.next_action}</p>
                            {contact.next_action_date && (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(contact.next_action_date, 'MMM d')}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(contact); }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {contact.email && (
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Email
                                </a>
                              </DropdownMenuItem>
                            )}
                            {contact.linkedin_url && (
                              <DropdownMenuItem asChild>
                                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                  <Linkedin className="h-4 w-4 mr-2" />
                                  LinkedIn
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No contacts found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Detail Panel */}
      {selectedContact && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedContact.name}
                  {selectedContact.is_warm && (
                    <Badge variant="success">Warm</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedContact.role && selectedContact.company
                    ? `${selectedContact.role} at ${selectedContact.company}`
                    : selectedContact.company || selectedContact.role || 'No company info'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedContact)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedContact(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Info */}
            <div className="flex gap-6 flex-wrap">
              {selectedContact.email && (
                <a href={`mailto:${selectedContact.email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Mail className="h-4 w-4" />
                  {selectedContact.email}
                </a>
              )}
              {selectedContact.phone && (
                <a href={`tel:${selectedContact.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Phone className="h-4 w-4" />
                  {selectedContact.phone}
                </a>
              )}
              {selectedContact.linkedin_url && (
                <a href={selectedContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Stage Update */}
            <div>
              <Label className="mb-2 block">Update Stage</Label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(CONTACT_STAGE_LABELS) as ContactStage[]).map((stage) => (
                  <Button
                    key={stage}
                    variant={selectedContact.stage === stage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStage(selectedContact.id, stage)}
                  >
                    {CONTACT_STAGE_LABELS[stage]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Next Action */}
            {selectedContact.next_action && (
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-xs text-muted-foreground">Next Action</Label>
                <p className="font-medium">{selectedContact.next_action}</p>
                {selectedContact.next_action_date && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Due: {formatDate(selectedContact.next_action_date, 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {selectedContact.notes && (
              <div>
                <Label className="mb-2 block">Notes</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedContact.notes}</p>
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
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Ventures"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Partner"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 7700 900000"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Contact Type</Label>
                <Select
                  value={formData.contact_type}
                  onValueChange={(v: ContactType) => setFormData({ ...formData, contact_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="advisor">Advisor</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(v: ContactStage) => setFormData({ ...formData, stage: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CONTACT_STAGE_LABELS) as ContactStage[]).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {CONTACT_STAGE_LABELS[stage]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Investment Stage</Label>
                <Select
                  value={formData.investment_stage}
                  onValueChange={(v: InvestmentStage) => setFormData({ ...formData, investment_stage: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {(Object.keys(INVESTMENT_STAGE_LABELS) as InvestmentStage[]).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {INVESTMENT_STAGE_LABELS[stage]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Action</Label>
                <Input
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  placeholder="Follow up on email"
                />
              </div>
              <div className="space-y-2">
                <Label>Next Action Date</Label>
                <Input
                  type="date"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this contact..."
                rows={4}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_warm}
                onChange={(e) => setFormData({ ...formData, is_warm: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm">Mark as warm lead</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact} disabled={!formData.name}>
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
