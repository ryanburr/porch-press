"use client";

import { useRouter } from "next/navigation";
import { LANGUAGES, LOCALE_COOKIE, LOCALES, hasLocale, withLocale } from "@/lib/i18n";
import { useI18n } from "./i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const router = useRouter();

  return (
    <select
      className="lang-select"
      aria-label={t.masthead.language}
      value={lang}
      onChange={(e) => {
        const next = e.target.value;
        if (!hasLocale(next)) return;
        // Remembered so a bare visit to / opens in this language next time.
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
        router.push(withLocale(location.pathname, next) + location.search);
      }}
    >
      {LOCALES.map((l) => (
        <option key={l} value={l} lang={l}>
          {LANGUAGES[l].name}
        </option>
      ))}
    </select>
  );
}
