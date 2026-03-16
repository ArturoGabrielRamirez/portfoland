'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from '@/features/testimonials/actions/testimonialActions';
import type { TestimonialModel } from '@/features/testimonials/types/testimonial';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';

interface TestimonialsSectionProps {
  testimonials: TestimonialModel[];
  portfolioMode: PortfolioMode;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? 'text-amber-400' : 'text-gray-400'}>★</span>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className={cn('text-xl transition-colors', i <= value ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300')}>
          {i <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

export function TestimonialsSection({ testimonials, portfolioMode }: TestimonialsSectionProps) {
  const mc = modeClasses(portfolioMode);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialModel | undefined>();
  const [isPending, startTransition] = useTransition();

  const [clientName, setClientName] = useState('');
  const [clientTitle, setClientTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [published, setPublished] = useState(false);

  function openCreate() {
    setEditingTestimonial(undefined);
    setClientName(''); setClientTitle(''); setContent('');
    setRating(5); setPublished(false);
    setShowForm(true);
  }

  function openEdit(t: TestimonialModel) {
    setEditingTestimonial(t);
    setClientName(t.clientName);
    setClientTitle(t.clientTitle ?? '');
    setContent(t.content);
    setRating(t.rating);
    setPublished(t.published);
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditingTestimonial(undefined); }

  function handleSave() {
    startTransition(async () => {
      const payload = { clientName, clientTitle: clientTitle || null, content, rating, published };
      const result = editingTestimonial
        ? await updateTestimonialAction({ id: editingTestimonial.id, ...payload })
        : await createTestimonialAction(payload);
      if (result.hasError) { toast.error(result.message); }
      else { toast.success(result.message); closeForm(); }
    });
  }

  function handleDelete(t: TestimonialModel) {
    if (!confirm(`Delete testimonial from "${t.clientName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteTestimonialAction({ id: t.id });
      if (result.hasError) { toast.error(result.message); }
      else { toast.success(result.message); }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={cn('text-sm font-semibold', mc.isTech ? 'font-mono text-foreground' : 'text-gray-900')}>Testimonials</h3>
        <button onClick={openCreate} className={mc.primaryButton}>
          <Plus className="w-3.5 h-3.5" /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className={cn(mc.card, 'p-4')}>
          <h4 className={cn(mc.subHeading, 'mb-3')}>{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}</h4>
          <div className="grid gap-3">
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Client Name *</label>
              <input className={mc.input} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Client Title (optional)</label>
              <input className={mc.input} value={clientTitle} onChange={(e) => setClientTitle(e.target.value)} placeholder="e.g. CEO at Acme Corp" />
            </div>
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Testimonial *</label>
              <textarea className={cn(mc.input, 'resize-y min-h-[100px]')} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did they say about your work?" />
            </div>
            <div>
              <label className={cn(mc.label, 'mb-2 block')}>Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="tst-pub" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="tst-pub" className={mc.label}>Published (visible on portfolio)</label>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={isPending || !clientName || !content} className={cn(mc.saveButton, 'disabled:opacity-50')}>
                {isPending ? 'Saving…' : editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
              </button>
              <button onClick={closeForm} className={mc.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {testimonials.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <MessageSquare className={cn('w-10 h-10 mx-auto mb-3', mc.isTech ? 'text-[hsl(174,100%,50%,0.3)]' : 'text-gray-300')} />
          <p className={cn('text-sm mb-3', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>No testimonials yet</p>
          <button onClick={openCreate} className={cn(mc.primaryButton, 'mx-auto')}><Plus className="w-4 h-4" /> Add First Testimonial</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {testimonials.map((t) => (
            <div key={t.id} className={cn(mc.itemCard, 'hover:shadow-sm transition-shadow')}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={cn('font-semibold text-sm', mc.isTech ? 'font-mono text-foreground' : 'text-gray-900')}>{t.clientName}</span>
                  {t.clientTitle && <span className={cn('text-xs', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{t.clientTitle}</span>}
                  <span className={mc.badge(t.published)}>{t.published ? 'Live' : 'Draft'}</span>
                </div>
                <StarDisplay rating={t.rating} />
                <p className={cn('text-xs mt-2 line-clamp-2', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{t.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(t)} className={mc.editButton} title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t)} disabled={isPending} className={cn(mc.dangerButton, 'disabled:opacity-50')} title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
