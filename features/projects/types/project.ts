/**
 * Project Types
 *
 * Re-exports Prisma types and defines derived types for the Projects feature.
 */

// =============================================================================
// Re-export Prisma Types
// =============================================================================

export { ProjectStatus } from '@/app/generated/prisma/enums';
export type { ProjectModel as Project } from '@/app/generated/prisma/models/Project';

import type { ProjectStatus } from '@/app/generated/prisma/enums';
import type { ProjectModel } from '@/app/generated/prisma/models/Project';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

// =============================================================================
// Link Types
// =============================================================================

/**
 * Supported project link types
 */
export const PROJECT_LINK_TYPES = [
  'LIVE',
  'REPO',
  'DOCS',
  'VIDEO',
  'CASE_STUDY',
  'OTHER',
] as const;

export type ProjectLinkType = (typeof PROJECT_LINK_TYPES)[number];

/**
 * Structure for a single project link
 */
export interface ProjectLink {
  type: string;
  label: string;
  url: string;
}

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a new project
 * Excludes auto-generated fields (id, userId, createdAt, updatedAt)
 */
export interface CreateProjectInput {
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  links?: ProjectLink[];
  featured?: boolean;
  status?: ProjectStatus;
  startDate: Date;
  endDate?: Date | null;
  order?: number | null;
}

/**
 * Input for updating an existing project
 * All fields are optional except id
 */
export interface UpdateProjectInput {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  links?: ProjectLink[];
  featured?: boolean;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date | null;
  order?: number | null;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for ProjectCard component
 */
export interface ProjectCardProps {
  project: ProjectModel;
  mode: PortfolioMode;
  onClick: (project: ProjectModel) => void;
}

/**
 * Props for ProjectDetailModal component
 */
export interface ProjectDetailProps {
  project: ProjectModel;
  mode: PortfolioMode;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props for ProjectForm component
 */
export interface ProjectFormProps {
  project?: ProjectModel;
  onCancel?: () => void;
  className?: string;
}
