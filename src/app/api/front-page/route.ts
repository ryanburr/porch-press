import type { NextRequest } from "next/server";
import { longDate } from "@/lib/dates";
import { LANGUAGES, localeOr, type Locale } from "@/lib/i18n";
import {
  callAgent,
  hasPerplexityKey,
  outputText,
  parseJson,
  searchResults,
  stripCitations,
  toSources,
  type AgentResponse,
} from "@/lib/perplexity";
import { sampleEdition } from "@/lib/sample";
import type { Edition, Source, Story } from "@/lib/types";

const SECTIONS = ["City Hall", "Schools", "Development", "Public Safety", "Business", "Community", "Sports"];

const storySchema = {
  type: "object",
  properties: {
    headline: { type: "string" },
    dek: { type: "string" },
    summary: { type: "string" },
    section: { type: "string", enum: SECTIONS },
    source_ids: { type: "array", items: { type: "integer" } },
  },
  required: ["headline", "dek", "summary", "section", "source_ids"],
};

const editionSchema = {
  type: "object",
  properties: {
    town: { type: "string" },
    weather: { type: "string" },
    lead: storySchema,
    stories: { type: "array", items: storySchema },
    briefs: { type: "array", items: { type: "string" } },
  },
  required: ["town", "weather", "lead", "stories", "briefs"],
};

type RawStory = { headline: string; dek: string; summary: string; section: string; source_ids: number[] };
type RawEdition = { town: string; weather: string; lead: RawStory; stories: RawStory[]; briefs: string[] };

const EDITOR_PROMPT = `You are the editor of The Porch Press, a daily hometown newspaper. You curate only genuinely local news for one town: city and county government, schools, development and housing, public safety, local business, community events, and local sports.
Every story must cover a different news event; never repeat the lead or cover one event twice from different angles.
Exclude national and international news unless it has a specific, concrete local angle. Prefer stories from the last 48 hours and never include anything older than 7 days. If the town is small, widen to its county or immediate region.
Write in a warm, plain, neutral newspaper voice. Never invent facts: every story must come from your search results.`;

// One edition per town, day, and language keeps the demo fast and the API bill small.
const editions = new Map<string, Edition>();

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const town = params.get("town")?.trim();
  const date = params.get("date") ?? new Date().toISOString().slice(0, 10);
  const lang = localeOr(params.get("lang"));
  if (!town) return Response.json({ error: "Tell us your town." }, { status: 400 });
  if (!hasPerplexityKey()) return Response.json(sampleEdition(town, date, lang));

  const key = `${lang}|${town.toLowerCase()}|${date}`;
  const cached = editions.get(key);
  if (cached && !params.has("fresh")) return Response.json(cached);

  try {
    const edition = await printEdition(town, date, lang);
    editions.set(key, edition);
    return Response.json(edition);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "The presses jammed. Try again in a moment." }, { status: 502 });
  }
}

async function printEdition(town: string, date: string, lang: Locale): Promise<Edition> {
  const res = await callAgent({
    effort: "low",
    instructions: `${EDITOR_PROMPT}\nWrite in ${LANGUAGES[lang].english}, even when your sources are in another language.`,
    input: `Today is ${longDate(date)}. Put together today's front page for ${town}.
Return the town's proper name in English as "City, State"; a one-sentence weather outlook for today; the single most important local story as the lead; 6 more stories spread across different sections; and 4 one-line briefs about smaller local happenings.
For each story write a punchy headline, a one-line dek, a 2-3 sentence summary, its section, and the ids of the search results you used.
Write the weather, headlines, deks, summaries, and briefs in ${LANGUAGES[lang].english}; keep each section as one of its English names.`,
    recency: "week",
    schema: { name: "edition", schema: editionSchema },
  });
  const data = (await res.json()) as AgentResponse;
  const raw = parseJson<RawEdition>(outputText(data));
  const known = toSources(searchResults(data));

  const toStory = (s: RawStory, i: number): Story => ({
    id: String(i),
    headline: stripCitations(s.headline),
    dek: stripCitations(s.dek),
    summary: stripCitations(s.summary),
    section: s.section,
    sources: matchSources(s.source_ids, known),
  });

  return {
    town: raw.town || town,
    date,
    weather: stripCitations(raw.weather),
    stories: [raw.lead, ...raw.stories].map(toStory),
    briefs: raw.briefs.map(stripCitations),
  };
}

function matchSources(ids: number[], known: Source[]): Source[] {
  return ids.flatMap((id) => known.filter((k) => k.id === id));
}
