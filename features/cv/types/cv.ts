/**
 * CV Types
 *
 * Type definitions for the CV Generator feature.
 */

// =============================================================================
// CV Content Types
// =============================================================================

/**
 * Structured CV content produced by AI generation
 */
export interface CVContent {
  professionalSummary: string;
  skills: CVSkillSection;
  workExperience: CVExperienceEntry[];
  education: CVExperienceEntry[];
  projects: CVProjectEntry[];
  certifications: CVExperienceEntry[];
  languages?: string[];
  metadata: {
    generatedAt: string;
    targetJob?: string;
    locale: string;
    portfolioMode: string;
  };
}

/**
 * Skills section grouped by category
 */
export interface CVSkillSection {
  categories: Array<{
    name: string;
    skills: Array<{
      name: string;
      level: number;
      validated: boolean;
    }>;
  }>;
}

/**
 * Experience entry for work, education, and certifications
 */
export interface CVExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  type: string;
}

/**
 * Project entry in CV
 */
export interface CVProjectEntry {
  title: string;
  description: string;
  technologies: string[];
  links: Array<{ label: string; url: string }>;
  status: string;
}

// =============================================================================
// CV Analysis Types
// =============================================================================

/**
 * The 6 available CV analysis types
 */
export type CVAnalysisType =
  | 'reality_check'
  | 'ats_optimization'
  | 'impact_improvement'
  | 'keyword_gap'
  | 'weakness_detection'
  | 'differentiation';

/**
 * Result from running a CV analysis
 */
export interface CVAnalysisResult {
  type: CVAnalysisType;
  score?: number;
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    issue: string;
    impact: string;
    fix: string;
  }>;
  improvedContent?: Partial<CVContent>;
  keywords?: Array<{
    keyword: string;
    found: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// =============================================================================
// CV Document Model (client-side representation)
// =============================================================================

/**
 * CVDocument as stored in the database, for client-side use.
 * Mirrors the Prisma CVDocument model shape.
 */
export interface CVDocumentModel {
  id: string;
  userId: string;
  title: string;
  targetJob: string | null;
  jobDescription: string | null;
  content: CVContent;
  analysisResults: Record<string, CVAnalysisResult> | null;
  createdAt: Date;
  updatedAt: Date;
}
