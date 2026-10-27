import type { Locale } from "../i18n";
import type { Dictionary } from "./en";

export type { Dictionary };

// Loaded in the server layout and handed to the client provider, so a reader only downloads their own language.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en").then((m) => m.en),
  es: () => import("./es").then((m) => m.es),
  ar: () => import("./ar").then((m) => m.ar),
  fr: () => import("./fr").then((m) => m.fr),
  hi: () => import("./hi").then((m) => m.hi),
};

export const getDictionary = (lang: Locale) => dictionaries[lang]();
