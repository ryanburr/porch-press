import type { NextRequest } from "next/server";
import { longDate } from "@/lib/dates";
import {
  callPerplexity,
  hasPerplexityKey,
  parseJson,
  sourcesFrom,
  stripCitations,
  type PerplexityResponse,
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
    source_urls: { type: "array", items: { type: "string" } },
  },
  required: ["headline", "dek", "summary", "section", "source_urls"],
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

type RawStory = { headline: string; dek: string; summary: string; section: string; source_urls: string[] };
type RawEdition = { town: string; weather: string; lead: RawStory; stories: RawStory[]; briefs: string[] };

const EDITOR_PROMPT = `You are the editor of The Porch Press, a daily hometown newspaper. You curate only genuinely local news for one town: city and county government, schools, development and housing, public safety, local business, community events, and local sports.
Exclude national and international news unless it has a specific, concrete local angle. Prefer stories from the last 48 hours and never include anything older than 7 days. If the town is small, widen to its county or immediate region.
Write in a warm, plain, neutral newspaper voice. Never invent facts: every story must come from your search results.`;

// One edition per town per day keeps the demo fast and the API bill small.
const editions = new Map<string, Edition>();

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const town = params.get("town")?.trim();
  const date = params.get("date") ?? new Date().toISOString().slice(0, 10);
  if (!town) return Response.json({ error: "Tell us your town." }, { status: 400 });
  if (!hasPerplexityKey()) return Response.json(sampleEdition(town, date));

  const key = `${town.toLowerCase()}|${date}`;
  const cached = editions.get(key);
  if (cached && !params.has("fresh")) return Response.json(cached);

  try {
    const edition = await printEdition(town, date);
    editions.set(key, edition);
    return Response.json(edition);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "The presses jammed. Try again in a moment." }, { status: 502 });
  }
}

async function printEdition(town: string, date: string): Promise<Edition> {
  const res = await callPerplexity({
    model: "sonar-pro",
    messages: [
      { role: "system", content: EDITOR_PROMPT },
      {
        role: "user",
        content: `Today is ${longDate(date)}. Put together today's front page for ${town}.
Return the town's proper name as "City, State"; a one-sentence weather outlook for today; the single most important local story as the lead; 6 more stories spread across different sections; and 4 one-line briefs about smaller local happenings.
For each story write a punchy headline, a one-line dek, a 2-3 sentence summary, its section, and the URLs of the sources you used.`,
      },
    ],
    response_format: { type: "json_schema", json_schema: { schema: editionSchema } },
    search_recency_filter: "week",
    web_search_options: { search_context_size: "medium" },
  });
  const data = (await res.json()) as PerplexityResponse;
  const raw = parseJson<RawEdition>(data.choices[0].message.content);
  const known = sourcesFrom(data);

  const toStory = (s: RawStory, i: number): Story => ({
    id: String(i),
    headline: stripCitations(s.headline),
    dek: stripCitations(s.dek),
    summary: stripCitations(s.summary),
    section: s.section,
    sources: matchSources(s.source_urls, known),
  });

  return {
    town: raw.town || town,
    date,
    weather: stripCitations(raw.weather),
    stories: [raw.lead, ...raw.stories].map(toStory),
    briefs: raw.briefs.map(stripCitations),
  };
}

function matchSources(urls: string[], known: Source[]): Source[] {
  return urls.map((url) => known.find((k) => k.url === url) ?? { url });
}
