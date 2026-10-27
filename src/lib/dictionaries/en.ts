import type { Plural } from "../i18n";

// The English dictionary sets the shape every other language must match. {name} placeholders are filled with `fill`.
export const en = {
  meta: {
    description: "Your town's paper, delivered to your porch.",
  },
  masthead: {
    established: "Est. 2026 · Revived from the porch",
    price: "Free · Daily",
    tagline: "Your hometown paper, delivered to your porch.",
    language: "Language",
  },
  front: {
    skip: "Skip to the news",
    edition: "{place} Edition",
    print: "Print my paper",
    sampleLabel: "Sample edition",
    sampleNote: "Add a Perplexity API key to print today's real news.",
    glance: "At a glance",
    howItWorks: "How it works:",
    howItWorksBody: "AI curates today's local reporting into one front page. Every story links to the sources it came from.",
    disclaimer: "This paper is written by AI. It can still make mistakes, so check the sources before you share.",
  },
  picker: {
    label: "Find your neighborhood or town",
    placeholder: "Search neighborhoods or towns",
    list: "Neighborhoods and towns",
    noMatch: "No match for “{text}”. Check the spelling, or try a nearby neighborhood.",
    found: { one: "{count} place found", other: "{count} places found" } as Plural,
    none: "No places found",
  },
  sidebar: {
    weather: "Today's Weather",
    briefs: "In Brief",
  },
  states: {
    loading: "Stopping the presses…",
    loadingNote: "Writing today's paper for {town}.",
    jam: "The press jammed: we could not load this edition.",
    retry: "Try again",
  },
  story: {
    sources: "Sources:",
    lead: "Lead story",
  },
  // Keyed by the English section names the editor prompt asks for.
  sections: {
    "City Hall": "City Hall",
    Schools: "Schools",
    Development: "Development",
    "Public Safety": "Public Safety",
    Business: "Business",
    Community: "Community",
    Sports: "Sports",
  } as Record<string, string>,
  article: {
    skip: "Skip to the story",
    breadcrumb: "Breadcrumb",
    back: "← Front page",
    missing: "This story isn't in today's paper",
    missingNote: "Editions change each day. Head back to the front page for today's news.",
    backToFront: "Back to the front page",
    byline: "Written by AI from local reporting",
    sourceCount: { one: "{count} source", other: "{count} sources" } as Plural,
    failed: "Our reporter couldn't file this story. Try again.",
    filing: "Filing the full story…",
    about: "About this story",
    sources: "Sources",
    share: "Share or print",
    copy: "Copy link",
    printLetter: "Print, Letter size",
    disclaimer: "This paper is written by AI from local reporting. It can still make mistakes, so check the sources before you share.",
  },
  ask: {
    title: "Ask a follow-up",
    tag: "AI",
    intro: "Questions about this story, answered from the latest local reporting. Pick one or type your own.",
    suggestedLabel: "Suggested questions",
    suggested: ["When is the next meeting or vote?", "How can residents weigh in?", "What happens next?"],
    inputLabel: "Your question about this story",
    placeholder: "Ask about this story",
    submit: "Ask",
    youAsked: "You asked: {question}",
    checking: "Checking the latest reporting…",
    failed: "Sorry, the newsroom couldn't answer that one. Try again.",
    disclaimer: "Answers are written by AI and can be wrong. Check the linked sources.",
  },
};

export type Dictionary = typeof en;
