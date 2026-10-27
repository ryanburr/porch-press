import type { Locale } from "./i18n";

// `query` is the town string sent to useEdition; `name` is what readers see.
export type Place = { name: string; query: string };

const NEIGHBORHOODS = [
  "Boston-Edison",
  "Brightmoor",
  "Brush Park",
  "Corktown",
  "Delray",
  "Downtown",
  "East English Village",
  "Eastern Market",
  "Greektown",
  "Grandmont-Rosedale",
  "Indian Village",
  "Islandview",
  "Jefferson Chalmers",
  "Lafayette Park",
  "Mexicantown",
  "Midtown",
  "New Center",
  "North End",
  "Osborn",
  "Palmer Park",
  "Palmer Woods",
  "Rivertown",
  "Rosedale Park",
  "Southwest Detroit",
  "University District",
  "Warrendale",
  "West Village",
  "Woodbridge",
];

const NEARBY_TOWNS = [
  "Dearborn",
  "Dearborn Heights",
  "Ferndale",
  "Grosse Pointe",
  "Hamtramck",
  "Highland Park",
  "Livonia",
  "Royal Oak",
  "Southfield",
  "Warren",
];

export const DETROIT: Place = { name: "Detroit", query: "Detroit, MI" };

export const PLACES: Place[] = [
  DETROIT,
  ...NEIGHBORHOODS.map((n) => ({ name: n, query: `${n}, Detroit, MI` })),
  ...NEARBY_TOWNS.map((t) => ({ name: t, query: `${t}, MI` })),
];

export const placeFor = (query: string): Place => PLACES.find((p) => p.query === query) ?? { name: query, query };

export const frontPageHref = (lang: Locale, query: string) =>
  query === DETROIT.query ? `/${lang}` : `/${lang}?town=${encodeURIComponent(query)}`;
