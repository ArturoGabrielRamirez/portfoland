import type { PageContext } from '../types/page-context'

/**
 * Contextual hint prompts shown below the CRT per page.
 * Max 2 prompts per page context.
 */
export const CRT_HINTS: Partial<Record<PageContext, string[]>> = {
  dashboard: [
    '¿Qué habilidades debería mejorar este mes?',
    '¿Cómo está mi perfil comparado con otros?',
  ],
  skills: [
    '¿Qué habilidades me faltan para mi área?',
    'Sugiere un plan de aprendizaje personalizado',
  ],
  timeline: [
    '¿Qué experiencias debería agregar a mi timeline?',
    '¿Cómo mejoro la descripción de mis experiencias?',
  ],
  projects: [
    '¿Cómo destaco mejor mis proyectos?',
    '¿Qué tecnologías son más demandadas ahora?',
  ],
  cv: [
    'Genera un CV para roles de fullstack developer',
    '¿Qué debo mejorar en mi perfil para conseguir trabajo?',
  ],
  portfolio: [
    '¿Cómo optimizo la presentación de mi portafolio?',
    '¿Qué sección de mi portafolio es más importante?',
  ],
}
