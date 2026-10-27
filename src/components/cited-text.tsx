import type { Source } from "@/lib/types";

// Turns [n] markers into superscript links to the matching source.
export function CitedText({ text, sources }: { text: string; sources: Source[] }) {
  return (
    <>
      {text.split(/(\[\d+\])/).map((part, i) => {
        const n = part.match(/^\[(\d+)\]$/)?.[1];
        if (!n) return part;
        const source = sources.find((s) => s.id === Number(n)) ?? sources[Number(n) - 1];
        if (!source) return null;
        return (
          <sup key={i}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" title={source.title ?? source.url}>
              {n}
            </a>
          </sup>
        );
      })}
    </>
  );
}
