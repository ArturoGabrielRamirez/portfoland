/**
 * Timeline Feature
 *
 * Public exports for the timeline feature.
 */

// Types
export type {
  ExperienceWithUser,
  CreateExperienceInput,
  UpdateExperienceInput,
  TimelineStats as TimelineStatsData,
  PublicTimelineData,
  HexagonNodeProps,
  ExperienceCardProps,
  TimelineMapProps,
  TimelineFilterProps,
  TimelineStatsProps,
  MobileTimelineEventProps,
  LocationPickerProps,
  ExperienceFormProps,
} from './types/experience';

// Re-export Prisma types
export { ExperienceType } from '@/app/generated/prisma/enums';
export type { ExperienceModel as Experience } from '@/app/generated/prisma/models/Experience';

// Constants
export { XP_VALUES, EXPERIENCE_COLORS, EXPERIENCE_GLOW_COLORS } from './constants/xp';
export { EXPERIENCE_MESSAGES } from './constants/messages';

// Components
export { HexagonNode } from './components/HexagonNode';
export { ExperienceCard } from './components/ExperienceCard';
export { TimelineConnections } from './components/TimelineConnections';
export { TimelineFilter } from './components/TimelineFilter';
export { TimelineStats } from './components/TimelineStats';
export { MobileTimelineEvent } from './components/MobileTimelineEvent';
export { TimelineMap } from './components/TimelineMap';
export { LocationPicker } from './components/LocationPicker';
export { ExperienceForm } from './components/ExperienceForm';
export { ExperienceFormModal } from './components/ExperienceFormModal';
export { DeleteConfirmModal } from './components/DeleteConfirmModal';
export { SkillTagInput } from './components/SkillTagInput';

// Actions
export { createExperience } from './actions/createExperience';
export { updateExperience } from './actions/updateExperience';
export { deleteExperience } from './actions/deleteExperience';
export { getExperiences } from './actions/getExperiences';

// Data (for server components)
export {
  getExperiencesByUserId,
  getExperienceById,
  createExperience as createExperienceData,
  updateExperience as updateExperienceData,
  deleteExperience as deleteExperienceData,
  getPublicTimelineByUsername,
} from './data';

// Schemas
export {
  createExperienceSchema,
  updateExperienceSchema,
  deleteExperienceSchema,
} from './schemas/experience.schema';
