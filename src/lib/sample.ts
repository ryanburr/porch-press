import type { Locale } from "./i18n";
import { ar } from "./samples/ar";
import { en } from "./samples/en";
import { es } from "./samples/es";
import { fr } from "./samples/fr";
import { hi } from "./samples/hi";
import type { Article, Edition, Story } from "./types";

export type SampleCopy = {
  weather: string;
  // `section` stays one of the English section names, as in a real edition.
  stories: Omit<Story, "id" | "sources">[];
  briefs: string[];
  // Paragraphs that follow the story's summary in a sample article.
  article: string[];
  answer: string;
};

// Served when PERPLEXITY_API_KEY is missing, so the UI can be built and demoed offline in every language.
const SAMPLES: Record<Locale, SampleCopy> = { en, es, ar, fr, hi };

export function sampleEdition(town: string, date: string, lang: Locale): Edition {
  const copy = SAMPLES[lang];
  return {
    town,
    date,
    sample: true,
    weather: copy.weather,
    stories: copy.stories.map((s, i) => ({ ...s, id: String(i), sources: [] })),
    briefs: copy.briefs,
  };
}

export function sampleArticle(story: Story, lang: Locale): Article {
  return {
    sample: true,
    sources: [],
    body: [story.summary, ...SAMPLES[lang].article].join("\n\n"),
  };
}

export const sampleAnswer = (lang: Locale) => SAMPLES[lang].answer;
