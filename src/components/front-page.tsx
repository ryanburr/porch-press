"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dateline } from "@/components/dateline";
import { Masthead } from "@/components/masthead";
import { BriefsCard, WeatherCard } from "@/components/sidebar";
import { Loading, PressJam } from "@/components/states";
import { LeadStory, StoryArticle } from "@/components/story";
import { DETROIT, frontPageHref, placeFor, type Place } from "@/lib/places";
import { useEdition } from "@/lib/use-edition";

export function FrontPage() {
  const router = useRouter();
  // The place lives in the URL so article pages can link back to it.
  const place = placeFor(useSearchParams().get("town") ?? DETROIT.query);
  const setPlace = (next: Place) =>
    router.replace(frontPageHref(next.query), { scroll: false });
  const { edition, error, loading, reprint } = useEdition(place.query);
  const [lead, ...stories] = edition?.stories ?? [];
  const columns = [
    stories.filter((_, i) => i % 2 === 0),
    stories.filter((_, i) => i % 2 === 1),
  ];

  return (
    <div className="pp">
      <a className="skip" href="#news">
        Skip to the news
      </a>
      <div className="page">
        <Masthead />
        <Dateline
          place={place}
          date={edition?.date}
          busy={loading}
          onPlaceChange={setPlace}
        />

        <main id="news">
          {loading && <Loading town={place.name} />}
          {!loading && error && <PressJam onRetry={reprint} />}
          {!loading && edition && lead && (
            <>
              {edition.sample && (
                <div className="share">
                  <span className="label">Sample edition</span>
                  <span className="meta">
                    Add a Perplexity API key to print today&apos;s real news.
                  </span>
                </div>
              )}
              <LeadStory story={lead} town={place.query} />
              <div className="layout">
                <div className="stories">
                  {columns.map((col, i) => (
                    <div className="col" key={i}>
                      {col.map((story) => (
                        <StoryArticle
                          key={story.id}
                          story={story}
                          town={place.query}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <aside className="sidebar" aria-label="At a glance">
                  <WeatherCard weather={edition.weather} />
                  <BriefsCard briefs={edition.briefs} />
                </aside>
              </div>
            </>
          )}
        </main>

        <footer className="footer">
          <p>
            <b style={{ color: "var(--color-ink)" }}>How it works:</b> AI
            curates today&apos;s local reporting into one front page. Every
            story links to the sources it came from.
          </p>
          <p>
            This paper is written by AI. It can still make mistakes, so check
            the sources before you share.
          </p>
        </footer>
      </div>
    </div>
  );
}
