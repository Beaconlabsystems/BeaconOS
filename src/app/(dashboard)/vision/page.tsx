'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';

interface VisionCard {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
}

// Mock data
const MOCK_CARDS: VisionCard[] = [
  {
    id: '1',
    title: 'Dream Home',
    caption: 'A beautiful house by the sea',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  },
  {
    id: '2',
    title: 'Travel the World',
    caption: 'Exploring new cultures',
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  },
  {
    id: '3',
    title: 'Financial Freedom',
    image_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
  },
];

export default function VisionBoardPage() {
  const { toast } = useToast();
  const [cards, setCards] = useState<VisionCard[]>(MOCK_CARDS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<VisionCard | null>(null);
  const [viewingCard, setViewingCard] = useState<VisionCard | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    image_url: '',
  });

  const handleSaveCard = () => {
    if (!formData.title || !formData.image_url) return;

    if (editingCard) {
      setCards(cards.map(c =>
        c.id === editingCard.id ? { ...c, ...formData } : c
      ));
      toast({ title: 'Card updated' });
    } else {
      const newCard: VisionCard = {
        id: Date.now().toString(),
        title: formData.title,
        caption: formData.caption || undefined,
        image_url: formData.image_url,
      };
      setCards([...cards, newCard]);
      toast({ title: 'Card added' });
    }

    closeDialog();
  };

  const handleEditCard = (card: VisionCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      caption: card.caption || '',
      image_url: card.image_url,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    toast({ title: 'Card removed' });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCard(null);
    setFormData({ title: '', caption: '', image_url: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vision Board</h1>
          <p className="text-muted-foreground mt-1">Visualize your goals</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Add images that represent your goals and aspirations.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setViewingCard(card)}
            >
              <Image
                src={card.image_url}
                alt={card.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium">{card.title}</h3>
                {card.caption && (
                  <p className="text-white/70 text-sm mt-0.5">{card.caption}</p>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCard(card);
                  }}
                  className="p-2 rounded-md bg-black/50 hover:bg-black/70"
                >
                  <Pencil className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="p-2 rounded-md bg-black/50 hover:bg-black/70"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Card Dialog */}
      {viewingCard && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setViewingCard(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
            onClick={() => setViewingCard(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl w-full aspect-video">
            <Image
              src={viewingCard.image_url}
              alt={viewingCard.title}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h2 className="text-2xl font-semibold text-white">{viewingCard.title}</h2>
            {viewingCard.caption && (
              <p className="text-white/70 mt-1">{viewingCard.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit Image' : 'Add Image'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Dream Home"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                placeholder="What does this represent?"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Paste a URL to an image
              </p>
            </div>

            {formData.image_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={formData.image_url}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => {}}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCard}
              disabled={!formData.title || !formData.image_url}
            >
              {editingCard ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
