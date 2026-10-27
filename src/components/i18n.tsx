"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type I18n = { lang: Locale; t: Dictionary };

const I18nContext = createContext<I18n | null>(null);

// The layout loads one language's dictionary on the server and shares it with every client component below.
export function I18nProvider({ lang, dict, children }: { lang: Locale; dict: Dictionary; children: React.ReactNode }) {
  return <I18nContext value={{ lang, t: dict }}>{children}</I18nContext>;
}

export function useI18n() {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error("useI18n must be used inside I18nProvider");
  return i18n;
}

// Sections arrive as the English names the editor prompt asks for.
export const sectionName = (t: Dictionary, section: string) => t.sections[section] ?? section;
