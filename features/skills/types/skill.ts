/**
 * Skill Types
 *
 * Type definitions for the skill tree visualization feature.
 * Re-exports Prisma types and defines extended types with relations.
 */

import type { Prisma } from '@/app/generated/prisma/client';
import type {
  Skill as PrismaSkill,
  SkillCategory as PrismaSkillCategory,
  UserSkill as PrismaUserSkill,
  SkillSource as PrismaSkillSource,
  SourceType as PrismaSourceType,
} from '@/app/generated/prisma/client';
import type { SelfAssessmentLevel } from '../constants/xp';

// =============================================================================
// Re-exported Prisma Types
// =============================================================================

/**
 * Skill model - represents a unique skill (e.g., "React", "TypeScript")
 * This is a global skill definition, not user-specific
 */
export type Skill = PrismaSkill;

/**
 * SkillCategory model - represents a skill category (e.g., "Frontend", "Backend")
 */
export type SkillCategory = PrismaSkillCategory;

/**
 * UserSkill model - represents a user's proficiency in a skill
 */
export type UserSkill = PrismaUserSkill;

/**
 * SkillSource model - represents a source of XP for a user skill
 */
export type SkillSource = PrismaSkillSource;

/**
 * SourceType enum - type of skill source
 */
export type SourceType = PrismaSourceType;

// Re-export the enum values for use
export { SourceType as SourceTypeEnum } from '@/app/generated/prisma/enums';

// =============================================================================
// Enums
// =============================================================================

/**
 * Skill level (1-5)
 */
export enum SkillLevel {
  NOVICE = 1,
  APPRENTICE = 2,
  JOURNEYMAN = 3,
  EXPERT = 4,
  MASTER = 5,
}

// =============================================================================
// Metadata Types
// =============================================================================

/**
 * Metadata stored in SkillSource for manual entries
 */
export interface SkillSourceMetadata {
  selfAssessmentLevel?: SelfAssessmentLevel;
  learningSources?: string;
  dateStarted?: string; // ISO date string
}

// =============================================================================
// Extended Types with Relations (using Prisma.GetPayload)
// =============================================================================

/**
 * Skill with its category
 */
export type SkillWithCategory = Prisma.SkillGetPayload<{
  include: { category: true };
}>;

/**
 * UserSkill with skill details and sources
 */
export type UserSkillWithDetails = Prisma.UserSkillGetPayload<{
  include: {
    skill: {
      include: { category: true };
    };
    sources: {
      include: {
        experience: {
          select: {
            id: true;
            title: true;
            company: true;
            type: true;
            startDate: true;
            endDate: true;
          };
        };
      };
    };
  };
}>;

/**
 * Extended UserSkill with computed fields
 * Adds selfAssessmentLevel computed from sources/metadata.
 * Note: githubValidated is now a real Prisma field on UserSkill (TG1 schema change),
 * so it is available directly via userSkill.githubValidated rather than as a computed field.
 */
export type UserSkillWithComputed = UserSkillWithDetails & {
  selfAssessmentLevel?: SelfAssessmentLevel;
};

/**
 * Get self-assessment level from skill sources
 */
export function getSelfAssessmentLevel(sources: UserSkillWithDetails['sources']): SelfAssessmentLevel | undefined {
  const manualSource = sources.find(s => s.sourceType === 'MANUAL');
  if (manualSource?.metadata) {
    const meta = manualSource.metadata as SkillSourceMetadata;
    return meta.selfAssessmentLevel;
  }
  return undefined;
}

/**
 * Check if skill has GitHub validation.
 * Reads the real `githubValidated` field from the UserSkill Prisma model.
 * This field was added to the schema in TG1 (Phase 3A) and defaults to false.
 */
export function hasGitHubValidation(userSkill: Pick<UserSkill, 'githubValidated'>): boolean {
  return userSkill.githubValidated;
}

/**
 * SkillSource with experience details (for EXPERIENCE type sources)
 */
export type SkillSourceWithExperience = Prisma.SkillSourceGetPayload<{
  include: {
    experience: {
      select: {
        id: true;
        title: true;
        company: true;
        type: true;
        startDate: true;
        endDate: true;
      };
    };
  };
}>;

/**
 * Category with its skills count
 */
export type SkillCategoryWithCount = Prisma.SkillCategoryGetPayload<{
  include: { _count: { select: { skills: true } } };
}>;

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a new manual skill entry
 */
export interface CreateSkillInput {
  name: string;
  categoryId?: string;
  selfAssessmentLevel: SelfAssessmentLevel;
  learningSources?: string;
  dateStarted?: Date;
}

/**
 * Input for updating an existing skill
 */
export interface UpdateSkillInput {
  id: string;
  name?: string;
  categoryId?: string;
  selfAssessmentLevel?: SelfAssessmentLevel;
  learningSources?: string;
}

/**
 * Input for creating a new category
 */
export interface CreateCategoryInput {
  name: string;
  color: string;
}

/**
 * Input for syncing skills from an experience
 */
export interface SyncSkillsFromExperienceInput {
  experienceId: string;
  userId: string;
  skills: string[];
  startDate: Date;
  endDate: Date | null;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for SkillIcon component
 */
export interface SkillIconProps {
  skillName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Props for SkillHexagonNode component
 */
export interface SkillHexagonNodeProps {
  userSkill?: UserSkillWithDetails;
  isEmpty?: boolean;
  suggestedSkillName?: string;
  categoryColor: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Props for SkillDetailCard component
 */
export interface SkillDetailCardProps {
  userSkill: UserSkillWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  className?: string;
  githubConnected?: boolean;
  locale?: string;
}

/**
 * Props for ManualSkillForm component
 */
export interface ManualSkillFormProps {
  initialData?: Partial<CreateSkillInput>;
  onSubmit: (data: CreateSkillInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Props for CategorySelect component
 */
export interface CategorySelectProps {
  value?: string;
  onChange: (categoryId: string) => void;
  categories: SkillCategory[];
  onCreateNew?: () => void;
  className?: string;
}

/**
 * Props for XPSourceList component
 */
export interface XPSourceListProps {
  sources: SkillSourceWithExperience[];
  onExperienceClick?: (experienceId: string) => void;
  className?: string;
}

/**
 * Props for MobileSkillItem component
 */
export interface MobileSkillItemProps {
  userSkill: UserSkillWithDetails;
  onClick?: () => void;
  isExpanded?: boolean;
  className?: string;
}

/**
 * Props for MobileSkillList component
 */
export interface MobileSkillListProps {
  userSkills: UserSkillWithDetails[];
  categories: SkillCategory[];
  onSkillClick?: (userSkill: UserSkillWithDetails) => void;
  className?: string;
}

/**
 * Props for SkillTreeView component
 */
export interface SkillTreeViewProps {
  userSkills: UserSkillWithDetails[];
  categories: SkillCategory[];
  isEditable?: boolean;
  onAddSkill?: () => void;
  className?: string;
  githubConnected?: boolean;
  locale?: string;
}

// =============================================================================
// Stats Types
// =============================================================================

/**
 * Aggregated skill stats for a user
 */
export interface SkillStats {
  totalSkills: number;
  totalXP: number;
  skillsByLevel: Record<SkillLevel, number>;
  skillsByCategory: Record<string, number>;
  averageLevel: number;
  masterSkillsCount: number;
}

/**
 * Skills grouped by category for display
 */
export interface SkillsByCategory {
  category: SkillCategory;
  skills: UserSkillWithDetails[];
  totalXP: number;
}
