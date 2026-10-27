// Shared by the proxy, server routes, and client components, so keep it free of React and Node APIs.
export const LOCALES = ["en", "es", "ar", "fr", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// Set when a reader picks a language in the masthead; wins over the browser's language on later visits.
export const LOCALE_COOKIE = "porch-press-lang";

type Language = {
  name: string; // in its own script, for the switcher
  english: string; // for prompts
  intl: string; // for date formatting
  dir: "ltr" | "rtl";
};

export const LANGUAGES: Record<Locale, Language> = {
  en: { name: "English", english: "English", intl: "en-US", dir: "ltr" },
  es: { name: "Español", english: "Spanish", intl: "es-US", dir: "ltr" },
  ar: { name: "العربية", english: "Arabic", intl: "ar", dir: "rtl" },
  fr: { name: "Français", english: "French", intl: "fr", dir: "ltr" },
  hi: { name: "हिन्दी", english: "Hindi", intl: "hi-IN", dir: "ltr" },
};

export const hasLocale = (value: string | null | undefined): value is Locale =>
  (LOCALES as readonly string[]).includes(value ?? "");

export const localeOr = (value: string | null | undefined): Locale => (hasLocale(value) ? value : DEFAULT_LOCALE);

// Picks the reader's most preferred supported language from an Accept-Language header, e.g. "es-MX,es;q=0.9,en;q=0.8".
export function pickLocale(acceptLanguage: string | null): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.split("-")[0].toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((l) => l.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.map((l) => l.base).find(hasLocale) ?? DEFAULT_LOCALE;
}

// Swaps the /{lang} prefix of a path, keeping the rest.
export const withLocale = (pathname: string, lang: Locale) => pathname.replace(/^\/[^/]*/, `/${lang}`);

// Fills {name} placeholders in a dictionary string.
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

// Arabic has six plural forms and Hindi two, so counts pick a form with Intl.PluralRules.
export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export function plural(lang: Locale, forms: Plural, count: number) {
  const { intl } = LANGUAGES[lang];
  const form = forms[new Intl.PluralRules(intl).select(count)] ?? forms.other;
  return fill(form, { count: new Intl.NumberFormat(intl).format(count) });
}
