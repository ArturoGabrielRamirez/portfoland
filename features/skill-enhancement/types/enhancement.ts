/**
 * Skill Enhancement Types
 *
 * Types for AI-generated skill improvement suggestions:
 * related technologies, learning resources, and next-level guidance.
 */

export interface RelatedSkill {
  name: string
  category: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  alreadyAdded: boolean
}

export interface LearningResource {
  title: string
  type: 'video' | 'article' | 'course' | 'documentation' | 'practice'
  url: string
  duration: string
  cost: 'free' | 'paid'
  why: string
}

export interface SkillEnhancement {
  skillName: string
  currentLevel: number
  nextLevelFocus: string
  relatedSkills: RelatedSkill[]
  resources: LearningResource[]
  validationStatus: {
    githubConnected: boolean
    assessmentAvailable: boolean
    assessmentPassed: boolean
  }
}
