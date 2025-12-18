'use client';

import { useState } from 'react';
import { Plus, BookOpen, ExternalLink, Trash2 } from 'lucide-react';
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

type ReadingStatus = 'reading' | 'completed' | 'to-read';

interface Book {
  id: string;
  title: string;
  author: string;
  status: ReadingStatus;
  notes?: string;
  link?: string;
}

const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Zero to One',
    author: 'Peter Thiel',
    status: 'reading',
    notes: 'Great insights on building monopolies and contrarian thinking.',
  },
  {
    id: '2',
    title: 'The Hard Thing About Hard Things',
    author: 'Ben Horowitz',
    status: 'completed',
    notes: 'Practical advice for startup founders. The wartime/peacetime CEO concept is very useful.',
  },
  {
    id: '3',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    status: 'to-read',
  },
];

const STATUS_LABELS: Record<ReadingStatus, string> = {
  'reading': 'Currently Reading',
  'completed': 'Completed',
  'to-read': 'To Read',
};

export default function ReadingPage() {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'to-read' as ReadingStatus,
    notes: '',
    link: '',
  });

  const filteredBooks = filter === 'all'
    ? books
    : books.filter(b => b.status === filter);

  const handleSave = () => {
    if (!formData.title || !formData.author) return;

    if (editingBook) {
      setBooks(books.map(b =>
        b.id === editingBook.id ? { ...b, ...formData } : b
      ));
      toast({ title: 'Book updated' });
    } else {
      const newBook: Book = {
        id: Date.now().toString(),
        title: formData.title,
        author: formData.author,
        status: formData.status,
        notes: formData.notes || undefined,
        link: formData.link || undefined,
      };
      setBooks([newBook, ...books]);
      toast({ title: 'Book added' });
    }

    closeDialog();
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      status: book.status,
      notes: book.notes || '',
      link: book.link || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBooks(books.filter(b => b.id !== id));
    toast({ title: 'Book removed' });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      status: 'to-read',
      notes: '',
      link: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reading Vault</h1>
          <p className="text-muted-foreground mt-1">Track books and capture notes</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'reading' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('reading')}
        >
          Reading
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={filter === 'to-read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('to-read')}
        >
          To Read
        </Button>
      </div>

      {/* Books List */}
      <div className="space-y-4">
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {filter === 'all' ? 'No books in your vault yet.' : `No ${STATUS_LABELS[filter as ReadingStatus].toLowerCase()} books.`}
            </CardContent>
          </Card>
        ) : (
          filteredBooks.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => handleEdit(book)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      {book.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {book.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{STATUS_LABELS[book.status]}</Badge>
                    {book.link && (
                      <a
                        href={book.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(book.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBook ? 'Edit Book' : 'Add Book'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Book title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ReadingStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-read">To Read</SelectItem>
                  <SelectItem value="reading">Currently Reading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Your thoughts, key takeaways..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title || !formData.author}
            >
              {editingBook ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
