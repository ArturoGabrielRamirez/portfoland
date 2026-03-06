'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from '@/features/testimonials/actions/testimonialActions';
import type { TestimonialModel } from '@/features/testimonials/types/testimonial';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

interface DashboardTestimonialsViewProps {
  testimonials: TestimonialModel[];
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

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? 'text-amber-400' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={cn(
            'text-xl transition-colors',
            i <= value ? 'text-amber-400' : 'text-gray-600 hover:text-amber-300'
          )}
        >
          {i <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

export function DashboardTestimonialsView({ testimonials, user }: DashboardTestimonialsViewProps) {
  const params = useParams();
  const locale = params.locale as string;

  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialModel | undefined>();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientTitle, setClientTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [published, setPublished] = useState(false);

  function openCreate() {
    setEditingTestimonial(undefined);
    setClientName('');
    setClientTitle('');
    setContent('');
    setRating(5);
    setPublished(false);
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

  function closeForm() {
    setShowForm(false);
    setEditingTestimonial(undefined);
  }

  function handleSave() {
    const payload = {
      clientName,
      clientTitle: clientTitle || null,
      content,
      rating,
      published,
    };

    startTransition(async () => {
      const result = editingTestimonial
        ? await updateTestimonialAction({ id: editingTestimonial.id, ...payload })
        : await createTestimonialAction(payload);

      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        closeForm();
      }
    });
  }

  function handleDelete(t: TestimonialModel) {
    if (!confirm(`Delete testimonial from "${t.clientName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteTestimonialAction({ id: t.id });
      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  }

  return (
    <>
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <h1 className="text-2xl font-mono font-bold text-foreground">Testimonials</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Testimonial
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Inline form */}
        {showForm && (
          <div className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-6 mb-6">
            <h2 className="text-sm font-mono font-bold text-foreground uppercase tracking-widest mb-4">
              {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Client Name *</label>
                <input
                  className={INPUT_CLASS}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Client Title (optional)</label>
                <input
                  className={INPUT_CLASS}
                  value={clientTitle}
                  onChange={(e) => setClientTitle(e.target.value)}
                  placeholder="e.g. CEO at Acme Corp"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Testimonial *</label>
                <textarea
                  className={cn(INPUT_CLASS, 'resize-y min-h-[100px]')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What did they say about your work?"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-2 block">Rating</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="tst-published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="accent-[#00D4FF] w-4 h-4"
                />
                <label htmlFor="tst-published" className="text-xs font-mono text-muted-foreground">
                  Published (visible on portfolio)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isPending || !clientName || !content}
                  className="bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
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
        {testimonials.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-[hsl(174,100%,50%,0.3)] mx-auto mb-4" />
            <p className="text-muted-foreground font-mono mb-4">No testimonials yet</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-4 py-2 text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Testimonial
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-4 hover:border-[hsl(174,100%,50%,0.3)] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-foreground">{t.clientName}</span>
                      {t.clientTitle && (
                        <span className="text-xs font-mono text-muted-foreground">{t.clientTitle}</span>
                      )}
                      {t.published ? (
                        <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                          Live
                        </span>
                      ) : (
                        <span className="text-[#64748B] bg-[#64748B]/10 text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <StarDisplay rating={t.rating} />
                    <p className="text-xs font-mono text-muted-foreground mt-2 line-clamp-2">
                      {t.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-2 text-muted-foreground hover:text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)] rounded-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
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
    </>
  );
}
