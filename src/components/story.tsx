import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Source, Story } from "@/lib/types";
import { sectionName, useI18n } from "./i18n";

const storyHref = (lang: Locale, town: string, story: Story) => `/${lang}/story/${encodeURIComponent(town)}/${story.id}`;

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function SourceLine({ sources }: { sources: Source[] }) {
  const { t } = useI18n();
  if (!sources.length) return null;
  return (
    <p className="source">
      <b>{t.story.sources}</b>{" "}
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
  const { lang, t } = useI18n();
  return (
    <section className="lead" aria-labelledby="lead-h">
      <p className="label label-section">
        {sectionName(t, story.section)} · {t.story.lead}
      </p>
      <h2 className="lead-h" id="lead-h">
        <Link href={storyHref(lang, town, story)}>{story.headline}</Link>
      </h2>
      <p className="lead-sum">{story.summary}</p>
      <SourceLine sources={story.sources} />
    </section>
  );
}

export function StoryArticle({ story, town }: { story: Story; town: string }) {
  const { lang, t } = useI18n();
  return (
    <article className="story">
      <div className="story-meta">
        <p className="label label-section">{sectionName(t, story.section)}</p>
      </div>
      <h3 className="story-h">
        <Link href={storyHref(lang, town, story)}>{story.headline}</Link>
      </h3>
      <p>{story.summary}</p>
      <SourceLine sources={story.sources} />
    </article>
  );
}
