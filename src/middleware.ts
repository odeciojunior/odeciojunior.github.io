import { defineMiddleware } from 'astro:middleware';
import { i18nMiddleware } from './i18n/utils/middleware';

export const onRequest = defineMiddleware((context, next) => {
  // Handle i18n routing
  const i18nResponse = i18nMiddleware(context.request);
  if (i18nResponse) {
    return i18nResponse;
  }

  return next();
});