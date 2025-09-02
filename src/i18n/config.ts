export const LANGUAGES = {
  'en-US': 'English',
  'pt-BR': 'Português',
} as const;

export type Language = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: Language = 'en-US';

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES) as Language[];

// URL path mapping for locales (matching Astro config with prefixDefaultLocale: true)
export const LOCALE_PATHS = {
  'en-US': '/en', // Default locale now has prefix (prefixDefaultLocale: true)
  'pt-BR': '/pt',
} as const;

// Reverse mapping for path to locale
export const PATH_TO_LOCALE = {
  '/en': 'en-US',
  '/pt': 'pt-BR',
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
    prefixDefaultLocale: true, // Match Astro config: en-US at /en, pt-BR at /pt
    strategy: 'pathname',
  },
  fallbackLocale: DEFAULT_LANGUAGE,
} as const;

// Date formatting options for each locale
export const DATE_FORMATS: Record<Language, Intl.DateTimeFormatOptions> = {
  'en-US': {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  'pt-BR': {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
};

// Number formatting options for each locale
export const NUMBER_FORMATS: Record<Language, Intl.NumberFormatOptions> = {
  'en-US': {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  'pt-BR': {
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
  'en-US': {
    code: 'en-US',
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português',
    direction: 'ltr',
    flag: '🇧🇷',
  },
};