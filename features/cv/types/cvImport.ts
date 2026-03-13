/**
 * CV Import Types
 *
 * TypeScript interfaces for the CV Import feature — file upload,
 * AI-extracted preview, and component props.
 */

import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

// =============================================================================
// Extracted Item Interfaces
// =============================================================================

/** A skill extracted from an uploaded CV */
export interface CVImportSkillItem {
  name: string;
  level: number;
  category: string;
}

/** An experience (work/education/certification) extracted from an uploaded CV */
export interface CVImportExperienceItem {
  type: 'WORK' | 'EDUCATION' | 'CERTIFICATION';
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  description: string;
}

/** A project extracted from an uploaded CV */
export interface CVImportProjectItem {
  title: string;
  description: string;
  technologies: string[];
}

/** Full AI-extracted preview from the uploaded CV */
export interface CVImportPreview {
  skills: CVImportSkillItem[];
  experiences: CVImportExperienceItem[];
  projects: CVImportProjectItem[];
  summary?: string;
}

// =============================================================================
// Result
// =============================================================================

/** Aggregate result counts returned after bulk creation */
export interface BulkCreateResult {
  skillsAdded: number;
  experiencesAdded: number;
  projectsAdded: number;
  skipped: number;
}

// =============================================================================
// Component Props
// =============================================================================

/** Props for the CVImportPanel component */
export interface CVImportPanelProps {
  portfolioMode: PortfolioMode;
}

/** Props for the CVImportButton component */
export interface CVImportButtonProps {
  portfolioMode: PortfolioMode;
}
