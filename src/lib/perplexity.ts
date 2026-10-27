import type { Source } from "./types";

const API_URL = "https://api.perplexity.ai/chat/completions";

type SearchResult = { title?: string; url: string; date?: string };

export type PerplexityResponse = {
  choices: { message: { content: string } }[];
  citations?: string[];
  search_results?: SearchResult[];
};

export type PerplexityChunk = {
  choices?: { delta?: { content?: string } }[];
  citations?: string[];
  search_results?: SearchResult[];
};

export function hasPerplexityKey() {
  return Boolean(process.env.PERPLEXITY_API_KEY);
}

export async function callPerplexity(body: Record<string, unknown>): Promise<Response> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Perplexity ${res.status}: ${await res.text()}`);
  }
  return res;
}

// The model's [1], [2]... markers index into search_results (or the older citations list).
export function sourcesFrom(data: Pick<PerplexityResponse, "citations" | "search_results">): Source[] {
  if (data.search_results?.length) {
    return data.search_results.map((r) => ({ url: r.url, title: r.title }));
  }
  return (data.citations ?? []).map((url) => ({ url }));
}

export function parseJson<T>(content: string): T {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "");
  return JSON.parse(trimmed) as T;
}

export function stripCitations(text: string) {
  return text.replace(/\s*\[\d+\]/g, "").trim();
}
