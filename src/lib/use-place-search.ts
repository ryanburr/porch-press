"use client";

import { useEffect, useState } from "react";
import type { Place } from "./places";

const DEBOUNCE_MS = 200;

type Result = { q: string; places: Place[] } | { q: string; failed: true };

// Searches /api/places for every US city and town, debounced as the reader types.
export function usePlaceSearch(q: string) {
  const [result, setResult] = useState<Result | null>(null);
  const active = q.length >= 2;

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const { places } = (await res.json()) as { places: Place[] };
        setResult({ q, places });
      } catch {
        if (!controller.signal.aborted) setResult({ q, failed: true });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, active]);

  const current = active && result?.q === q ? result : null;
  return {
    places: current && "places" in current ? current.places : [],
    searching: active && !current,
    failed: Boolean(current && "failed" in current),
  };
}
