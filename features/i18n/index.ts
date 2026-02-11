// =============================================================================
// Internationalization Feature Exports
// =============================================================================
// Central export point for i18n-related components, hooks, and utilities.
// =============================================================================

// =============================================================================
// Components
// =============================================================================

export { LocaleDisplay } from './components/LocaleDisplay'
export { LanguageSwitcher } from './components/LanguageSwitcher'

// =============================================================================
// Actions
// =============================================================================

export { updateUserLocale } from './actions/updateUserLocale'

// =============================================================================
// Types
// =============================================================================

export type {
  LocaleDisplayProps,
  WithLocaleProps,
  LanguageSwitcherProps,
  LanguageOption,
} from './types/locale'
