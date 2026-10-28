import { DEFAULT_LOCALE, LANGUAGES, type Locale } from "./i18n";

// Dates travel as local YYYY-MM-DD strings so an edition is keyed to the reader's day, not the server's.
export function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function longDate(date: string, lang: Locale = DEFAULT_LOCALE) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(LANGUAGES[lang].intl, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
