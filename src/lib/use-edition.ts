"use client";

import { useCallback, useEffect, useState } from "react";
import { todayKey } from "./dates";
import type { Locale } from "./i18n";
import type { Edition } from "./types";

export function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked; the edition still renders
  }
}

export const editionKey = (town: string, date: string, lang: Locale) =>
  `porch-press:edition:${lang}:${town.toLowerCase()}:${date}`;

export function useEdition(town: string, lang: Locale) {
  const [edition, setEdition] = useState<Edition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (fresh = false) => {
      const date = todayKey();
      const key = editionKey(town, date, lang);
      const stored = fresh ? null : readStored<Edition>(key);
      if (stored) {
        setEdition(stored);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ town, date, lang });
        if (fresh) params.set("fresh", "1");
        const res = await fetch(`/api/front-page?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
        writeStored(key, data);
        setEdition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [town, lang],
  );

  useEffect(() => {
    // Reads the client-only localStorage cache before falling back to the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { edition, error, loading, reprint: () => load(true) };
}
