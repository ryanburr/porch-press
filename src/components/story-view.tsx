"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AskFollowUp } from "@/components/ask";
import { CitedText } from "@/components/cited-text";
import { Masthead } from "@/components/masthead";
import { Loading, PressJam } from "@/components/states";
import { longDate, safeDecode } from "@/lib/dates";
import { PLACES } from "@/lib/places";
import { paragraphsOf, useArticle } from "@/lib/use-article";
import { useEdition } from "@/lib/use-edition";

export function StoryView() {
  const params = useParams<{ town: string; id: string }>();
  const town = safeDecode(params.town);
  const placeName = PLACES.find((p) => p.query === town)?.name ?? town;
  const { edition, error: editionError, loading, reprint } = useEdition(town);
  const story = edition?.stories.find((s) => s.id === params.id);
  const { article, error: articleError } = useArticle(edition, story);

  return (
    <div className="pp">
      <a className="skip" href="#story">
        Skip to the story
      </a>
      <div className="page">
        <Masthead />
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">← Front page</Link>
          {story && (
            <>
              <span aria-hidden="true">/</span>
              <span>{story.section}</span>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span>
            {placeName} Edition{edition && ` · ${longDate(edition.date)}`}
          </span>
        </nav>

        {loading && <Loading town={placeName} />}
        {!loading && editionError && <PressJam onRetry={reprint} />}
        {!loading && edition && !story && (
          <div className="state">
            <p className="state-title">This story isn&apos;t in today&apos;s paper</p>
            <p className="state-note">Editions change each day. Head back to the front page for today&apos;s news.</p>
            <Link className="btn" href="/">
              Back to the front page
            </Link>
          </div>
        )}

        {story && (
          <div className="layout" id="story">
            <main>
              <article>
                <header className="article-head">
                  <p className="label label-section">{story.section}</p>
                  <h1 className="article-h">{story.headline}</h1>
                  <p className="byline">
                    Written by AI from local reporting
                    {article && ` · ${article.sources.length} sources`}
                  </p>
                </header>

                {articleError && <p className="state-note is-error">Our reporter couldn&apos;t file this story. Try again.</p>}
                {!article && !articleError && (
                  <div className="state" role="status">
                    <span className="press" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <p className="state-title">Filing the full story…</p>
                    <p className="state-note">{story.summary}</p>
                  </div>
                )}
                {article && (
                  <>
                    <div className="article-body">
                      {paragraphsOf(article).map((p, i) => (
                        <p key={i}>
                          <CitedText text={p} sources={article.sources} />
                        </p>
                      ))}
                    </div>
                    <AskFollowUp town={town} story={story} article={article} />
                  </>
                )}
              </article>
            </main>

            <aside className="sidebar" aria-label="About this story">
              {article && article.sources.length > 0 && (
                <section className="card todo" aria-labelledby="src-h">
                  <h2 className="card-label" id="src-h">
                    <span>Sources</span>
                  </h2>
                  <ol className="actions" style={{ listStyle: "decimal" }}>
                    {article.sources.map((s, i) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title ?? s.url}
                        </a>
                        {s.id && s.id !== i + 1 && <span className="meta"> [{s.id}]</span>}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <section className="card" aria-labelledby="share-h">
                <h2 className="card-label" id="share-h">
                  <span>Share or print</span>
                </h2>
                <div style={{ display: "grid", gap: 8 }}>
                  <button className="btn btn-block" type="button" onClick={() => navigator.clipboard?.writeText(location.href)}>
                    Copy link
                  </button>
                  <button className="btn btn-block" type="button" onClick={() => window.print()}>
                    Print, Letter size
                  </button>
                </div>
              </section>
              <Link className="btn btn-block" href="/">
                Back to the front page
              </Link>
            </aside>
          </div>
        )}

        <footer className="footer">
          <p>This paper is written by AI from local reporting. It can still make mistakes, so check the sources before you share.</p>
        </footer>
      </div>
    </div>
  );
}
