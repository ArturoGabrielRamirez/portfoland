'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Images } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from '@/features/gallery/actions/galleryItemActions';
import type { GalleryItemModel } from '@/features/gallery/types/galleryItem';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';

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

export function DashboardGalleryView({ items, user }: DashboardGalleryViewProps) {
  const mc = modeClasses(user.portfolioMode);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemModel | undefined>();
  const [isPending, startTransition] = useTransition();

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('');
  const [published, setPublished] = useState(false);

  function openCreate() {
    setEditingItem(undefined);
    setImageUrl(''); setCaption(''); setAltText('');
    setCategory(''); setOrder(''); setPublished(false);
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

  function closeForm() { setShowForm(false); setEditingItem(undefined); }

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
      if (result.hasError) { toast.error(result.message); }
      else { toast.success(result.message); closeForm(); }
    });
  }

  function handleDelete(item: GalleryItemModel) {
    if (!confirm('Delete this gallery image? This cannot be undone.')) return;
    startTransition(async () => {
      const result = await deleteGalleryItemAction({ id: item.id });
      if (result.hasError) { toast.error(result.message); }
      else { toast.success(result.message); }
    });
  }

  return (
    <>
      {/* Header */}
      <div className={cn('px-6 py-6 flex items-center justify-between', mc.headerBorder)}>
        <h1 className={mc.heading}>Gallery</h1>
        <button onClick={openCreate} className={mc.primaryButton}>
          <Plus className="w-3.5 h-3.5" />
          Add Image
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <div className={cn(mc.card, 'p-6 mb-6')}>
            <h2 className={cn(mc.subHeading, 'mb-4')}>
              {editingItem ? 'Edit Image' : 'New Image'}
            </h2>
            <div className="grid gap-4">
              <div>
                <label className={cn(mc.label, 'mb-1 block')}>Image URL *</label>
                <input className={mc.input} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              {imageUrl && (
                <div className={cn('overflow-hidden w-48', mc.isTech ? 'rounded-sm border border-[hsl(174,100%,50%,0.15)]' : 'rounded-lg border border-gray-200')}>
                  <img src={imageUrl} alt={altText || 'Preview'} className="h-32 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <div>
                <label className={cn(mc.label, 'mb-1 block')}>Caption (optional)</label>
                <input className={mc.input} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Brand identity redesign" />
              </div>
              <div>
                <label className={cn(mc.label, 'mb-1 block')}>Alt Text (optional)</label>
                <input className={mc.input} value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image for accessibility" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn(mc.label, 'mb-1 block')}>Category (optional)</label>
                  <input className={mc.input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Branding" />
                </div>
                <div>
                  <label className={cn(mc.label, 'mb-1 block')}>Order (optional)</label>
                  <input type="number" className={mc.input} value={order} onChange={(e) => setOrder(e.target.value)} placeholder="1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="gal-published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="gal-published" className={mc.label}>Published (visible on portfolio)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={isPending || !imageUrl} className={cn(mc.saveButton, 'disabled:opacity-50')}>
                  {isPending ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Image'}
                </button>
                <button onClick={closeForm} className={mc.cancelButton}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Images className={cn('w-16 h-16 mx-auto mb-4', mc.isTech ? 'text-[hsl(174,100%,50%,0.3)]' : 'text-gray-300')} />
            <p className="text-muted-foreground mb-4">No gallery items yet</p>
            <button onClick={openCreate} className={cn(mc.primaryButton, 'mx-auto')}>
              <Plus className="w-4 h-4" />
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className={cn(mc.itemCard, 'hover:shadow-sm transition-shadow')}>
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img src={item.imageUrl} alt={item.altText ?? ''} className={cn('h-20 w-28 object-cover shrink-0', mc.isTech ? 'rounded-sm bg-[hsl(200,20%,13%)]' : 'rounded-lg bg-gray-100')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.caption && (
                        <span className={cn('text-sm font-medium', mc.isTech ? 'font-mono text-foreground' : 'text-gray-900')}>
                          {item.caption}
                        </span>
                      )}
                      {item.category && (
                        <span className={cn('text-[10px] px-2 py-0.5', mc.isTech ? 'font-mono border border-[hsl(174,100%,50%,0.2)] rounded-sm text-muted-foreground' : 'bg-gray-100 text-gray-500 rounded-full')}>
                          {item.category}
                        </span>
                      )}
                      <span className={mc.badge(item.published)}>
                        {item.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                    <p className={cn('text-[11px] mt-1 truncate', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-400')}>
                      {item.imageUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className={mc.editButton} title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item)} disabled={isPending} className={cn(mc.dangerButton, 'disabled:opacity-50')} title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
