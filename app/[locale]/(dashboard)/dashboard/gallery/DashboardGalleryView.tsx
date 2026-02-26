'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Images } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DashboardNav } from '@/features/tech';
import {
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from '@/features/gallery/actions/galleryItemActions';
import type { GalleryItemModel } from '@/features/gallery/types/galleryItem';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

interface DashboardGalleryViewProps {
  items: GalleryItemModel[];
  user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    image: string | null;
    portfolioMode: PortfolioMode;
  };
}

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none transition-all';

export function DashboardGalleryView({ items, user }: DashboardGalleryViewProps) {
  const params = useParams();
  const locale = params.locale as string;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemModel | undefined>();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('');
  const [published, setPublished] = useState(false);

  function openCreate() {
    setEditingItem(undefined);
    setImageUrl('');
    setCaption('');
    setAltText('');
    setCategory('');
    setOrder('');
    setPublished(false);
    setShowForm(true);
  }

  function openEdit(item: GalleryItemModel) {
    setEditingItem(item);
    setImageUrl(item.imageUrl);
    setCaption(item.caption ?? '');
    setAltText(item.altText ?? '');
    setCategory(item.category ?? '');
    setOrder(item.order?.toString() ?? '');
    setPublished(item.published);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(undefined);
  }

  function handleSave() {
    const payload = {
      imageUrl,
      caption: caption || null,
      altText: altText || null,
      category: category || null,
      order: order ? parseInt(order, 10) : undefined,
      published,
    };

    startTransition(async () => {
      const result = editingItem
        ? await updateGalleryItemAction({ id: editingItem.id, ...payload })
        : await createGalleryItemAction(payload);

      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        closeForm();
      }
    });
  }

  function handleDelete(item: GalleryItemModel) {
    if (!confirm(`Delete this gallery image? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteGalleryItemAction({ id: item.id });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      <DashboardNav locale={locale} user={user} />

      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <h1 className="text-2xl font-mono font-bold text-foreground">Gallery</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Image
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Inline form */}
        {showForm && (
          <div className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-6 mb-6">
            <h2 className="text-sm font-mono font-bold text-foreground uppercase tracking-widest mb-4">
              {editingItem ? 'Edit Image' : 'New Image'}
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Image URL *</label>
                <input
                  className={INPUT_CLASS}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {imageUrl && (
                <div className="rounded-sm overflow-hidden border border-[hsl(174,100%,50%,0.15)] w-48">
                  <img
                    src={imageUrl}
                    alt={altText || 'Preview'}
                    className="h-32 w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Caption (optional)</label>
                <input
                  className={INPUT_CLASS}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Brand identity redesign"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Alt Text (optional)</label>
                <input
                  className={INPUT_CLASS}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Category (optional)</label>
                  <input
                    className={INPUT_CLASS}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Branding"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Order (optional)</label>
                  <input
                    type="number"
                    className={INPUT_CLASS}
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="gal-published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="accent-[#00D4FF] w-4 h-4"
                />
                <label htmlFor="gal-published" className="text-xs font-mono text-muted-foreground">
                  Published (visible on portfolio)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isPending || !imageUrl}
                  className="bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Image'}
                </button>
                <button
                  onClick={closeForm}
                  className="px-3 py-1.5 text-xs font-mono text-muted-foreground border border-[hsl(174,100%,50%,0.15)] hover:border-[hsl(174,100%,50%,0.3)] transition-colors rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Images className="w-16 h-16 text-[hsl(174,100%,50%,0.3)] mx-auto mb-4" />
            <p className="text-muted-foreground font-mono mb-4">No gallery items yet</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-4 py-2 text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-4 hover:border-[hsl(174,100%,50%,0.3)] transition-all"
              >
                <div className="flex items-start gap-4 justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.altText ?? ''}
                      className="h-20 w-28 object-cover rounded-sm shrink-0 bg-[hsl(200,20%,13%)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.caption && (
                          <span className="font-mono text-sm text-foreground">{item.caption}</span>
                        )}
                        {item.category && (
                          <span className="text-[10px] font-mono px-2 py-0.5 border border-[hsl(174,100%,50%,0.2)] rounded-sm text-muted-foreground">
                            {item.category}
                          </span>
                        )}
                        {item.published ? (
                          <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                            Live
                          </span>
                        ) : (
                          <span className="text-[#64748B] bg-[#64748B]/10 text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate">
                        {item.imageUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 text-muted-foreground hover:text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)] rounded-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isPending}
                      className="p-2 text-muted-foreground hover:text-[hsl(0,100%,60%)] hover:bg-[hsl(0,100%,60%,0.1)] rounded-sm transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
