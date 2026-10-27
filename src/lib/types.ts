export type Source = { url: string; title?: string };

export type Story = {
  id: string;
  headline: string;
  dek: string;
  summary: string;
  section: string;
  sources: Source[];
};

export type Edition = {
  town: string;
  date: string;
  weather: string;
  // stories[0] is the lead story
  stories: Story[];
  briefs: string[];
  sample?: boolean;
};

export type Article = { body: string; sources: Source[]; sample?: boolean };

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Separates the streamed answer text from the trailing JSON list of sources in /api/ask.
export const SOURCES_MARKER = "\u001e";
