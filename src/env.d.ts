/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Language } from './i18n/config';

declare global {
  namespace App {
    interface Locals {
      currentLanguage: Language;
    }
  }
}

export {};