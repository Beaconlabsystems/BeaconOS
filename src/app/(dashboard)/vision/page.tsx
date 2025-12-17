'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Sparkles,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
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
import { useToast } from '@/hooks/use-toast';
import type { VisionCard, VisionCategory } from '@/types';
import { cn } from '@/lib/utils';

interface SortableCardProps {
  card: VisionCard;
  onEdit: (card: VisionCard) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

function SortableCard({ card, onEdit, onDelete, onToggleVisibility }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-video rounded-xl overflow-hidden shadow-lg transition-all duration-300',
        isDragging && 'opacity-50 scale-105 z-50',
        !card.is_visible && 'opacity-50'
      )}
    >
      <Image
        src={card.image_url}
        alt={card.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-white">{card.title}</h3>
        {card.caption && (
          <p className="text-sm text-white/80 mt-1 line-clamp-2">{card.caption}</p>
        )}
      </div>

      {/* Drag Handle & Actions */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="p-2 rounded-lg bg-black/50 hover:bg-black/70 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility(card.id, !card.is_visible)}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70"
          >
            {card.is_visible ? (
              <Eye className="h-4 w-4 text-white" />
            ) : (
              <EyeOff className="h-4 w-4 text-white" />
            )}
          </button>
          <button
            onClick={() => onEdit(card)}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70"
          >
            <Pencil className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="p-2 rounded-lg bg-black/50 hover:bg-red-500/70"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock data for demo
const MOCK_CARDS: VisionCard[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'Dream Home',
    caption: 'A beautiful house by the beach',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    category: 'property',
    position: 0,
    is_visible: true,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Travel the World',
    caption: 'Exploring new cultures and places',
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    category: 'travel',
    position: 1,
    is_visible: true,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'Financial Freedom',
    caption: 'Building wealth and security',
    image_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    category: 'lifestyle',
    position: 2,
    is_visible: true,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function VisionBoardPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<VisionCard[]>(MOCK_CARDS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<VisionCard | null>(null);
  const [motivationMode, setMotivationMode] = useState(false);
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    image_url: '',
    category: 'lifestyle' as VisionCategory,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchParams.get('mode') === 'motivation') {
      setMotivationMode(true);
      // Auto-close after 10 seconds
      const timer = setTimeout(() => setMotivationMode(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Compute visible cards for motivation mode
  const visibleCards = cards.filter((c) => c.is_visible);

  // Carousel effect for motivation mode
  useEffect(() => {
    if (motivationMode && visibleCards.length > 1) {
      const interval = setInterval(() => {
        setMotivationIndex((prev) => (prev + 1) % visibleCards.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [motivationMode, visibleCards.length]);


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);

      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
      toast({ title: 'Card reordered' });
    }
  };

  const handleSaveCard = () => {
    if (!formData.title || !formData.image_url) return;

    if (editingCard) {
      // Update existing card
      setCards(cards.map(c =>
        c.id === editingCard.id
          ? { ...c, ...formData }
          : c
      ));
      toast({ title: 'Card updated' });
    } else {
      // Create new card
      const newCard: VisionCard = {
        id: Date.now().toString(),
        user_id: 'demo',
        title: formData.title,
        caption: formData.caption,
        image_url: formData.image_url,
        category: formData.category,
        position: cards.length,
        is_visible: true,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCards([...cards, newCard]);
      toast({ title: 'Card added' });
    }

    setIsDialogOpen(false);
    setEditingCard(null);
    setFormData({ title: '', caption: '', image_url: '', category: 'lifestyle' });
  };

  const handleEditCard = (card: VisionCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      caption: card.caption || '',
      image_url: card.image_url,
      category: card.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    toast({ title: 'Card deleted' });
  };

  const handleToggleVisibility = (id: string, visible: boolean) => {
    setCards(cards.map(c =>
      c.id === id ? { ...c, is_visible: visible } : c
    ));
  };

  // Motivation Mode Overlay
  if (motivationMode) {
    const safeIndex = visibleCards.length > 0 ? motivationIndex % visibleCards.length : 0;
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
        onClick={() => setMotivationMode(false)}
      >
        {visibleCards.length > 0 && (
          <div className="relative w-full h-full animate-fade-in">
            <Image
              src={visibleCards[safeIndex].image_url}
              alt={visibleCards[safeIndex].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            <div className="absolute bottom-20 left-0 right-0 text-center animate-slide-in-bottom">
              <h2 className="text-5xl font-bold text-white mb-4">
                {visibleCards[safeIndex].title}
              </h2>
              {visibleCards[safeIndex].caption && (
                <p className="text-2xl text-white/80">
                  {visibleCards[safeIndex].caption}
                </p>
              )}
            </div>
            <div className="absolute top-8 right-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMotivationMode(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-video bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vision Board</h1>
          <p className="text-muted-foreground mt-1">
            Visualize your goals and aspirations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setMotivationMode(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Motivation Mode
          </Button>
          <Button
            onClick={() => {
              setEditingCard(null);
              setFormData({ title: '', caption: '', image_url: '', category: 'lifestyle' });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Vision Cards Grid */}
      {cards.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Your Vision Board</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add images that represent your goals and dreams. Drag to reorder them.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Card
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit Vision Card' : 'Add Vision Card'}
            </DialogTitle>
            <DialogDescription>
              Add an image that represents one of your goals or aspirations.
            </DialogDescription>
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
                placeholder="What does this represent to you?"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
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
                Enter a URL to an image, or use Unsplash: https://source.unsplash.com/1600x900/?keyword
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: VisionCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCard}
              disabled={!formData.title || !formData.image_url}
            >
              {editingCard ? 'Save Changes' : 'Add Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
