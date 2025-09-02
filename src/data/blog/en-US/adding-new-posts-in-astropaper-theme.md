---
author: Sat Naing
pubDatetime: 2022-09-23T15:22:00Z
modDatetime: 2025-06-13T16:52:45.934Z
title: Adding new posts in AstroPaper theme
slug: adding-new-posts-in-astropaper-theme
featured: true
draft: false
tags:
  - docs
  - tutorial
locale: en
language: en
alternates:
  pt: adicionando-novos-posts-tema-astropaper
description:
  Some rules & recommendations for creating or adding new posts using AstroPaper theme.
---

Here are some rules/recommendations, tips & tricks for creating new posts in AstroPaper blog theme.

<figure>
  <img
    src="https://images.pexels.com/photos/159618/still-life-school-retro-ink-159618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    alt="A vintage typewriter with paper"
    title="Writing new content"
  />
  <figcaption>Creating new content with AstroPaper theme</figcaption>
</figure>

## Table of contents

## Frontmatter

Frontmatter is one of the most important things in your post file. Frontmatter contains all the metadata about your post. AstroPaper uses Astro's content collections to manage blog content.

### Required Properties

- **title**: The title of your post
- **author**: Author of the post (defaults to site author)
- **pubDatetime**: Publication date and time
- **description**: Brief description of the post content

### Optional Properties

- **featured**: Whether this post is featured (boolean)
- **draft**: Whether this post is a draft (boolean)
- **tags**: Array of tags for categorization
- **ogImage**: Open Graph image for social sharing
- **canonicalURL**: Canonical URL if republishing content
- **modDatetime**: Last modification date
- **hideEditPost**: Hide the edit post button
- **timezone**: Timezone for the post

### Multilingual Properties

- **locale**: Language locale (pt-BR, en-US)
- **language**: ISO language code (pt, en)
- **alternates**: Object mapping locales to their corresponding slugs

## File Structure

Posts should be organized in locale-specific directories:

```
src/data/blog/
├── pt-BR/
│   ├── post-in-portuguese.md
│   └── code/
│       └── technical-post-pt.md
└── en-US/
    ├── post-in-english.md
    └── code/
        └── technical-post-en.md
```

## Writing Guidelines

1. Use clear, descriptive titles
2. Include relevant tags
3. Write comprehensive descriptions
4. Add proper locale metadata
5. Link related posts across languages using alternates

## Best Practices

- Keep posts focused on a single topic
- Use headings to structure content
- Include code examples when relevant
- Add images with proper alt text
- Cross-reference related content in other languages

That's it! You're now ready to create multilingual content with AstroPaper.