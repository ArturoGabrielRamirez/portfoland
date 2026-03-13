# Specification: Advanced Theme System (Spec 4H)

## Goal

Extend the current theme preset functionality by introducing a **Custom Theme Builder**. Users will be able to opt out of the presets and define their own exact colors (Background, Text, Primary Accent, Card, Border) and Typography for Classic Mode portfolios.

## User Stories

- As a portfolio owner with a strong personal brand, I want to use my exact hex codes for my portfolio colors rather than relying on predefined presets.
- As a creative professional, I want to see a live preview of my color choices as I adjust them in the dashboard.

## Specific Requirements

**1. DB Migration & Types**
- **Model:** Add `customTheme Json?` to `PortfolioSettings` in `prisma/schema.prisma`.
- **Type Structure:** `customTheme` will store an object matching the `ThemePreset` shape (minus `id` and `name`): 
  `{ backgroundColor: string, textColor: string, accentColor: string, borderColor: string, cardBackground: string, fontFamily: string }`
- **Validation:** Extend `updatePortfolioSettingsSchema` and `UpdatePortfolioSettingsInput` to allow `customTheme?: Record<string, string> | null`.
- **Database:** Run `npx prisma db push` to apply changes.

**2. Theme Resolution Logic**
- Update the layout templates (`SectionsTemplate.tsx`, `OnePageTemplate.tsx`) to check for custom themes.
- If `data.settings?.theme === 'custom'` and `data.settings?.customTheme` exists, use the `customTheme` values to generate the CSS variables (`--portfolio-bg`, `--portfolio-text`, etc.).
- Otherwise, fall back to the existing `THEME_PRESETS` dictionary.

**3. Dashboard UI: Custom Theme Builder**
- In `DashboardPortfolioView.tsx`, update the Theme section to have a toggle or tabs: **Presets** vs **Custom**.
- Create a new component `features/portfolio-settings/components/CustomThemeBuilder.tsx`.
- The builder should include standard `<input type="color">` pickers (or a specialized color picker component) for:
  - Background Color
  - Text Color
  - Accent/Primary Color
  - Card/Surface Color
  - Border Color
- Include a `<select>` for Font Family (e.g., Inter, Roboto, Playfair Display, Fira Code).
- Changes in the builder should be saved via `updatePortfolioSettingsAction({ theme: 'custom', customTheme: newThemeObj })`.

**4. Server Action Integration**
- The existing `updatePortfolioSettingsAction` already accepts partial updates. Ensure it correctly passes the `customTheme` object to the service.
- The service `updatePortfolioSettingsService` should allow `theme` to be `"custom"` alongside the existing valid preset IDs.

## Out of Scope
- Custom fonts via uploading actual `.woff2` font files (we will use Google Fonts / web safe fonts only).
- Applying custom colors to Tech Mode or Terminal Mode (those remain heavily cyberpunk/CRT themed).
- Light/Dark mode toggles within the custom theme (the user defines one absolute color palette).
- Border radius mapping (we will stick to colors and typography for this spec).
