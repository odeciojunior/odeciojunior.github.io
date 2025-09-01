import { 
  DEFAULT_LANGUAGE, 
  SUPPORTED_LANGUAGES,
  type Language 
} from '../config';
import { 
  detectLanguage,
  isSupportedLanguage 
} from './index';

// Legacy routes that need to be redirected to locale-prefixed versions
const LEGACY_ROUTES = [
  '/posts',
  '/about', 
  '/tags',
  '/archives',
  '/search',
  '/404'
] as const;

// Dynamic legacy route patterns
const LEGACY_DYNAMIC_PATTERNS = [
  /^\/posts\/(.+)$/,        // /posts/slug or /posts/page/1
  /^\/tags\/([^\/]+)$/,     // /tags/tag-name
  /^\/tags\/([^\/]+)\/(.+)$/ // /tags/tag-name/page/1
] as const;

/**
 * Check if a pathname matches any legacy route patterns
 */
function isLegacyRoute(pathname: string): boolean {
  // Check static legacy routes
  if (LEGACY_ROUTES.includes(pathname as any)) {
    return true;
  }
  
  // Check dynamic legacy route patterns
  return LEGACY_DYNAMIC_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Middleware function to handle i18n routing and legacy route redirects
 * This should be used in Astro middleware
 * 
 * Note: With prefixDefaultLocale: false, default language (en-US) has no prefix
 * while pt-BR uses /pt prefix
 */
export function i18nMiddleware(request: Request): Response | void {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip middleware for assets and API routes
  if (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') || // Skip files with extensions
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/rss.xml') ||
    pathname.startsWith('/og.png')
  ) {
    return;
  }
  
  // Check if pathname starts with Portuguese prefix
  if (pathname.startsWith('/pt')) {
    return; // Already has Portuguese locale, let Astro handle it
  }
  
  // Check if it's a legacy route (exists in both pages/ and pages/[locale]/)
  // These should redirect based on browser/stored language preference
  if (isLegacyRoute(pathname)) {
    const detectedLang = detectLanguage(pathname);
    
    // If detected language is Portuguese, redirect to /pt prefix
    if (detectedLang === 'pt-BR') {
      const newPathname = `/pt${pathname}`;
      
      return new Response(null, {
        status: 301, // Permanent redirect for SEO
        headers: {
          Location: `${url.origin}${newPathname}${url.search}${url.hash}`,
        },
      });
    }
    
    // For English (default), no redirect needed - serve from pages/ directly
    return;
  }
  
  // Handle dynamic legacy routes (like /posts/slug, /tags/tag-name)
  const isDynamicLegacy = LEGACY_DYNAMIC_PATTERNS.some(pattern => pattern.test(pathname));
  if (isDynamicLegacy) {
    const detectedLang = detectLanguage(pathname);
    
    // If detected language is Portuguese, redirect to /pt prefix
    if (detectedLang === 'pt-BR') {
      const newPathname = `/pt${pathname}`;
      
      return new Response(null, {
        status: 301, // Permanent redirect for SEO
        headers: {
          Location: `${url.origin}${newPathname}${url.search}${url.hash}`,
        },
      });
    }
    
    // For English (default), no redirect needed
    return;
  }
  
  // Handle unsupported language prefixes (anything that's not /pt)
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && pathSegments[0].length === 2 && pathSegments[0] !== 'pt') {
    const pathWithoutLang = pathname.replace(/^\/[^\/]+/, '');
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}${pathWithoutLang || '/'}${url.search}${url.hash}`,
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