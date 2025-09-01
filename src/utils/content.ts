import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/content.config";

// Type definitions for multilingual content
export type BlogPost = CollectionEntry<"blog"> | CollectionEntry<"blog-pt-BR"> | CollectionEntry<"blog-en-US">;

export interface LocalizedPost {
  slug: string;
  id: string;
  collection: string;
  data: BlogPost['data'] & {
    locale?: Locale;
    language?: string;
    alternates?: Record<string, string>;
  };
  body: string;
  render: () => Promise<{
    Content: any;
    headings: Array<{ depth: number; slug: string; text: string }>;
    remarkPluginFrontmatter: Record<string, any>;
  }>;
}

/**
 * Get all blog posts from all collections
 */
export async function getAllPosts(): Promise<LocalizedPost[]> {
  const [legacyPosts, ptBRPosts, enUSPosts] = await Promise.all([
    getCollection("blog"),
    getCollection("blog-pt-BR"),
    getCollection("blog-en-US"),
  ]);

  // Add default locale to legacy posts
  const legacyPostsWithLocale = legacyPosts.map(post => ({
    ...post,
    data: {
      ...post.data,
      locale: 'pt-BR' as Locale,
      language: 'pt',
    }
  }));

  // Add locale metadata to collection posts if missing
  const ptBRPostsWithLocale = ptBRPosts.map(post => ({
    ...post,
    data: {
      ...post.data,
      locale: post.data.locale || 'pt-BR' as Locale,
      language: post.data.language || 'pt',
    }
  }));

  const enUSPostsWithLocale = enUSPosts.map(post => ({
    ...post,
    data: {
      ...post.data,
      locale: post.data.locale || 'en-US' as Locale,
      language: post.data.language || 'en',
    }
  }));

  return [
    ...legacyPostsWithLocale,
    ...ptBRPostsWithLocale,
    ...enUSPostsWithLocale,
  ] as LocalizedPost[];
}

/**
 * Get posts filtered by locale
 */
export async function getPostsByLocale(locale: Locale): Promise<LocalizedPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.data.locale === locale);
}

/**
 * Get posts filtered by language (ISO code)
 */
export async function getPostsByLanguage(language: string): Promise<LocalizedPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.data.language === language);
}

/**
 * Get published posts by locale (excluding drafts)
 */
export async function getPublishedPostsByLocale(locale: Locale): Promise<LocalizedPost[]> {
  const posts = await getPostsByLocale(locale);
  return posts.filter(post => !post.data.draft);
}

/**
 * Get featured posts by locale
 */
export async function getFeaturedPostsByLocale(locale: Locale): Promise<LocalizedPost[]> {
  const posts = await getPostsByLocale(locale);
  return posts.filter(post => post.data.featured && !post.data.draft);
}

/**
 * Get posts by tag and locale
 */
export async function getPostsByTagAndLocale(tag: string, locale: Locale): Promise<LocalizedPost[]> {
  const posts = await getPostsByLocale(locale);
  return posts.filter(post => 
    post.data.tags?.includes(tag) && !post.data.draft
  );
}

/**
 * Find alternate language versions of a post
 */
export async function getPostAlternates(post: LocalizedPost): Promise<Record<Locale, LocalizedPost | null>> {
  const allPosts = await getAllPosts();
  const alternates: Record<string, LocalizedPost | null> = {};

  if (post.data.alternates) {
    for (const [locale, slug] of Object.entries(post.data.alternates)) {
      const alternatePost = allPosts.find(p => 
        p.data.locale === locale && p.slug === slug
      );
      alternates[locale] = alternatePost || null;
    }
  }

  return alternates as Record<Locale, LocalizedPost | null>;
}

/**
 * Get the default locale for the site
 */
export function getDefaultLocale(): Locale {
  return 'pt-BR'; // Brazilian Portuguese as default
}

/**
 * Get supported locales
 */
export function getSupportedLocales(): Locale[] {
  return ['pt-BR', 'en-US'];
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return getSupportedLocales().includes(locale as Locale);
}

/**
 * Get locale from URL pathname
 * Examples: /en/blog/post -> en-US, /blog/post -> pt-BR (default)
 */
export function getLocaleFromPath(pathname: string): Locale {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Map path segments to full locale codes
  const localeMap: Record<string, Locale> = {
    'en': 'en-US',
    'pt': 'pt-BR',
    'pt-br': 'pt-BR',
    'en-us': 'en-US',
  };

  if (firstSegment && localeMap[firstSegment.toLowerCase()]) {
    return localeMap[firstSegment.toLowerCase()];
  }

  return getDefaultLocale();
}

/**
 * Generate localized URL path
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  const defaultLocale = getDefaultLocale();
  
  // Don't add locale prefix for default locale
  if (locale === defaultLocale) {
    return path;
  }

  const localePrefix = locale === 'en-US' ? '/en' : `/${locale.toLowerCase()}`;
  return `${localePrefix}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Sort posts by publication date (newest first)
 */
export function sortPostsByDate(posts: LocalizedPost[]): LocalizedPost[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.data.modDatetime || a.data.pubDatetime);
    const dateB = new Date(b.data.modDatetime || b.data.pubDatetime);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Get recent posts by locale
 */
export async function getRecentPostsByLocale(locale: Locale, limit = 5): Promise<LocalizedPost[]> {
  const posts = await getPublishedPostsByLocale(locale);
  const sortedPosts = sortPostsByDate(posts);
  return sortedPosts.slice(0, limit);
}

/**
 * Search posts by title or description within a locale
 */
export async function searchPostsByLocale(
  query: string, 
  locale: Locale
): Promise<LocalizedPost[]> {
  const posts = await getPublishedPostsByLocale(locale);
  const lowerQuery = query.toLowerCase();

  return posts.filter(post => 
    post.data.title.toLowerCase().includes(lowerQuery) ||
    post.data.description.toLowerCase().includes(lowerQuery) ||
    post.data.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get unique tags from posts in a specific locale
 */
export async function getTagsByLocale(locale: Locale): Promise<string[]> {
  const posts = await getPublishedPostsByLocale(locale);
  const allTags = posts.flatMap(post => post.data.tags || []);
  return [...new Set(allTags)].sort();
}

/**
 * Get post count by tag for a specific locale
 */
export async function getTagCountsByLocale(locale: Locale): Promise<Record<string, number>> {
  const posts = await getPublishedPostsByLocale(locale);
  const tagCounts: Record<string, number> = {};

  posts.forEach(post => {
    post.data.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return tagCounts;
}