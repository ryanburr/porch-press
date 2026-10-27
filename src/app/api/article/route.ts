import { LANGUAGES, localeOr } from "@/lib/i18n";
import {
  callAgent,
  hasPerplexityKey,
  outputText,
  plainText,
  searchResults,
  toSources,
  type AgentResponse,
} from "@/lib/perplexity";
import { sampleArticle } from "@/lib/sample";
import type { Article, Story } from "@/lib/types";

export async function POST(req: Request) {
  const { town, story, ...rest } = (await req.json()) as { town: string; story: Story; lang?: string };
  const lang = localeOr(rest.lang);
  const language = LANGUAGES[lang].english;
  if (!hasPerplexityKey()) return Response.json(sampleArticle(story, lang));

  try {
    const res = await callAgent({
      effort: "fast",
      instructions: `You are a reporter for The Porch Press covering ${town}. Write clear, factual local news for people who live there. Cite sources with bracketed numbers like [1] that refer to your search results, never markdown links. Never speculate beyond what the sources say. Write in ${language}, even when your sources are in another language.`,
      input: `Write the full article for this story: "${story.headline}".
What we know so far: ${story.summary}

Write 5 to 7 short paragraphs of plain text separated by blank lines. No headings, bullet points, or markdown. Cover what happened, who is involved, why it matters to people who live in ${town}, and what happens next (meetings, votes, dates, deadlines). Start the last paragraph with "What to watch:"${lang === "en" ? "" : `, written in ${language}`}.`,
    });
    const data = (await res.json()) as AgentResponse;
    const article: Article = { body: plainText(outputText(data)), sources: toSources(searchResults(data)) };
    return Response.json(article);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Our reporter couldn't file this story. Try again." }, { status: 502 });
  }
}
