import { callPerplexity, hasPerplexityKey, sourcesFrom, type PerplexityResponse } from "@/lib/perplexity";
import { sampleArticle } from "@/lib/sample";
import type { Article, Story } from "@/lib/types";

export async function POST(req: Request) {
  const { town, story } = (await req.json()) as { town: string; story: Story };
  if (!hasPerplexityKey()) return Response.json(sampleArticle(story));

  try {
    const res = await callPerplexity({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are a reporter for The Porch Press covering ${town}. Write clear, factual local news for people who live there. Cite sources with bracketed numbers like [1] that refer to your search results. Never speculate beyond what the sources say.`,
        },
        {
          role: "user",
          content: `Write the full article for this story: "${story.headline}".
What we know so far: ${story.summary}

Write 5 to 7 short paragraphs of plain text separated by blank lines. No headings, bullet points, or markdown. Cover what happened, who is involved, why it matters to people who live in ${town}, and what happens next (meetings, votes, dates, deadlines). Start the last paragraph with "What to watch:".`,
        },
      ],
      web_search_options: { search_context_size: "high" },
    });
    const data = (await res.json()) as PerplexityResponse;
    const article: Article = { body: data.choices[0].message.content, sources: sourcesFrom(data) };
    return Response.json(article);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Our reporter couldn't file this story. Try again." }, { status: 502 });
  }
}
