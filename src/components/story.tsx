import Link from "next/link";
import type { Source, Story } from "@/lib/types";

const storyHref = (town: string, story: Story) => `/story/${encodeURIComponent(town)}/${story.id}`;

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function SourceLine({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <p className="source">
      <b>Sources:</b>{" "}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && ", "}
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title ?? hostOf(s.url)}
          </a>
        </span>
      ))}
    </p>
  );
}

export function LeadStory({ story, town }: { story: Story; town: string }) {
  return (
    <section className="lead" aria-labelledby="lead-h">
      <p className="label label-section">{story.section} · Lead story</p>
      <h2 className="lead-h" id="lead-h">
        <Link href={storyHref(town, story)}>{story.headline}</Link>
      </h2>
      <p className="lead-sum">{story.summary}</p>
      <SourceLine sources={story.sources} />
    </section>
  );
}

export function StoryArticle({ story, town }: { story: Story; town: string }) {
  return (
    <article className="story">
      <div className="story-meta">
        <p className="label label-section">{story.section}</p>
      </div>
      <h3 className="story-h">
        <Link href={storyHref(town, story)}>{story.headline}</Link>
      </h3>
      <p>{story.summary}</p>
      <SourceLine sources={story.sources} />
    </article>
  );
}
