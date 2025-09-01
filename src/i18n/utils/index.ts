import { 
  DEFAULT_LANGUAGE, 
  SUPPORTED_LANGUAGES, 
  LOCALE_PATHS, 
  PATH_TO_LOCALE,
  DATE_FORMATS,
  NUMBER_FORMATS,
  LANGUAGE_METADATA,
  type Language 
} from '../config';

// Re-export Language type for use in other modules
export type { Language } from '../config';

// Import translations
import enUS from '../locales/en-US.json';
import ptBR from '../locales/pt-BR.json';

const translations = {
  'en-US': enUS,
  'pt-BR': ptBR,
} as const;

/**
 * Get the current language from URL pathname
 */
export function getLanguageFromURL(pathname: string): Language {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = `/${pathSegments[0]}`;
  
  return PATH_TO_LOCALE[firstSegment as keyof typeof PATH_TO_LOCALE] || DEFAULT_LANGUAGE;
}

/**
 * Get the path prefix for a given language
 */
export function getLanguagePath(lang: Language): string {
  return LOCALE_PATHS[lang];
}

/**
 * Remove language prefix from pathname
 */
export function removeLanguagePrefix(pathname: string): string {
  const lang = getLanguageFromURL(pathname);
  const prefix = getLanguagePath(lang);
  
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length) || '/';
  }
  
  return pathname;
}

/**
 * Add language prefix to pathname
 */
export function addLanguagePrefix(pathname: string, lang: Language): string {
  const prefix = getLanguagePath(lang);
  const cleanPath = removeLanguagePrefix(pathname);
  
  return `${prefix}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Get translation for a given key and language
 */
export function getTranslation(lang: Language, key: string, variables: Record<string, string | number> = {}): string {
  const keys = key.split('.');
  let translation: any = translations[lang];
  
  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // Fallback to default language
      translation = translations[DEFAULT_LANGUAGE];
      for (const fallbackKey of keys) {
        if (translation && typeof translation === 'object' && fallbackKey in translation) {
          translation = translation[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  if (typeof translation !== 'string') {
    return key;
  }
  
  // Replace variables in translation
  return translation.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return String(variables[variable] || match);
  });
}

/**
 * Create translation function for a specific language
 */
export function createTranslator(lang: Language) {
  return (key: string, variables: Record<string, string | number> = {}) => {
    return getTranslation(lang, key, variables);
  };
}

/**
 * Get all available languages with metadata
 */
export function getAvailableLanguages() {
  return SUPPORTED_LANGUAGES.map(lang => ({
    code: lang,
    name: LANGUAGE_METADATA[lang].name,
    flag: LANGUAGE_METADATA[lang].flag,
    path: LOCALE_PATHS[lang],
  }));
}

/**
 * Get the opposite language (useful for language switcher)
 */
export function getAlternativeLanguage(currentLang: Language): Language {
  return currentLang === 'en-US' ? 'pt-BR' : 'en-US';
}

/**
 * Generate alternate URLs for the same page in different languages
 */
export function getAlternateURLs(pathname: string): Record<Language, string> {
  const cleanPath = removeLanguagePrefix(pathname);
  
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = addLanguagePrefix(cleanPath, lang);
    return acc;
  }, {} as Record<Language, string>);
}

/**
 * Format date according to language locale
 */
export function formatDate(date: Date | string, lang: Language, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatOptions = options || DATE_FORMATS[lang];
  
  return new Intl.DateTimeFormat(lang, formatOptions).format(dateObj);
}

/**
 * Format number according to language locale
 */
export function formatNumber(number: number, lang: Language, options?: Intl.NumberFormatOptions): string {
  const formatOptions = options || NUMBER_FORMATS[lang];
  
  return new Intl.NumberFormat(lang, formatOptions).format(number);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string, lang: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const t = createTranslator(lang);
  
  if (diffInSeconds < 60) {
    return t('time.justNow');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return t('time.minutesAgo', { count: diffInMinutes });
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t('time.hoursAgo', { count: diffInHours });
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return t('time.daysAgo', { count: diffInDays });
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return t('time.weeksAgo', { count: diffInWeeks });
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return t('time.monthsAgo', { count: diffInMonths });
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return t('time.yearsAgo', { count: diffInYears });
}

/**
 * Shorthand alias for getTranslation
 */
export const t = getTranslation;

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

/**
 * Get browser preferred language that matches our supported languages
 */
export function getBrowserLanguage(): Language {
  if (typeof navigator !== 'undefined') {
    const browserLangs = navigator.languages || [navigator.language];
    
    for (const browserLang of browserLangs) {
      // Check exact match first
      if (isSupportedLanguage(browserLang)) {
        return browserLang;
      }
      
      // Check language prefix match (e.g., "pt" matches "pt-BR")
      const langPrefix = browserLang.split('-')[0];
      const matchingLang = SUPPORTED_LANGUAGES.find(lang => lang.startsWith(langPrefix));
      if (matchingLang) {
        return matchingLang;
      }
    }
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Store language preference in localStorage
 */
export function storeLanguagePreference(lang: Language): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('preferredLanguage', lang);
  }
}

/**
 * Get stored language preference from localStorage
 */
export function getStoredLanguagePreference(): Language | null {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('preferredLanguage');
    return stored && isSupportedLanguage(stored) ? stored : null;
  }
  return null;
}

/**
 * Detect the best language to use based on URL, stored preference, and browser
 */
export function detectLanguage(pathname: string): Language {
  // 1. Check URL first (highest priority)
  const urlLang = getLanguageFromURL(pathname);
  if (urlLang !== DEFAULT_LANGUAGE) {
    return urlLang;
  }
  
  // 2. Check stored preference
  const storedLang = getStoredLanguagePreference();
  if (storedLang) {
    return storedLang;
  }
  
  // 3. Check browser language
  return getBrowserLanguage();
}