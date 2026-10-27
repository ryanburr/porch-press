import { useI18n } from "./i18n";
import { LanguageSwitcher } from "./language-switcher";

export function Masthead() {
  const { t } = useI18n();
  return (
    <header className="masthead">
      <div className="ear">
        <span>{t.masthead.established}</span>
        <svg className="emblem" viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <polyline points="4,16 32,4 60,16" />
          <line x1="8" y1="16" x2="56" y2="16" />
          <line x1="12" y1="16" x2="12" y2="34" />
          <line x1="52" y1="16" x2="52" y2="34" />
          <line x1="8" y1="26" x2="56" y2="26" />
          <line x1="8" y1="34" x2="56" y2="34" />
          <line x1="20" y1="26" x2="20" y2="34" />
          <line x1="28" y1="26" x2="28" y2="34" />
          <line x1="36" y1="26" x2="36" y2="34" />
          <line x1="44" y1="26" x2="44" y2="34" />
        </svg>
        <div className="ear-end">
          <span>{t.masthead.price}</span>
          <LanguageSwitcher />
        </div>
      </div>
      {/* The paper's name stays in English in every edition. */}
      <h1 className="mast-title" lang="en">
        The Porch Press
      </h1>
      <p className="mast-tag">{t.masthead.tagline}</p>
    </header>
  );
}
