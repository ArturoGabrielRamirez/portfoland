/**
 * CVImportPanel Component
 *
 * Three-state panel for importing a CV file:
 *   idle    — file dropzone
 *   parsing — loading spinner while AI processes the file
 *   preview — extracted items with checkboxes to select/deselect
 */

'use client';

import { useState, useTransition, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modeClasses } from '@/features/dashboard/utils/modeClasses';
import { importCVAction } from '../actions/importCV.action';
import { updateProfile } from '@/features/portfolio/actions/updateProfile';
import type {
  CVImportPanelProps,
  CVImportPreview,
  CVImportSkillItem,
  CVImportExperienceItem,
  CVImportProjectItem,
} from '../types/cvImport';

// =============================================================================
// Sub-components
// =============================================================================

/** Badge pill for Tech or Classic mode */
function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-sm border', className)}>
      {label}
    </span>
  );
}

// =============================================================================
// Component
// =============================================================================

type ViewState = 'idle' | 'parsing' | 'preview';

export function CVImportPanel({ portfolioMode }: CVImportPanelProps) {
  const mc = modeClasses(portfolioMode);

  // View state
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [preview, setPreview] = useState<CVImportPreview | null>(null);

  // Selected indices (all checked by default when preview loads)
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set());
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());

  // File input ref
  const fileRef = useRef<HTMLInputElement>(null);

  // Transitions
  const [isConfirming, startConfirmTransition] = useTransition();
  const [isApplyingBio, startBioTransition] = useTransition();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setViewState('parsing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cv/import', { method: 'POST', body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to parse CV');
        setViewState('idle');
        return;
      }

      const data: CVImportPreview = await res.json();
      setPreview(data);

      // Check all items by default
      setSelectedSkills(new Set(data.skills.map((_, i) => i)));
      setSelectedExperiences(new Set(data.experiences.map((_, i) => i)));
      setSelectedProjects(new Set(data.projects.map((_, i) => i)));

      setViewState('preview');
    } catch {
      toast.error('Upload failed');
      setViewState('idle');
    }
  }

  function toggleSkill(index: number) {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleExperience(index: number) {
    setSelectedExperiences((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleProject(index: number) {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleConfirm() {
    if (!preview) return;

    const confirmedSkills: CVImportSkillItem[] = preview.skills.filter((_, i) =>
      selectedSkills.has(i)
    );
    const confirmedExperiences: CVImportExperienceItem[] = preview.experiences.filter(
      (_, i) => selectedExperiences.has(i)
    );
    const confirmedProjects: CVImportProjectItem[] = preview.projects.filter((_, i) =>
      selectedProjects.has(i)
    );

    startConfirmTransition(async () => {
      const result = await importCVAction({
        skills: confirmedSkills,
        experiences: confirmedExperiences,
        projects: confirmedProjects,
      });

      if (result.hasError) {
        toast.error(result.message);
        return;
      }

      const { skillsAdded, experiencesAdded, projectsAdded } = result.payload;
      toast.success(
        `Imported: ${skillsAdded} skills, ${experiencesAdded} experiences, ${projectsAdded} projects`
      );

      // Reset to idle
      setViewState('idle');
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  function handleApplyBio() {
    if (!preview?.summary) return;

    startBioTransition(async () => {
      const result = await updateProfile({ bio: preview.summary });
      if (result.hasError) {
        toast.error('Failed to update bio');
      } else {
        toast.success('Bio updated');
      }
    });
  }

  function handleStartOver() {
    setViewState('idle');
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const totalSelected =
    selectedSkills.size + selectedExperiences.size + selectedProjects.size;

  // ---------------------------------------------------------------------------
  // Render — idle
  // ---------------------------------------------------------------------------

  if (viewState === 'idle') {
    return (
      <div className="space-y-4">
        {/* Hidden file input */}
        <input
          type="file"
          accept=".pdf,.docx"
          ref={fileRef}
          onChange={handleUpload}
          className="sr-only"
        />

        {/* Visible upload zone */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            'w-full flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed transition-colors cursor-pointer',
            mc.isTech
              ? 'border-[hsl(174,100%,50%,0.3)] hover:border-[hsl(174,100%,50%,0.6)] bg-[hsl(200,30%,8%)] rounded-sm'
              : 'border-gray-300 hover:border-blue-400 bg-gray-50 rounded-lg'
          )}
        >
          <Upload
            className={cn(
              'w-8 h-8',
              mc.isTech ? 'text-[#00D4FF]' : 'text-blue-500'
            )}
          />
          <div className="text-center">
            <p
              className={cn(
                'font-medium',
                mc.isTech ? 'font-mono text-sm text-gray-200' : 'text-sm text-gray-700'
              )}
            >
              {mc.isTech ? 'DROP YOUR CV HERE OR CLICK TO BROWSE' : 'Drop your CV here or click to browse'}
            </p>
            <p className={cn('mt-1', mc.label)}>PDF or DOCX, max 5MB</p>
          </div>
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — parsing
  // ---------------------------------------------------------------------------

  if (viewState === 'parsing') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2
          className={cn(
            'w-8 h-8 animate-spin',
            mc.isTech ? 'text-[#00D4FF]' : 'text-blue-500'
          )}
        />
        <p className={cn(mc.label, 'text-sm')}>
          {mc.isTech ? 'ANALYZING CV...' : 'Analyzing CV with AI...'}
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — preview
  // ---------------------------------------------------------------------------

  if (!preview) return null;

  return (
    <div className="space-y-5">
      {/* Summary section */}
      {preview.summary && (
        <div
          className={cn(
            'p-4 space-y-3',
            mc.isTech
              ? 'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm'
              : 'bg-blue-50 border border-blue-200 rounded-lg'
          )}
        >
          <p className={cn(mc.subHeading, 'text-xs')}>
            {mc.isTech ? 'EXTRACTED SUMMARY' : 'Extracted Summary'}
          </p>
          <p className={cn('text-sm leading-relaxed', mc.isTech ? 'text-gray-300 font-mono' : 'text-gray-700')}>
            {preview.summary}
          </p>
          <button
            type="button"
            onClick={handleApplyBio}
            disabled={isApplyingBio}
            className={cn(
              'flex items-center gap-1.5 text-xs',
              mc.isTech
                ? 'font-mono text-[#00D4FF] hover:opacity-80 disabled:opacity-50'
                : 'font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50'
            )}
          >
            {isApplyingBio && <Loader2 className="w-3 h-3 animate-spin" />}
            {mc.isTech ? 'APPLY AS BIO' : 'Apply as bio'}
          </button>
        </div>
      )}

      {/* Skills group */}
      {preview.skills.length > 0 && (
        <div className="space-y-2">
          <p className={cn(mc.subHeading)}>
            {mc.isTech
              ? `SKILLS (${preview.skills.length})`
              : `Skills (${preview.skills.length})`}
          </p>
          <div className="space-y-1.5">
            {preview.skills.map((skill, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleSkill(i)}
                className={cn(
                  'w-full flex items-center gap-3 p-2.5 text-left transition-colors',
                  mc.isTech
                    ? 'border border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,9%)] hover:border-[hsl(174,100%,50%,0.3)] rounded-sm'
                    : 'border border-gray-200 bg-white hover:bg-gray-50 rounded-md'
                )}
              >
                {/* Checkbox indicator */}
                <span
                  className={cn(
                    'flex-shrink-0 w-4 h-4 border rounded-sm flex items-center justify-center',
                    selectedSkills.has(i)
                      ? mc.isTech
                        ? 'bg-[#00D4FF] border-[#00D4FF]'
                        : 'bg-blue-600 border-blue-600'
                      : mc.isTech
                        ? 'border-[hsl(174,100%,50%,0.3)]'
                        : 'border-gray-300'
                  )}
                >
                  {selectedSkills.has(i) && (
                    <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </span>

                {/* Skill name */}
                <span
                  className={cn(
                    'flex-1 text-sm',
                    mc.isTech ? 'font-mono text-gray-200' : 'text-gray-800'
                  )}
                >
                  {skill.name}
                </span>

                {/* Category and level badges */}
                <div className="flex items-center gap-1.5">
                  <Badge
                    label={skill.category}
                    className={
                      mc.isTech
                        ? 'text-gray-400 border-[hsl(174,100%,50%,0.15)] bg-transparent'
                        : 'text-gray-500 border-gray-200 bg-gray-50'
                    }
                  />
                  <Badge
                    label={`L${skill.level}`}
                    className={
                      mc.isTech
                        ? 'text-[#00D4FF] border-[hsl(174,100%,50%,0.3)] bg-[hsl(174,100%,50%,0.05)]'
                        : 'text-blue-600 border-blue-200 bg-blue-50'
                    }
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Experiences group */}
      {preview.experiences.length > 0 && (
        <div className="space-y-2">
          <p className={cn(mc.subHeading)}>
            {mc.isTech
              ? `EXPERIENCES (${preview.experiences.length})`
              : `Experiences (${preview.experiences.length})`}
          </p>
          <div className="space-y-1.5">
            {preview.experiences.map((exp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleExperience(i)}
                className={cn(
                  'w-full flex items-start gap-3 p-2.5 text-left transition-colors',
                  mc.isTech
                    ? 'border border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,9%)] hover:border-[hsl(174,100%,50%,0.3)] rounded-sm'
                    : 'border border-gray-200 bg-white hover:bg-gray-50 rounded-md'
                )}
              >
                {/* Checkbox indicator */}
                <span
                  className={cn(
                    'flex-shrink-0 mt-0.5 w-4 h-4 border rounded-sm flex items-center justify-center',
                    selectedExperiences.has(i)
                      ? mc.isTech
                        ? 'bg-[#00D4FF] border-[#00D4FF]'
                        : 'bg-blue-600 border-blue-600'
                      : mc.isTech
                        ? 'border-[hsl(174,100%,50%,0.3)]'
                        : 'border-gray-300'
                  )}
                >
                  {selectedExperiences.has(i) && (
                    <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      label={exp.type}
                      className={cn(
                        mc.isTech
                          ? 'text-[#D946EF] border-[#D946EF]/30 bg-[#D946EF]/5'
                          : exp.type === 'WORK'
                            ? 'text-indigo-600 border-indigo-200 bg-indigo-50'
                            : exp.type === 'EDUCATION'
                              ? 'text-green-600 border-green-200 bg-green-50'
                              : 'text-orange-600 border-orange-200 bg-orange-50'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        mc.isTech ? 'font-mono text-gray-200' : 'text-gray-800'
                      )}
                    >
                      {exp.title}
                    </span>
                  </div>
                  <p className={cn('text-xs', mc.isTech ? 'text-gray-400 font-mono' : 'text-gray-500')}>
                    {exp.company}
                    {' · '}
                    {exp.startDate}
                    {exp.endDate ? ` — ${exp.endDate}` : ' — Present'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Projects group */}
      {preview.projects.length > 0 && (
        <div className="space-y-2">
          <p className={cn(mc.subHeading)}>
            {mc.isTech
              ? `PROJECTS (${preview.projects.length})`
              : `Projects (${preview.projects.length})`}
          </p>
          <div className="space-y-1.5">
            {preview.projects.map((proj, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleProject(i)}
                className={cn(
                  'w-full flex items-start gap-3 p-2.5 text-left transition-colors',
                  mc.isTech
                    ? 'border border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,9%)] hover:border-[hsl(174,100%,50%,0.3)] rounded-sm'
                    : 'border border-gray-200 bg-white hover:bg-gray-50 rounded-md'
                )}
              >
                {/* Checkbox indicator */}
                <span
                  className={cn(
                    'flex-shrink-0 mt-0.5 w-4 h-4 border rounded-sm flex items-center justify-center',
                    selectedProjects.has(i)
                      ? mc.isTech
                        ? 'bg-[#00D4FF] border-[#00D4FF]'
                        : 'bg-blue-600 border-blue-600'
                      : mc.isTech
                        ? 'border-[hsl(174,100%,50%,0.3)]'
                        : 'border-gray-300'
                  )}
                >
                  {selectedProjects.has(i) && (
                    <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      mc.isTech ? 'font-mono text-gray-200' : 'text-gray-800'
                    )}
                  >
                    {proj.title}
                  </p>
                  <p className={cn('text-xs line-clamp-2', mc.isTech ? 'text-gray-400 font-mono' : 'text-gray-500')}>
                    {proj.description}
                  </p>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.slice(0, 6).map((tech, ti) => (
                        <Badge
                          key={ti}
                          label={tech}
                          className={
                            mc.isTech
                              ? 'text-gray-400 border-[hsl(174,100%,50%,0.15)] bg-transparent'
                              : 'text-gray-500 border-gray-200 bg-gray-50'
                          }
                        />
                      ))}
                      {proj.technologies.length > 6 && (
                        <span className={cn('text-[10px]', mc.label)}>
                          +{proj.technologies.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[hsl(174,100%,50%,0.1)]">
        <button
          type="button"
          onClick={handleStartOver}
          className={cn(
            'text-xs transition-colors',
            mc.isTech
              ? 'font-mono text-gray-500 hover:text-gray-300'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          {mc.isTech ? 'START_OVER' : 'Start over'}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming || totalSelected === 0}
          className={cn(
            mc.saveButton,
            'flex items-center gap-2',
            (isConfirming || totalSelected === 0) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isConfirming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {mc.isTech
            ? `IMPORT_SELECTED (${totalSelected})`
            : `Import Selected (${totalSelected})`}
        </button>
      </div>
    </div>
  );
}
