import { 
  DEFAULT_LANGUAGE, 
  SUPPORTED_LANGUAGES,
  type Language 
} from '../config';
import { 
  getLanguageFromURL, 
  addLanguagePrefix, 
  detectLanguage,
  isSupportedLanguage 
} from './index';

/**
 * Middleware function to handle i18n routing
 * This should be used in Astro middleware
 */
export function i18nMiddleware(request: Request): Response | void {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip middleware for assets and API routes
  if (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return;
  }
  
  const currentLang = getLanguageFromURL(pathname);
  
  // If no language prefix is detected, redirect to the appropriate language
  if (currentLang === DEFAULT_LANGUAGE && !pathname.startsWith('/en')) {
    const detectedLang = detectLanguage(pathname);
    const newPathname = addLanguagePrefix(pathname, detectedLang);
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}${newPathname}${url.search}${url.hash}`,
      },
    });
  }
  
  // If unsupported language, redirect to default
  if (!isSupportedLanguage(currentLang)) {
    const newPathname = addLanguagePrefix(pathname.replace(/^\/[^\/]+/, ''), DEFAULT_LANGUAGE);
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}${newPathname}${url.search}${url.hash}`,
      },
    });
  }
}

/**
 * Generate static paths for all supported languages
 * Use this function in getStaticPaths for dynamic routes
 */
export function generateI18nPaths<T extends Record<string, any>>(
  paths: T[]
): Array<T & { params: { lang: Language } }> {
  return SUPPORTED_LANGUAGES.flatMap(lang =>
    paths.map(path => ({
      ...path,
      params: {
        ...path.params,
        lang,
      },
    }))
  );
}

/**
 * Get language-specific static paths for a given set of paths
 */
export function getLanguageStaticPaths(
  basePaths: string[]
): Array<{ params: { lang: Language }; props: { path: string } }> {
  return SUPPORTED_LANGUAGES.flatMap(lang =>
    basePaths.map(path => ({
      params: { lang },
      props: { path },
    }))
  );
}

/**
 * Validate language parameter in Astro pages
 */
export function validateLanguageParam(lang: string | undefined): Language {
  if (!lang || !isSupportedLanguage(lang)) {
    return DEFAULT_LANGUAGE;
  }
  return lang;
}

/**
 * Generate canonical URLs for SEO
 */
export function getCanonicalURL(
  baseURL: string, 
  pathname: string, 
  lang: Language
): string {
  const cleanPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  const langPrefix = lang === DEFAULT_LANGUAGE ? '/en' : (lang === 'pt-BR' ? '/pt' : '');
  
  return `${baseURL}${langPrefix}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Generate hreflang links for SEO
 */
export function getHreflangLinks(
  baseURL: string, 
  pathname: string
): Array<{ hreflang: string; href: string }> {
  const cleanPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  
  const links = SUPPORTED_LANGUAGES.map(lang => ({
    hreflang: lang.toLowerCase(),
    href: getCanonicalURL(baseURL, cleanPath, lang),
  }));
  
  // Add x-default for the default language
  links.push({
    hreflang: 'x-default',
    href: getCanonicalURL(baseURL, cleanPath, DEFAULT_LANGUAGE),
  });
  
  return links;
}

/**
 * Get Open Graph locale for a given language
 */
export function getOGLocale(lang: Language): string {
  const localeMap: Record<Language, string> = {
    'en-US': 'en_US',
    'pt-BR': 'pt_BR',
  };
  
  return localeMap[lang] || 'en_US';
}

/**
 * Get alternate Open Graph locales
 */
export function getOGAlternateLocales(currentLang: Language): string[] {
  return SUPPORTED_LANGUAGES
    .filter(lang => lang !== currentLang)
    .map(lang => getOGLocale(lang));
}