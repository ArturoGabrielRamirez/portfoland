# 4H Theme System — Implementation Checklist

## TG1: DB + Types
- [x] TG1-A: Add `customTheme Json?` to `prisma/schema.prisma` `PortfolioSettings`
- [x] TG1-B: Add `customTheme?: Record<string, string> | null` to `UpdatePortfolioSettingsInput`
- [x] TG1-C: Extend `updatePortfolioSettingsSchema` with `customTheme` shape validation
- [x] TG1-D: Run `npx prisma db push` to sync MongoDB

## TG2: UI Component: CustomThemeBuilder
- [x] TG2-A: Create `features/portfolio-settings/components/CustomThemeBuilder.tsx`
- [x] TG2-B: Implement color pickers (Background, Text, Accent, Card, Border) and font family select
- [x] TG2-C: Wire up internal state and `onChange` callback emitting a `ThemePreset` formatted object

## TG3: Dashboard Integration
- [x] TG3-A: Update `DashboardPortfolioView.tsx` to handle `theme === 'custom'`
- [x] TG3-B: Add Tabs/Buttons for "Presets" vs "Custom" in the Theme preferences block
- [x] TG3-C: Render `CustomThemeBuilder` when "Custom" is active
- [x] TG3-D: Update `handleThemeSelect` to send `customTheme` payloads when saving a custom theme

## TG4: Portfolio Layout & Templates Theme Application
- [x] TG4-A: Update `PortfolioLayout.tsx` or templates to resolve CSS variables from `data.settings.customTheme` if `theme === 'custom'`
- [x] TG4-B: Apply fallback to `THEME_PRESETS['default']` if data is malformed
- [x] TG4-C: Ensure `SectionsTemplate`, `OnePageTemplate`, and `MinimalTemplate` all successfully inherit custom colors

## TG5: QA
- [ ] TG5-A: Verify DB saves `customTheme` correctly
- [ ] TG5-B: Check color pickers in the dashboard update state without lagging
- [ ] TG5-C: Test switching back to "ocean" preset clears or ignores custom theme
- [ ] TG5-D: Verify live portfolio page exact hex codes match the selected custom theme
