"use client";

import { useEffect, useState } from "react";
import { readStored, writeStored } from "./use-edition";
import type { Article, Edition, Story } from "./types";

export function useArticle(edition: Edition | null, story: Story | undefined) {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!edition || !story) return;
    const key = `porch-press:article:${edition.town.toLowerCase()}:${edition.date}:${story.id}`;
    const stored = readStored<Article>(key);
    if (stored) {
      // localStorage only exists on the client, so the cached copy can't be initial state without a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArticle(stored);
      return;
    }

    let cancelled = false;
    fetch("/api/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ town: edition.town, story }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
        return data as Article;
      })
      .then((a) => {
        if (cancelled) return;
        writeStored(key, a);
        setArticle(a);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));

    return () => {
      cancelled = true;
    };
  }, [edition, story]);

  return { article, error, loading: !article && !error };
}

// Splits an article body into display paragraphs; [n] markers index into article.sources.
export function paragraphsOf(article: Article) {
  return article.body
    .split(/\n+/)
    .map((p) => p.replace(/\*\*/g, "").trim())
    .filter(Boolean);
}
