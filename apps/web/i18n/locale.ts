import { locales } from "@gullak/content";

export const LOCALE_COOKIE = "GULLAK_LOCALE";
export const DEFAULT_LOCALE = locales.defaultLocale;
export const SUPPORTED_LOCALES = locales.locales.map((l) => l.code);

/** Picks a supported locale from a cookie value or Accept-Language header. */
export function resolveLocale(cookie: string | undefined, acceptLanguage: string | null | undefined): string {
  if (cookie && SUPPORTED_LOCALES.includes(cookie)) return cookie;
  for (const part of acceptLanguage?.split(",") ?? []) {
    const tag = part.split(";")[0]?.trim().toLowerCase().split("-")[0];
    if (tag && SUPPORTED_LOCALES.includes(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}
