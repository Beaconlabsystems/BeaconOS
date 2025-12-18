'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  MapPin,
  Pencil,
  Trash2,
  ChevronDown,
  User,
  Tag,
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

type ContactCategory = 'investor' | 'advisor' | 'partner' | 'customer' | 'other';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  category: ContactCategory;
  notes?: string;
  location?: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  investor: 'Investor',
  advisor: 'Advisor',
  partner: 'Partner',
  customer: 'Customer',
  other: 'Other',
};

const CATEGORY_COLORS: Record<ContactCategory, string> = {
  investor: 'bg-green-500/10 text-green-500',
  advisor: 'bg-blue-500/10 text-blue-500',
  partner: 'bg-purple-500/10 text-purple-500',
  customer: 'bg-orange-500/10 text-orange-500',
  other: 'bg-muted text-muted-foreground',
};

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@vcfund.com',
    phone: '+44 7700 900123',
    company: 'Horizon Ventures',
    role: 'Partner',
    category: 'investor',
    notes: 'Interested in B2B SaaS. Met at TechCrunch Disrupt.',
    location: 'London, UK',
    createdAt: '2025-11-15',
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'j.wilson@advisory.co',
    company: 'Wilson Advisory',
    role: 'CEO',
    category: 'advisor',
    notes: 'Former CTO at Deliveroo. Great for technical advice.',
    location: 'Cambridge, UK',
    createdAt: '2025-10-20',
  },
  {
    id: '3',
    name: 'Emily Torres',
    email: 'emily@bigcorp.com',
    phone: '+1 555 123 4567',
    company: 'BigCorp Inc',
    role: 'Head of Innovation',
    category: 'customer',
    notes: 'Running pilot program. Decision maker for enterprise deal.',
    location: 'New York, USA',
    createdAt: '2025-12-01',
  },
];

export default function ContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ContactCategory | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    category: 'other' as ContactCategory,
    notes: '',
    location: '',
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
    return groups;
  }, {} as Record<string, Contact[]>);

  const sortedLetters = Object.keys(groupedContacts).sort();

  const handleSave = () => {
    if (!formData.name) return;

    if (editingContact) {
      setContacts(contacts.map(c =>
        c.id === editingContact.id ? { ...c, ...formData } : c
      ));
      toast({ title: 'Contact updated' });
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        ...formData,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
      };
      setContacts([newContact, ...contacts]);
      toast({ title: 'Contact added' });
    }

    closeDialog();
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      role: contact.role || '',
      category: contact.category,
      notes: contact.notes || '',
      location: contact.location || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast({ title: 'Contact removed' });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      category: 'other',
      notes: '',
      location: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Rolodex</h1>
          <p className="text-muted-foreground mt-1">Your professional network</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={(v: ContactCategory | 'all') => setFilterCategory(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as ContactCategory[]).map(cat => (
              <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contact Count */}
      <div className="text-sm text-muted-foreground">
        {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery || filterCategory !== 'all'
              ? 'No contacts match your search.'
              : 'No contacts yet. Add your first contact to get started.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedLetters.map(letter => (
            <div key={letter}>
              <div className="text-sm font-semibold text-muted-foreground mb-2 pl-2">
                {letter}
              </div>
              <div className="space-y-2">
                {groupedContacts[letter].map(contact => (
                  <Card
                    key={contact.id}
                    className={cn(
                      'cursor-pointer transition-all',
                      expandedId === contact.id ? 'ring-1 ring-primary' : 'hover:bg-accent/30'
                    )}
                    onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-lg font-medium">
                            {contact.name[0]}
                          </div>
                          <div>
                            <h3 className="font-medium">{contact.name}</h3>
                            {contact.company && (
                              <p className="text-sm text-muted-foreground">
                                {contact.role && `${contact.role} at `}{contact.company}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={CATEGORY_COLORS[contact.category]}>
                            {CATEGORY_LABELS[contact.category]}
                          </Badge>
                          <ChevronDown className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            expandedId === contact.id && 'rotate-180'
                          )} />
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === contact.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${contact.email}`} className="hover:underline" onClick={e => e.stopPropagation()}>
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a href={`tel:${contact.phone}`} className="hover:underline" onClick={e => e.stopPropagation()}>
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{contact.location}</span>
                            </div>
                          )}
                          {contact.notes && (
                            <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                              {contact.notes}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleEdit(contact); }}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: ContactCategory) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as ContactCategory[]).map(cat => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 7700 123456"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="How you met, topics discussed, follow-up items..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingContact ? 'Save' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
