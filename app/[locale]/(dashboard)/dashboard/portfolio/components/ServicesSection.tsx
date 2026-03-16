'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from '@/features/services/actions/serviceActions';
import type { ServiceModel, PriceType } from '@/features/services/types/service';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';

interface ServicesSectionProps {
  services: ServiceModel[];
  portfolioMode: PortfolioMode;
}

function formatPrice(service: ServiceModel): string {
  const { priceType, currency, priceMin, priceMax } = service;
  const cur = currency ?? 'USD';
  if (priceType === 'FIXED') return `${cur} ${priceMin}`;
  if (priceType === 'RANGE') return `${cur} ${priceMin} – ${priceMax}`;
  if (priceType === 'STARTING_FROM') return `From ${cur} ${priceMin}`;
  return 'Contact for pricing';
}

export function ServicesSection({ services, portfolioMode }: ServicesSectionProps) {
  const mc = modeClasses(portfolioMode);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceModel | undefined>();
  const [isPending, startTransition] = useTransition();

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
    setTitle(''); setDescription(''); setPriceType('FIXED');
    setPriceMin(''); setPriceMax(''); setCurrency('USD');
    setDurationMinutes(''); setPublished(false);
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

  function closeForm() { setShowForm(false); setEditingService(undefined); }

  function handleSave() {
    const payload = {
      title, description, priceType,
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
      if (result.hasError) { toast.error(result.message); }
      else { toast.success(result.message); closeForm(); }
    });
  }

  function handleDelete(service: ServiceModel) {
    if (!confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteServiceAction({ id: service.id });
      if (result.hasError) { toast.error(result.message); }
      else { toast.success(result.message); }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={cn('text-sm font-semibold', mc.isTech ? 'font-mono text-foreground' : 'text-gray-900')}>Services</h3>
        <button onClick={openCreate} className={mc.primaryButton}>
          <Plus className="w-3.5 h-3.5" /> Add Service
        </button>
      </div>

      {showForm && (
        <div className={cn(mc.card, 'p-4')}>
          <h4 className={cn(mc.subHeading, 'mb-3')}>{editingService ? 'Edit Service' : 'New Service'}</h4>
          <div className="grid gap-3">
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Title *</label>
              <input className={mc.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Design" />
            </div>
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Description *</label>
              <textarea className={cn(mc.input, 'resize-y min-h-[80px]')} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what's included..." />
            </div>
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Price Type</label>
              <select className={mc.input} value={priceType} onChange={(e) => setPriceType(e.target.value as PriceType)}>
                <option value="FIXED">Fixed</option>
                <option value="RANGE">Range</option>
                <option value="STARTING_FROM">Starting From</option>
                <option value="CONTACT">Contact for Pricing</option>
              </select>
            </div>
            {priceType !== 'CONTACT' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn(mc.label, 'mb-1 block')}>{priceType === 'RANGE' ? 'Min Price' : 'Price'}</label>
                  <input type="number" className={mc.input} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" />
                </div>
                {priceType === 'RANGE' ? (
                  <div>
                    <label className={cn(mc.label, 'mb-1 block')}>Max Price</label>
                    <input type="number" className={mc.input} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="0" />
                  </div>
                ) : (
                  <div>
                    <label className={cn(mc.label, 'mb-1 block')}>Currency</label>
                    <input className={mc.input} value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
                  </div>
                )}
              </div>
            )}
            {priceType === 'RANGE' && (
              <div>
                <label className={cn(mc.label, 'mb-1 block')}>Currency</label>
                <input className={mc.input} value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
              </div>
            )}
            <div>
              <label className={cn(mc.label, 'mb-1 block')}>Duration (minutes, optional)</label>
              <input type="number" className={mc.input} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="e.g. 60" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="svc-pub" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="svc-pub" className={mc.label}>Published (visible on portfolio)</label>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={isPending || !title || !description} className={cn(mc.saveButton, 'disabled:opacity-50')}>
                {isPending ? 'Saving…' : editingService ? 'Save Changes' : 'Create Service'}
              </button>
              <button onClick={closeForm} className={mc.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {services.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <Briefcase className={cn('w-10 h-10 mx-auto mb-3', mc.isTech ? 'text-[hsl(174,100%,50%,0.3)]' : 'text-gray-300')} />
          <p className={cn('text-sm mb-3', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>No services yet</p>
          <button onClick={openCreate} className={cn(mc.primaryButton, 'mx-auto')}><Plus className="w-4 h-4" /> Add First Service</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <div key={service.id} className={cn(mc.itemCard, 'hover:shadow-sm transition-shadow')}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('font-semibold text-sm', mc.isTech ? 'font-mono text-foreground' : 'text-gray-900')}>{service.title}</span>
                  <span className={cn('text-xs', mc.isTech ? 'font-mono text-[hsl(174,100%,50%)]' : 'text-blue-600 font-medium')}>{formatPrice(service)}</span>
                  {service.durationMinutes && (
                    <span className={cn('text-[10px] px-2 py-0.5', mc.isTech ? 'font-mono border border-[hsl(174,100%,50%,0.2)] rounded-sm text-muted-foreground' : 'bg-gray-100 text-gray-500 rounded-full')}>
                      {service.durationMinutes} min
                    </span>
                  )}
                  <span className={mc.badge(service.published)}>{service.published ? 'Live' : 'Draft'}</span>
                </div>
                <p className={cn('text-xs mt-1 line-clamp-2', mc.isTech ? 'font-mono text-muted-foreground' : 'text-gray-500')}>{service.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(service)} className={mc.editButton} title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(service)} disabled={isPending} className={cn(mc.dangerButton, 'disabled:opacity-50')} title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
