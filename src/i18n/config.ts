export const LANGUAGES = {
  'en': 'English',
  'pt': 'Português',
} as const;

export type Language = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES) as Language[];

// URL path mapping for locales (matching Astro config with prefixDefaultLocale: true)
export const LOCALE_PATHS = {
  'en': '/en', // Default locale with prefix (prefixDefaultLocale: true)
  'pt': '/pt',
} as const;

// Reverse mapping for path to locale
export const PATH_TO_LOCALE = {
  '/en': 'en',
  '/pt': 'pt',
} as const;

// Default routes that don't need locale prefix (redirect to default language)
export const DEFAULT_ROUTES = [
  '/',
  '/blog',
  '/about',
  '/contact',
] as const;

// Configuration for Astro i18n
export const I18N_CONFIG = {
  defaultLocale: DEFAULT_LANGUAGE,
  locales: SUPPORTED_LANGUAGES,
  routing: {
    prefixDefaultLocale: true, // Match Astro config: en at /en, pt at /pt
    strategy: 'pathname',
  },
  fallbackLocale: DEFAULT_LANGUAGE,
} as const;

// Date formatting options for each locale
export const DATE_FORMATS: Record<Language, Intl.DateTimeFormatOptions> = {
  'en': {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  'pt': {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
};

// Number formatting options for each locale
export const NUMBER_FORMATS: Record<Language, Intl.NumberFormatOptions> = {
  'en': {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  'pt': {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
};

// Metadata for each language
export const LANGUAGE_METADATA: Record<Language, {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}> = {
  'en': {
    code: 'en-US',
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  'pt': {
    code: 'pt-BR',
    name: 'Português',
    direction: 'ltr',
    flag: '🇧🇷',
  },
};