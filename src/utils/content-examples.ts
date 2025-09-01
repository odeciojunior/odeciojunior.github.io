/**
 * Example usage of multilingual content utilities
 * 
 * This file demonstrates how to use the content utility functions
 * in your Astro pages and components.
 */

import type { APIContext } from "astro";
import {
  getAllPosts,
  getPostsByLocale,
  getFeaturedPostsByLocale,
  getPostsByTagAndLocale,
  getPostAlternates,
  getLocaleFromPath,
  getLocalizedPath,
  searchPostsByLocale,
  getTagsByLocale,
  sortPostsByDate,
} from "./content";

// Example 1: Get all posts for a specific locale in a page
export async function getPostsForBlogIndex(locale: "pt-BR" | "en-US") {
  const posts = await getPostsByLocale(locale);
  return sortPostsByDate(posts);
}

// Example 2: Get featured posts for homepage
export async function getFeaturedPostsForHomepage(locale: "pt-BR" | "en-US") {
  return await getFeaturedPostsByLocale(locale);
}

// Example 3: Get posts by tag for tag pages
export async function getPostsForTagPage(tag: string, locale: "pt-BR" | "en-US") {
  return await getPostsByTagAndLocale(tag, locale);
}

// Example 4: API route to get posts dynamically
export async function GET({ params, request }: APIContext) {
  const url = new URL(request.url);
  const locale = getLocaleFromPath(url.pathname);
  const tag = url.searchParams.get("tag");
  const search = url.searchParams.get("search");

  let posts;

  if (search) {
    posts = await searchPostsByLocale(search, locale);
  } else if (tag) {
    posts = await getPostsByTagAndLocale(tag, locale);
  } else {
    posts = await getPostsByLocale(locale);
  }

  return new Response(JSON.stringify({
    posts: sortPostsByDate(posts),
    locale,
    total: posts.length,
  }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Example 5: Get alternate versions of a post for language switcher
export async function getAlternateVersions(currentPost: any) {
  const alternates = await getPostAlternates(currentPost);
  
  // Build language switcher data
  const languageSwitcher = Object.entries(alternates).map(([locale, post]) => ({
    locale,
    label: locale === 'pt-BR' ? 'Português' : 'English',
    url: post ? getLocalizedPath(`/blog/${post.slug}`, locale as any) : null,
    available: !!post,
  }));

  return languageSwitcher;
}

// Example 6: Generate sitemap with multilingual support
export async function generateMultilingualSitemap() {
  const allPosts = await getAllPosts();
  const sitemapEntries = [];

  for (const post of allPosts) {
    const alternates = await getPostAlternates(post);
    
    // Main entry
    sitemapEntries.push({
      url: getLocalizedPath(`/blog/${post.slug}`, post.data.locale!),
      locale: post.data.locale,
      alternates: Object.entries(alternates)
        .filter(([, altPost]) => altPost)
        .map(([locale, altPost]) => ({
          locale,
          url: getLocalizedPath(`/blog/${altPost!.slug}`, locale as any),
        })),
    });
  }

  return sitemapEntries;
}

// Example 7: Search functionality with locale support
export async function createSearchIndex() {
  const locales: ("pt-BR" | "en-US")[] = ['pt-BR', 'en-US'];
  const searchIndex: Record<string, any[]> = {};

  for (const locale of locales) {
    const posts = await getPostsByLocale(locale);
    searchIndex[locale] = posts.map(post => ({
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      content: post.body, // You might want to extract/clean this
    }));
  }

  return searchIndex;
}

// Example 8: Generate tag cloud for each locale
export async function generateTagClouds() {
  const locales: ("pt-BR" | "en-US")[] = ['pt-BR', 'en-US'];
  const tagClouds: Record<string, Array<{ tag: string; count: number }>> = {};

  for (const locale of locales) {
    const tags = await getTagsByLocale(locale);
    const tagCounts: Record<string, number> = {};
    
    const posts = await getPostsByLocale(locale);
    posts.forEach(post => {
      post.data.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    tagClouds[locale] = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  return tagClouds;
}

// Example 9: Recent posts component data
export async function getRecentPostsData(locale: "pt-BR" | "en-US", limit = 5) {
  const posts = await getPostsByLocale(locale);
  const sortedPosts = sortPostsByDate(posts);
  
  return sortedPosts.slice(0, limit).map(post => ({
    title: post.data.title,
    slug: post.slug,
    pubDate: post.data.pubDatetime,
    url: getLocalizedPath(`/blog/${post.slug}`, locale),
  }));
}

// Example 10: Archive page data
export async function getArchiveData(locale: "pt-BR" | "en-US") {
  const posts = await getPostsByLocale(locale);
  const sortedPosts = sortPostsByDate(posts);
  
  // Group by year and month
  const archive: Record<string, Record<string, typeof posts>> = {};
  
  sortedPosts.forEach(post => {
    const date = new Date(post.data.pubDatetime);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    
    if (!archive[year]) archive[year] = {};
    if (!archive[year][month]) archive[year][month] = [];
    
    archive[year][month].push(post);
  });

  return archive;
}