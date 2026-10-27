"use client";

import { useState } from "react";
import type { Locale } from "./i18n";
import { SOURCES_MARKER, type Article, type ChatMessage, type Source, type Story } from "./types";

export type Turn = { question: string; answer: string; sources: Source[]; failed?: boolean };

// Follow-up Q&A about one story, answered in `lang`. `answer` fills in live as the response streams.
export function useAsk(town: string, story: Story | undefined, article: Article | null, lang: Locale) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy || !story || !article) return;
    setBusy(true);

    const history: ChatMessage[] = turns.flatMap((t) => [
      { role: "user", content: t.question },
      { role: "assistant", content: t.answer },
    ]);
    setTurns((prev) => [...prev, { question: q, answer: "", sources: [] }]);
    const update = (patch: Partial<Turn>) =>
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, ...patch } : t)));

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          town,
          lang,
          story: { headline: story.headline, summary: story.summary },
          article: article.body,
          messages: [...history, { role: "user", content: q }],
        }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        update({ answer: text.split(SOURCES_MARKER)[0] });
      }
      const [answer, sourcesJson] = text.split(SOURCES_MARKER);
      update({ answer, sources: sourcesJson ? (JSON.parse(sourcesJson) as Source[]) : [] });
    } catch {
      update({ answer: "", failed: true });
    } finally {
      setBusy(false);
    }
  }

  return { turns, busy, ask };
}
