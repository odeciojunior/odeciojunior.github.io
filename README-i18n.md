# Internationalization (i18n) Configuration

This project supports internationalization with English (en-US) and Portuguese (pt-BR) locales. The i18n system is built following Astro best practices.

## File Structure

```
src/
├── i18n/
│   ├── config.ts              # Main i18n configuration
│   ├── locales/               # Translation files
│   │   ├── en-US.json        # English translations
│   │   └── pt-BR.json        # Portuguese translations
│   └── utils/                 # Helper functions
│       ├── index.ts          # Main utilities
│       └── middleware.ts     # Routing middleware
├── middleware.ts             # Astro middleware
├── components/
│   ├── LanguageSwitcher.astro # Language switcher component
│   └── Navigation.astro       # Navigation with i18n support
└── layouts/
    └── BaseLayout.astro       # Base layout with SEO and i18n
```

## URL Structure

- **English**: `/en/` (default locale)
- **Portuguese**: `/pt/`

Examples:
- English: `/en/`, `/en/blog`, `/en/about`
- Portuguese: `/pt/`, `/pt/blog`, `/pt/sobre`

## Configuration

### Main Configuration (`src/i18n/config.ts`)

```typescript
export const LANGUAGES = {
  'en-US': 'English',
  'pt-BR': 'Português',
} as const;

export const DEFAULT_LANGUAGE: Language = 'en-US';
```

### Astro Configuration (`astro.config.ts`)

```typescript
export default defineConfig({
  i18n: {
    defaultLocale: "en-US",
    locales: ["en-US", "pt-BR"],
    routing: {
      prefixDefaultLocale: true,
      strategy: "pathname"
    }
  },
});
```

## Usage

### In Astro Components

```astro
---
import { getLanguageFromURL, createTranslator } from '../i18n/utils';

const { pathname } = Astro.url;
const currentLang = getLanguageFromURL(pathname);
const t = createTranslator(currentLang);
---

<h1>{t('navigation.home')}</h1>
<p>{t('blog.readingTime', { minutes: 5 })}</p>
```

### Helper Functions

#### Translation
```typescript
import { createTranslator, getTranslation } from '../i18n/utils';

const t = createTranslator('en-US');
const title = t('blog.title'); // "Blog"

// With variables
const readTime = t('blog.readingTime', { minutes: 5 }); // "5 min read"
```

#### URL Management
```typescript
import { addLanguagePrefix, getAlternateURLs } from '../i18n/utils';

// Add language prefix
const localizedPath = addLanguagePrefix('/blog', 'pt-BR'); // "/pt/blog"

// Get alternate URLs for language switcher
const alternates = getAlternateURLs('/en/blog');
// { 'en-US': '/en/blog', 'pt-BR': '/pt/blog' }
```

#### Date and Number Formatting
```typescript
import { formatDate, formatNumber } from '../i18n/utils';

const date = formatDate(new Date(), 'pt-BR'); // "1 de setembro de 2025"
const number = formatNumber(1234.56, 'en-US'); // "1,234.56"
```

## Components

### Language Switcher

The `LanguageSwitcher` component provides an accessible dropdown for language selection:

```astro
---
import LanguageSwitcher from '../components/LanguageSwitcher.astro';
---

<LanguageSwitcher />
```

Features:
- Accessible dropdown with ARIA labels
- Flag icons for visual identification
- Automatic language preference storage
- Responsive design with dark mode support

### Navigation

The `Navigation` component includes i18n-aware navigation:

```astro
---
import Navigation from '../components/Navigation.astro';
---

<Navigation />
```

Features:
- Localized navigation labels
- Current page indication
- Mobile-responsive menu
- Language switcher integration

## SEO Features

### Hreflang Tags
Automatically generated for better search engine indexing:

```html
<link rel="alternate" hreflang="en-us" href="https://example.com/en/page" />
<link rel="alternate" hreflang="pt-br" href="https://example.com/pt/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
```

### Canonical URLs
Proper canonical URLs for each language version:

```html
<link rel="canonical" href="https://example.com/en/blog" />
```

### Open Graph
Language-specific Open Graph metadata:

```html
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="pt_BR" />
```

## Translation Structure

### Common Patterns

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "back": "Back"
  },
  "navigation": {
    "home": "Home",
    "blog": "Blog"
  },
  "blog": {
    "readingTime": "{{minutes}} min read",
    "publishedOn": "Published on {{date}}"
  }
}
```

### Variable Interpolation

Use `{{variable}}` syntax for dynamic content:

```json
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "{{count}} items found"
}
```

## Language Detection

The system detects language preference in this order:

1. **URL path** (highest priority)
2. **Stored preference** (localStorage)
3. **Browser language**
4. **Default language** (en-US)

## Best Practices

### 1. Translation Keys
Use nested keys for organization:
```typescript
t('blog.post.readMore') // Good
t('blogPostReadMore')   // Avoid
```

### 2. Variable Names
Use descriptive variable names:
```json
{
  "welcome": "Welcome, {{userName}}!",
  "items": "Found {{itemCount}} results"
}
```

### 3. Date Formatting
Always use the locale-aware formatDate function:
```typescript
formatDate(post.publishedAt, currentLang)
```

### 4. SEO
Include hreflang and canonical tags on every page:
```astro
---
import { getHreflangLinks, getCanonicalURL } from '../i18n/utils';
---
```

## Adding New Languages

1. **Add to configuration**:
```typescript
export const LANGUAGES = {
  'en-US': 'English',
  'pt-BR': 'Português',
  'es-ES': 'Español', // New language
} as const;
```

2. **Create translation file**:
```
src/i18n/locales/es-ES.json
```

3. **Update Astro config**:
```typescript
i18n: {
  locales: ["en-US", "pt-BR", "es-ES"],
}
```

4. **Add URL mapping**:
```typescript
export const LOCALE_PATHS = {
  'en-US': '/en',
  'pt-BR': '/pt',
  'es-ES': '/es',
} as const;
```

## Development

### Adding Translations
1. Add the key to all language files
2. Use the translation in your component
3. Test with both languages

### Testing
- Test language switching functionality
- Verify URL redirects work correctly
- Check SEO metadata in both languages
- Validate accessibility with screen readers

## Browser Support

The i18n system uses modern browser APIs:
- `Intl.DateTimeFormat` for date formatting
- `Intl.NumberFormat` for number formatting
- `localStorage` for preference storage
- `navigator.languages` for language detection

All features gracefully degrade for older browsers.