/**
 * Skill Messages Constants
 *
 * Success/error messages for skill operations with i18n support.
 */

// =============================================================================
// Message Types
// =============================================================================

export type MessageKey =
  | 'skillCreated'
  | 'skillUpdated'
  | 'skillDeleted'
  | 'categoryCreated'
  | 'skillsSynced'
  | 'skillNotFound'
  | 'categoryNotFound'
  | 'unauthorized'
  | 'invalidInput'
  | 'cannotDeleteLinkedSkill'
  | 'duplicateSkillName'
  | 'duplicateCategoryName';

// =============================================================================
// English Messages
// =============================================================================

export const SKILL_MESSAGES_EN: Record<MessageKey, string> = {
  // Success messages
  skillCreated: 'Skill added successfully',
  skillUpdated: 'Skill updated successfully',
  skillDeleted: 'Skill removed successfully',
  categoryCreated: 'Category created successfully',
  skillsSynced: 'Skills synchronized from experience',

  // Error messages
  skillNotFound: 'Skill not found',
  categoryNotFound: 'Category not found',
  unauthorized: 'You are not authorized to perform this action',
  invalidInput: 'Invalid input data',
  cannotDeleteLinkedSkill: 'Cannot delete skill that is linked to experiences',
  duplicateSkillName: 'A skill with this name already exists',
  duplicateCategoryName: 'A category with this name already exists',
} as const;

// =============================================================================
// Spanish Messages
// =============================================================================

export const SKILL_MESSAGES_ES: Record<MessageKey, string> = {
  // Success messages
  skillCreated: 'Habilidad agregada exitosamente',
  skillUpdated: 'Habilidad actualizada exitosamente',
  skillDeleted: 'Habilidad eliminada exitosamente',
  categoryCreated: 'Categoria creada exitosamente',
  skillsSynced: 'Habilidades sincronizadas desde la experiencia',

  // Error messages
  skillNotFound: 'Habilidad no encontrada',
  categoryNotFound: 'Categoria no encontrada',
  unauthorized: 'No estas autorizado para realizar esta accion',
  invalidInput: 'Datos de entrada invalidos',
  cannotDeleteLinkedSkill: 'No se puede eliminar una habilidad vinculada a experiencias',
  duplicateSkillName: 'Ya existe una habilidad con este nombre',
  duplicateCategoryName: 'Ya existe una categoria con este nombre',
} as const;

// =============================================================================
// Combined Messages Object
// =============================================================================

export const SKILL_MESSAGES = {
  en: SKILL_MESSAGES_EN,
  es: SKILL_MESSAGES_ES,
} as const;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get message by key and locale
 */
export function getSkillMessage(key: MessageKey, locale: 'en' | 'es' = 'en'): string {
  return SKILL_MESSAGES[locale][key];
}

/**
 * Get all messages for a locale
 */
export function getSkillMessages(locale: 'en' | 'es' = 'en'): Record<MessageKey, string> {
  return SKILL_MESSAGES[locale];
}

// =============================================================================
// Form Labels
// =============================================================================

export const SKILL_FORM_LABELS_EN = {
  skillName: 'Skill Name',
  skillNamePlaceholder: 'e.g., React, TypeScript, Node.js',
  category: 'Category',
  selectCategory: 'Select a category',
  selfAssessmentLevel: 'Self-Assessment Level',
  selectLevel: 'Select your level',
  learningSources: 'Learning Sources',
  learningSourcesPlaceholder: 'Courses, tutorials, books, or projects used to learn this skill',
  dateStarted: 'Date Started Learning',
  addSkill: 'Add Skill',
  updateSkill: 'Update Skill',
  cancel: 'Cancel',
  createCategory: 'Create New Category',
  categoryName: 'Category Name',
  categoryColor: 'Category Color',
} as const;

export const SKILL_FORM_LABELS_ES = {
  skillName: 'Nombre de la Habilidad',
  skillNamePlaceholder: 'ej., React, TypeScript, Node.js',
  category: 'Categoria',
  selectCategory: 'Selecciona una categoria',
  selfAssessmentLevel: 'Nivel de Autoevaluacion',
  selectLevel: 'Selecciona tu nivel',
  learningSources: 'Fuentes de Aprendizaje',
  learningSourcesPlaceholder: 'Cursos, tutoriales, libros o proyectos usados para aprender esta habilidad',
  dateStarted: 'Fecha de Inicio de Aprendizaje',
  addSkill: 'Agregar Habilidad',
  updateSkill: 'Actualizar Habilidad',
  cancel: 'Cancelar',
  createCategory: 'Crear Nueva Categoria',
  categoryName: 'Nombre de la Categoria',
  categoryColor: 'Color de la Categoria',
} as const;

export const SKILL_FORM_LABELS = {
  en: SKILL_FORM_LABELS_EN,
  es: SKILL_FORM_LABELS_ES,
} as const;

/**
 * Get form labels for a locale
 */
export function getSkillFormLabels(locale: 'en' | 'es' = 'en') {
  return SKILL_FORM_LABELS[locale];
}

// =============================================================================
// Self-Assessment Level Labels
// =============================================================================

export const SELF_ASSESSMENT_LABELS_EN = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export const SELF_ASSESSMENT_LABELS_ES = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
} as const;

export const SELF_ASSESSMENT_LABELS = {
  en: SELF_ASSESSMENT_LABELS_EN,
  es: SELF_ASSESSMENT_LABELS_ES,
} as const;

/**
 * Get self-assessment level labels for a locale
 */
export function getSelfAssessmentLabels(locale: 'en' | 'es' = 'en') {
  return SELF_ASSESSMENT_LABELS[locale];
}
