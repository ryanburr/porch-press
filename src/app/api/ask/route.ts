import { callPerplexity, hasPerplexityKey, sourcesFrom, type PerplexityChunk } from "@/lib/perplexity";
import { SAMPLE_ANSWER } from "@/lib/sample";
import { SOURCES_MARKER, type ChatMessage, type Source, type Story } from "@/lib/types";

type AskRequest = {
  town: string;
  story: Pick<Story, "headline" | "summary">;
  article: string;
  messages: ChatMessage[];
};

const encoder = new TextEncoder();

export async function POST(req: Request) {
  const { town, story, article, messages } = (await req.json()) as AskRequest;
  if (!hasPerplexityKey()) return streamSample();

  let upstream: Response;
  try {
    upstream = await callPerplexity({
      model: "sonar",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are the Porch Press newsroom answering readers in ${town}. Answer follow-up questions about local news in 2 to 4 short paragraphs of plain text, no markdown. Be specific and practical: dates, places, and how residents can take part. Cite sources with bracketed numbers like [1]. If you don't know, say so.

The reader is looking at this story:
Headline: ${story.headline}
Summary: ${story.summary}

${article.slice(0, 6000)}`,
        },
        ...messages,
      ],
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
      let sources: Source[] = [];

      // Perplexity streams OpenAI-style SSE: "data: {json}" lines ending with "data: [DONE]".
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
            const chunk = JSON.parse(payload) as PerplexityChunk;
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
            if (chunk.search_results?.length || chunk.citations?.length) sources = sourcesFrom(chunk);
          } catch {
            // ignore keep-alives and partial frames
          }
        }
      }
      controller.enqueue(encoder.encode(SOURCES_MARKER + JSON.stringify(sources)));
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function streamSample() {
  const words = SAMPLE_ANSWER.split(" ");
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
