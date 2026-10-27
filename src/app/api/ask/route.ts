import { LANGUAGES, localeOr } from "@/lib/i18n";
import { callAgent, hasPerplexityKey, toSources, type AgentEvent, type SearchResult } from "@/lib/perplexity";
import { sampleAnswer } from "@/lib/sample";
import { SOURCES_MARKER, type ChatMessage, type Story } from "@/lib/types";

type AskRequest = {
  town: string;
  lang?: string;
  story: Pick<Story, "headline" | "summary">;
  article: string;
  messages: ChatMessage[];
};

const encoder = new TextEncoder();

export async function POST(req: Request) {
  const { town, story, article, messages, ...rest } = (await req.json()) as AskRequest;
  const lang = localeOr(rest.lang);
  if (!hasPerplexityKey()) return streamSample(sampleAnswer(lang));

  let upstream: Response;
  try {
    upstream = await callAgent({
      effort: "fast",
      stream: true,
      instructions: `You are the Porch Press newsroom answering readers in ${town}. Answer follow-up questions about local news in 2 to 4 short paragraphs of plain text, no markdown. Be specific and practical: dates, places, and how residents can take part. Cite sources with bracketed numbers like [1] that refer to your search results, never markdown links. If you don't know, say so. Always answer in ${LANGUAGES[lang].english}, whatever language the question is in.

The reader is looking at this story:
Headline: ${story.headline}
Summary: ${story.summary}

${article.slice(0, 6000)}`,
      input: withLocalContext(messages, town, story.headline),
    });
  } catch (err) {
    console.error(err);
    return new Response("The newsroom phone is busy. Try again in a moment.", { status: 502 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const results: SearchResult[] = [];

      // Server-sent events: "event: <type>" / "data: {json}" pairs; only the data lines matter.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload) as AgentEvent;
            if (event.type === "response.output_text.delta" && event.delta) {
              controller.enqueue(encoder.encode(event.delta));
            } else if (event.type === "response.reasoning.search_results") {
              results.push(...(event.results ?? []));
            }
          } catch {
            // ignore keep-alives and partial frames
          }
        }
      }
      controller.enqueue(encoder.encode(SOURCES_MARKER + JSON.stringify(toSources(results))));
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

// Searches are built from the latest message, so a bare "how do I watch?" needs the town and story attached.
function withLocalContext(messages: ChatMessage[], town: string, headline: string): ChatMessage[] {
  const last = messages.at(-1);
  if (!last) return messages;
  return [...messages.slice(0, -1), { ...last, content: `${last.content}\n\n(About the ${town} story "${headline}")` }];
}

function streamSample(answer: string) {
  const words = answer.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word + " "));
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.enqueue(encoder.encode(SOURCES_MARKER + "[]"));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
