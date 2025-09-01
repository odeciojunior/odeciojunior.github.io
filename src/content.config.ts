import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";

// Supported locales
export const LOCALES = ['pt-BR', 'en-US'] as const;
export type Locale = typeof LOCALES[number];

// Base blog schema with locale support
const blogSchema = ({ image }: { image: any }) =>
  z.object({
    author: z.string().default(SITE.author),
    pubDatetime: z.date(),
    modDatetime: z.date().optional().nullable(),
    title: z.string(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).default(["others"]),
    ogImage: image().or(z.string()).optional(),
    description: z.string(),
    canonicalURL: z.string().optional(),
    hideEditPost: z.boolean().optional(),
    timezone: z.string().optional(),
    locale: z.enum(['pt-BR', 'en-US']).optional(),
    // Language-specific metadata
    language: z.string().optional(), // ISO language code (pt, en)
    alternates: z.record(z.string()).optional(), // { "en-US": "slug-in-english", "pt-BR": "slug-in-portuguese" }
  });

// Create locale-specific collections
const blogPtBR = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}/pt-BR` }),
  schema: blogSchema,
});

const blogEnUS = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}/en-US` }),
  schema: blogSchema,
});

// Legacy blog collection for backwards compatibility
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: blogSchema,
});

export const collections = { 
  blog,
  'blog-pt-BR': blogPtBR,
  'blog-en-US': blogEnUS,
};
