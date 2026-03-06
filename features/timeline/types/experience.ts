/**
 * Experience Types
 *
 * Re-exports Prisma types and defines derived types for the Timeline feature.
 */

// =============================================================================
// Re-export Prisma Types
// =============================================================================

export { ExperienceType } from '@/app/generated/prisma/enums';
export type { ExperienceModel as Experience } from '@/app/generated/prisma/models/Experience';

import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { ExperienceModel } from '@/app/generated/prisma/models/Experience';

// =============================================================================
// Derived Types
// =============================================================================

/**
 * Experience with user relation included
 */
export interface ExperienceWithUser extends ExperienceModel {
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

/**
 * Input for creating a new experience
 * Excludes auto-generated fields (id, xp, createdAt, updatedAt)
 */
export interface CreateExperienceInput {
  type: ExperienceType;
  title: string;
  company: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: Date;
  endDate?: Date | null;
  description: string;
  skills?: string[];
}

/**
 * Input for updating an existing experience
 * All fields are optional except id
 */
export interface UpdateExperienceInput {
  id: string;
  type?: ExperienceType;
  title?: string;
  company?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  startDate?: Date;
  endDate?: Date | null;
  description?: string;
  skills?: string[];
}

// =============================================================================
// Timeline Stats Types
// =============================================================================

/**
 * Aggregated stats for a user's timeline
 */
export interface TimelineStats {
  totalXP: number;
  totalExperiences: number;
  countByType: Record<ExperienceType, number>;
  milestones: number;
  achievements: number;
}

/**
 * Timeline data with experiences and stats
 */
export interface TimelineData {
  experiences: ExperienceModel[];
  stats: TimelineStats;
}

/**
 * Public timeline data (for /timeline/[username] page)
 */
export interface PublicTimelineData extends TimelineData {
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for HexagonNode component
 */
export interface HexagonNodeProps {
  experience: ExperienceModel;
  isSelected?: boolean;
  isCurrent?: boolean;
  onClick?: (experience: ExperienceModel) => void;
  className?: string;
}

/**
 * Props for ExperienceCard component
 */
export interface ExperienceCardProps {
  experience: ExperienceModel;
  isEditable?: boolean;
  onEdit?: (experience: ExperienceModel) => void;
  onDelete?: (experienceId: string) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Props for TimelineMap component
 */
export interface TimelineMapProps {
  experiences: ExperienceModel[];
  selectedExperience?: ExperienceModel | null;
  onExperienceSelect?: (experience: ExperienceModel) => void;
  isEditable?: boolean;
  /** When set, the map pans to the pin matching this experience id */
  focusedExperienceId?: string;
  className?: string;
}

/**
 * Props for TimelineFilter component
 */
export interface TimelineFilterProps {
  activeFilter: ExperienceType | 'ALL';
  onFilterChange: (filter: ExperienceType | 'ALL') => void;
  counts?: Record<ExperienceType | 'ALL', number>;
  className?: string;
}

/**
 * Props for TimelineStats component
 */
export interface TimelineStatsProps {
  stats: TimelineStats;
  className?: string;
}

/**
 * Props for MobileTimelineEvent component
 */
export interface MobileTimelineEventProps {
  experience: ExperienceModel;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: (experience: ExperienceModel) => void;
  className?: string;
}

/**
 * Props for ExperienceForm component
 */
export interface ExperienceFormProps {
  experience?: ExperienceModel;
  onSubmit: (data: CreateExperienceInput | UpdateExperienceInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Props for LocationPicker component
 */
export interface LocationPickerProps {
  value?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onChange: (location: { latitude: number; longitude: number; address: string }) => void;
  className?: string;
}

/**
 * Props for TimelineSidebar component
 */
export interface TimelineSidebarProps {
  /** Experiences sorted by startDate descending — sort in the parent */
  experiences: ExperienceModel[];
  selectedExperienceId?: string;
  onSelect: (exp: ExperienceModel) => void;
  isOpen: boolean;
  onToggle: () => void;
}
