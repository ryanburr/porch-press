// Builds src/data/places.json from the Census Bureau's city and town population estimates.
// Usage: pnpm places [path-or-url-to-sub-est CSV]
// Output rows are [name, state abbreviation, population], largest first.
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

const SOURCE =
  process.argv[2] ??
  "https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/sub-est2025.csv";
const OUT = new URL("../src/data/places.json", import.meta.url);

const STATES = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
  Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY",
  Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI",
  "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

// Consolidated city-county governments whose Census names aren't what residents call them.
const RENAMES = {
  "Athens-Clarke County": "Athens",
  "Augusta-Richmond County": "Augusta",
  "Lexington-Fayette": "Lexington",
  "Louisville/Jefferson County": "Louisville",
  "Macon-Bibb County": "Macon",
  "Nashville-Davidson": "Nashville",
  "Urban Honolulu": "Honolulu",
  "Butte-Silver Bow": "Butte",
  "Anaconda-Deer Lodge County": "Anaconda",
};

// Lowercase government-type suffixes ("Carson City" keeps its capital "City").
const SUFFIX =
  / (city and borough|city|town|village|borough|municipality|unified government|consolidated government|metropolitan government|metro government|urban county|CDP)$/;

function cleanName(raw) {
  const name = raw.replace(/ \(balance\)$/, "").replace(SUFFIX, "");
  return RENAMES[name] ?? name;
}

// Minimal CSV row parser: handles quoted fields with commas.
function parseRow(line) {
  const out = [];
  let field = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(field);
      field = "";
    } else field += ch;
  }
  out.push(field);
  return out;
}

async function load(source) {
  const bytes = source.startsWith("http")
    ? new Uint8Array(await (await fetch(source)).arrayBuffer())
    : await readFile(source);
  // The Census publishes these files in Latin-1 (e.g. "Española").
  return new TextDecoder("latin1").decode(bytes);
}

const [header, ...lines] = (await load(SOURCE)).trim().split(/\r?\n/);
const cols = parseRow(header);
const col = (name) => cols.indexOf(name);
const popCol = cols.findLast((c) => c.startsWith("POPESTIMATE"));

const best = new Map();
for (const line of lines) {
  const row = parseRow(line);
  // 162 = a whole place. Keep every status: Nashville and Indianapolis are "fictitious" balance rows,
  // Honolulu is statistical and Washington, DC is nonfunctioning, but they're real cities.
  if (row[col("SUMLEV")] !== "162") continue;
  const state = STATES[row[col("STNAME")]];
  if (!state) continue;
  const name = cleanName(row[col("NAME")]);
  const pop = Number(row[col(popCol)]) || 0;
  const key = `${name}|${state}`;
  if ((best.get(key)?.[2] ?? -1) < pop) best.set(key, [name, state, pop]);
}

const places = [...best.values()].sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
await writeFile(OUT, JSON.stringify(places));
console.log(`Wrote ${places.length} places (${popCol}) to src/data/places.json`);
console.log("Largest:", places.slice(0, 5).map(([n, s]) => `${n}, ${s}`).join("; "));
