/**
 * Page-Aware Prompts
 *
 * Page-specific system prompt augmentations for the AI chat.
 * Each entry provides bilingual (en/es) instructions telling the AI
 * what to proactively help with on that dashboard page.
 */

// =============================================================================
// Prompt Map
// =============================================================================

export const PAGE_PROMPTS: Record<string, { en: string; es: string }> = {
  dashboard: {
    en: 'User is on their main dashboard. Suggest portfolio improvements, highlight incomplete sections, or help them plan next steps.',
    es: 'El usuario esta en su dashboard principal. Sugiere mejoras al portfolio, destaca secciones incompletas o ayuda a planificar proximos pasos.',
  },
  skills: {
    en: 'User is viewing their skill tree. Help add new skills, suggest related technologies, or discuss skill levels and validation.',
    es: 'El usuario esta viendo su arbol de skills. Ayuda a agregar nuevas skills, sugiere tecnologias relacionadas o discute niveles y validacion.',
  },
  timeline: {
    en: 'User is editing their work history. Help improve experience descriptions, suggest better bullet points, or add missing experiences.',
    es: 'El usuario esta editando su historial laboral. Ayuda a mejorar descripciones, sugiere mejores bullet points o agrega experiencias faltantes.',
  },
  projects: {
    en: 'User is managing their projects. Help improve project descriptions, suggest tech stacks to highlight, or add new projects.',
    es: 'El usuario esta gestionando sus proyectos. Ayuda a mejorar descripciones, sugiere tech stacks a destacar o agrega nuevos proyectos.',
  },
  portfolio: {
    en: 'User is customizing their public portfolio settings. Help with bio, profile image, section visibility, and theme selection.',
    es: 'El usuario esta personalizando su portfolio publico. Ayuda con bio, imagen de perfil, visibilidad de secciones y seleccion de tema.',
  },
  gallery: {
    en: 'User is managing their gallery. Help with image descriptions and portfolio presentation.',
    es: 'El usuario esta gestionando su galeria. Ayuda con descripciones de imagenes y presentacion del portfolio.',
  },
  services: {
    en: 'User is managing their services. Help write compelling service descriptions and pricing strategies.',
    es: 'El usuario esta gestionando sus servicios. Ayuda a escribir descripciones atractivas y estrategias de precios.',
  },
  testimonials: {
    en: 'User is managing testimonials. Help request testimonials or suggest improvements.',
    es: 'El usuario esta gestionando testimonios. Ayuda a solicitar testimonios o sugiere mejoras.',
  },
  cv: {
    en: 'User is on the CV Generator page. Help them generate, improve, and optimize their CV for specific job targets.',
    es: 'El usuario esta en el Generador de CV. Ayuda a generar, mejorar y optimizar su CV para puestos especificos.',
  },
}

// =============================================================================
// Helper
// =============================================================================

/**
 * Get the page-specific prompt for a given page context and locale.
 *
 * @param pageContext - The current dashboard page identifier
 * @param locale - The user's locale ('en' or 'es')
 * @returns The page prompt text, or empty string if no matching page
 */
export function getPagePrompt(
  pageContext: string | undefined,
  locale: string,
): string {
  if (!pageContext) return ''

  const entry = PAGE_PROMPTS[pageContext]
  if (!entry) return ''

  return locale === 'es' ? entry.es : entry.en
}
