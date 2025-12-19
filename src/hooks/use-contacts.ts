'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Contact } from '@/lib/supabase/types';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    category: 'investor' | 'advisor' | 'partner' | 'customer' | 'other';
    notes?: string;
    location?: string;
  }) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (!response.ok) throw new Error('Failed to add contact');
      const newContact = await response.json();
      setContacts((prev) => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
      return newContact;
    } catch (err) {
      throw err;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update contact');
      const updated = await response.json();
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    contacts,
    loading,
    error,
    refresh: fetchContacts,
    addContact,
    updateContact,
    deleteContact,
  };
}
