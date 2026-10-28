import type { NextRequest } from "next/server";
import rows from "@/data/places.json";
import type { Place } from "@/lib/places";

// Rows are [name, state, population], largest first; built by `pnpm places`.
const MAX_RESULTS = 8;

// Accents, periods and Saint/St.-style spellings all compare equal ("st louis" finds "St. Louis").
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\bsaint\b/g, "st")
    .replace(/\bmount\b/g, "mt")
    .replace(/\bfort\b/g, "ft")
    .replace(/\s+/g, " ")
    .trim();

const STATES = new Set(rows.map(([, state]) => (state as string).toLowerCase()));
const INDEX = (rows as [string, string, number][]).map(([name, state]) => ({
  name,
  state,
  key: normalize(name),
  stateKey: state.toLowerCase(),
}));

// "ashe", "Asheville, N", and "austin tx" all work: a trailing state is split off.
function parse(q: string) {
  const [name, state = ""] = q.split(",").map((s) => s.trim());
  if (state || !name.includes(" ")) return { name, state };
  const last = name.slice(name.lastIndexOf(" ") + 1);
  return STATES.has(last) ? { name: name.slice(0, -last.length).trim(), state: last } : { name, state };
}

export function GET(req: NextRequest) {
  const q = normalize(req.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  if (q.length < 2) return Response.json({ places: [] });

  const { name, state } = parse(q);
  const prefix = [];
  const wordStart = [];
  for (const place of INDEX) {
    if (state && !place.stateKey.startsWith(state)) continue;
    if (place.key.startsWith(name)) prefix.push(place);
    else if (wordStart.length < MAX_RESULTS && place.key.includes(` ${name}`)) wordStart.push(place);
    if (prefix.length === MAX_RESULTS) break;
  }

  const places: Place[] = [...prefix, ...wordStart].slice(0, MAX_RESULTS).map((p) => {
    const label = `${p.name}, ${p.state}`;
    return { name: label, query: label };
  });
  return Response.json(
    { places },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
