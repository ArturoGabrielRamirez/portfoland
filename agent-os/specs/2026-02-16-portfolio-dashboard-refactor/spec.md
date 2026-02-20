# Specification: Portfolio Dashboard Refactor

## Goal
Refactor and complete the Portfolio Dashboard editor to provide a comprehensive and intuitive interface for managing personal portfolios, focusing on content organization, contact accessibility, and visibility control.

## User Stories
- As a user, I want to edit my bio with Markdown formatting so that I can tell my professional story with rich styling.
- As a user, I want to reorder my portfolio sections (About, Skills, etc.) using simple arrows so that I can prioritize my most relevant achievements.
- As a user, I want to manage my social links (fixed and custom) so that visitors can easily find me on other platforms.
- As a user, I want to toggle the visibility of specific sections so that I can hide drafts or irrelevant content.

## Specific Requirements

**Markdown Bio Editor**
- Replace the plain text bio field with a Markdown-compatible textarea.
- Maintain existing character limits (500 characters).
- Ensure the public portfolio correctly renders Markdown.

**Section Ordering (HUD Panels)**
- Group sections (About/Bio, Experience, Skills, Projects) into individual HUD Panels.
- Add "Move Up" and "Move Down" buttons (arrows) to each panel title bar.
- Persist order in the database via `sectionOrder: String[]`.

**Contact Information Management**
- Add specific fields for GitHub, LinkedIn, and Email URLs.
- Implement a dynamic "Add Custom Link" system to support any URL/Label combination.
- Persist links in a `contactLinks: Json` field in the User model.

**Section Visibility Toggles**
- Add a "Show/Hide" toggle switch to each HUD Panel.
- Use the toggle state to conditionally render sections on the public portfolio.
- Persist visibility in the database.

**UI Consistency (Gaming Theme)**
- Use the established HUD styling (colors, borders, glows) from the `ExperienceForm` component.
- Maintain consistency with the Cyberpunk/Gaming aesthetic of Portfoland.

## Visual Design
**`agent-os/product/visuals/dashboard-v2.png`**
- High-fidelity dashboard UI with glowing blue/teal highlights.
- Neon borders and mono typography consistent with the "Gaming" theme.
**`agent-os/product/visuals/timeline-v2.png`**
- Card-based layout with prominent headers and section-specific colors.
- "HUD" panel appearance with technical, informative border details.

## Existing Code to Leverage
**ExperienceForm**
- Path: `features/timeline/components/ExperienceForm.tsx`
- Leverage the "HUD" panel layout, save-on-submit logic, and form field styling.
**DashboardNav**
- Path: `features/gaming/components/DashboardNav.tsx`
- Maintain existing navigation context and user profile summary.

## Out of Scope
- Drag & Drop reordering (Phase 3 requirement specified simple arrows).
- Multi-column section layouts.
- Advanced Bio rich-text WYSIWYG editor (Markdown only).
