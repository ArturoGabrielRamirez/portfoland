'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DashboardNav } from '@/features/tech';
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from '@/features/services/actions/serviceActions';
import type { ServiceModel, PriceType } from '@/features/services/types/service';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

interface DashboardServicesViewProps {
  services: ServiceModel[];
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

function formatPrice(service: ServiceModel): string {
  const { priceType, currency, priceMin, priceMax } = service;
  const cur = currency ?? 'USD';
  if (priceType === 'FIXED') return `${cur} ${priceMin}`;
  if (priceType === 'RANGE') return `${cur} ${priceMin} – ${priceMax}`;
  if (priceType === 'STARTING_FROM') return `From ${cur} ${priceMin}`;
  return 'Contact for pricing';
}

export function DashboardServicesView({ services, user }: DashboardServicesViewProps) {
  const params = useParams();
  const locale = params.locale as string;

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceModel | undefined>();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('FIXED');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [published, setPublished] = useState(false);

  function openCreate() {
    setEditingService(undefined);
    setTitle('');
    setDescription('');
    setPriceType('FIXED');
    setPriceMin('');
    setPriceMax('');
    setCurrency('USD');
    setDurationMinutes('');
    setPublished(false);
    setShowForm(true);
  }

  function openEdit(service: ServiceModel) {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description ?? '');
    setPriceType(service.priceType as PriceType);
    setPriceMin(service.priceMin?.toString() ?? '');
    setPriceMax(service.priceMax?.toString() ?? '');
    setCurrency(service.currency ?? 'USD');
    setDurationMinutes(service.durationMinutes?.toString() ?? '');
    setPublished(service.published);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingService(undefined);
  }

  function handleSave() {
    const payload = {
      title,
      description,
      priceType,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      currency: priceType !== 'CONTACT' ? currency : undefined,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      published,
    };

    startTransition(async () => {
      const result = editingService
        ? await updateServiceAction({ id: editingService.id, ...payload })
        : await createServiceAction(payload);

      if (result.hasError) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        closeForm();
      }
    });
  }

  function handleDelete(service: ServiceModel) {
    if (!confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteServiceAction({ id: service.id });
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
        <h1 className="text-2xl font-mono font-bold text-foreground">Services</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Inline form */}
        {showForm && (
          <div className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-6 mb-6">
            <h2 className="text-sm font-mono font-bold text-foreground uppercase tracking-widest mb-4">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Title *</label>
                <input
                  className={INPUT_CLASS}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Design"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Description *</label>
                <textarea
                  className={cn(INPUT_CLASS, 'resize-y min-h-[80px]')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's included..."
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Price Type</label>
                <select
                  className={INPUT_CLASS}
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as PriceType)}
                >
                  <option value="FIXED">Fixed</option>
                  <option value="RANGE">Range</option>
                  <option value="STARTING_FROM">Starting From</option>
                  <option value="CONTACT">Contact for Pricing</option>
                </select>
              </div>
              {priceType !== 'CONTACT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">
                      {priceType === 'RANGE' ? 'Min Price' : 'Price'}
                    </label>
                    <input
                      type="number"
                      className={INPUT_CLASS}
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  {priceType === 'RANGE' && (
                    <div>
                      <label className="text-xs font-mono text-muted-foreground mb-1 block">Max Price</label>
                      <input
                        type="number"
                        className={INPUT_CLASS}
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  )}
                  {priceType !== 'RANGE' && (
                    <div>
                      <label className="text-xs font-mono text-muted-foreground mb-1 block">Currency</label>
                      <input
                        className={INPUT_CLASS}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="USD"
                      />
                    </div>
                  )}
                </div>
              )}
              {priceType === 'RANGE' && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Currency</label>
                  <input
                    className={INPUT_CLASS}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Duration (minutes, optional)</label>
                <input
                  type="number"
                  className={INPUT_CLASS}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g. 60"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="svc-published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="accent-[#00D4FF] w-4 h-4"
                />
                <label htmlFor="svc-published" className="text-xs font-mono text-muted-foreground">
                  Published (visible on portfolio)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isPending || !title || !description}
                  className="bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
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
        {services.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-[hsl(174,100%,50%,0.3)] mx-auto mb-4" />
            <p className="text-muted-foreground font-mono mb-4">No services yet</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-4 py-2 text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)] transition-shadow mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Service
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-4 hover:border-[hsl(174,100%,50%,0.3)] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-mono font-bold text-foreground">{service.title}</h3>
                      <span className="text-xs font-mono text-[hsl(174,100%,50%)]">
                        {formatPrice(service)}
                      </span>
                      {service.durationMinutes && (
                        <span className="text-[10px] font-mono px-2 py-0.5 border border-[hsl(174,100%,50%,0.2)] rounded-sm text-muted-foreground">
                          {service.durationMinutes} min
                        </span>
                      )}
                      {service.published ? (
                        <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                          Live
                        </span>
                      ) : (
                        <span className="text-[#64748B] bg-[#64748B]/10 text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(service)}
                      className="p-2 text-muted-foreground hover:text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)] rounded-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
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
