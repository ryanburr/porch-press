import type { Source } from "./types";

// Perplexity's Agent API (Sonar's /chat/completions was retired in favor of it).
const API_URL = "https://api.perplexity.ai/v1/agent";

export type SearchResult = { id: number; title?: string; url: string; date?: string };

type OutputItem =
  | { type: "search_results"; results: SearchResult[] | null }
  | { type: "message"; content: { type: string; text: string }[] }
  | { type: string };

export type AgentResponse = { status: string; output: OutputItem[] };

// Streamed server-sent events; text arrives as `response.output_text.delta`,
// sources as `response.reasoning.search_results`.
export type AgentEvent = { type: string; delta?: string; results?: SearchResult[] };

type AgentInput = string | { role: "user" | "assistant"; content: string }[];

type AgentRequest = {
  effort: "fast" | "low" | "medium" | "high";
  instructions: string;
  input: AgentInput;
  recency?: "day" | "week" | "month" | "year";
  schema?: { name: string; schema: Record<string, unknown> };
  stream?: boolean;
};

export function hasPerplexityKey() {
  return Boolean(process.env.PERPLEXITY_API_KEY);
}

export async function callAgent({ effort, instructions, input, recency, schema, stream }: AgentRequest) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      effort,
      instructions,
      input,
      stream,
      tools: [{ type: "web_search", ...(recency && { filters: { search_recency_filter: recency } }) }],
      ...(schema && { response_format: { type: "json_schema", json_schema: schema } }),
    }),
  });
  if (!res.ok) {
    throw new Error(`Perplexity ${res.status}: ${await res.text()}`);
  }
  return res;
}

export function outputText(res: AgentResponse) {
  return res.output
    .flatMap((item) => (item.type === "message" && "content" in item ? item.content : []))
    .filter((c) => c.type === "output_text")
    .map((c) => c.text)
    .join("");
}

export function searchResults(res: AgentResponse) {
  return res.output.flatMap((item) =>
    item.type === "search_results" && "results" in item ? (item.results ?? []) : [],
  );
}

// The model's [n] markers refer to the search result whose id is n.
export function toSources(results: SearchResult[]): Source[] {
  const byId = new Map(results.map((r) => [r.id, r]));
  return [...byId.values()]
    .sort((a, b) => a.id - b.id)
    .map((r) => ({ id: r.id, url: r.url, title: r.title }));
}

export function parseJson<T>(content: string): T {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "");
  return JSON.parse(trimmed) as T;
}

export function stripCitations(text: string) {
  return text.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, "").trim();
}

// Keeps [n] markers but drops markdown the model sometimes adds anyway.
export function plainText(text: string) {
  return text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1");
}
