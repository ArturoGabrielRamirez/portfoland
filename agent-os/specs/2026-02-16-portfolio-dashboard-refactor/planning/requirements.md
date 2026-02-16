# Spec Requirements: Portfolio Dashboard Refactor

## Initial Description
Refactor and complete the Portfolio Dashboard editor at `/dashboard/portfolio`. Manage Bio, Contact Info, Section Order, and Visibility.

## Requirements Discussion
### First Round Questions
**Q1: Orden de Secciones** — **Answer:** Utiliza flechas arriba/abajo (funcionalidad simple).
**Q2: Información de Contacto** — **Answer:** Campos fijos (GitHub, LinkedIn, Email) + sistema dinámico de "Agregar Link".
**Q3: Contenido de la Bio** — **Answer:** Soporte Markdown.
**Q4: Toggles de Visibilidad** — **Answer:** Sí, opción de ocultar secciones (About, Experience, Skills, Projects).
**Q5: Referencia de Código** — **Answer:** HUD Panels y sistema de formularios de `ExperienceForm.tsx` (Timeline Entry Creator).

### Existing Code to Reference
- **ExperienceForm:** `features/timeline/components/ExperienceForm.tsx` (UI/Form patterns)
- **DashboardNav:** `features/gaming/components/DashboardNav.tsx` (Navigation context)
- **PortfolioModeToggle:** `features/portfolio/components/PortfolioModeToggle.tsx` (Theme context)

## Visual Assets
### Files Referenced:
- `agent-os/product/visuals/dashboard-v2.png`
- `agent-os/product/visuals/timeline-v2.png`
### Visual Insights:
- Design is already "close/crude", maintain cyberpunk/gaming aesthetic.
- HUD Panels are a key visual element.

## Requirements Summary
### Functional Requirements
- **Profile Management:** Edit Name, Bio (Markdown), Profile Image.
- **Contact Management:** Fixed fields (GitHub, LinkedIn, Email) + dynamic list of links.
- **Section Management:** 
    - Reorder sections: About/Bio, Experience, Skills, Projects using Arrows.
    - Toggle visibility (Show/Hide) for each section.
- **Theme Support:** Maintain existing Professional/Gaming mode toggle.

### Scope Boundaries
**In Scope:**
- Database updates for new fields.
- New UI components for the dashboard editor.
- Persistence of settings in MongoDB via Prisma.
- UI consistency with "Gaming" theme.

**Out of Scope:**
- Drag & Drop (defer to follow-up).
- Multi-user collaboration on a single portfolio.

### Technical Considerations
- **Database:** Add `Json` for links and `String[]` for order to `User`.
- **Markdown:** Use `react-markdown` or similar for preview (if implemented) or just simple text data persistence.
- **Next.js 16:** Maintain RSC boundaries and server actions.
