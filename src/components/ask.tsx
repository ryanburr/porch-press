"use client";

import { useState } from "react";
import { fill } from "@/lib/i18n";
import { useAsk } from "@/lib/use-ask";
import type { Article, Story } from "@/lib/types";
import { CitedText } from "./cited-text";
import { useI18n } from "./i18n";

export function AskFollowUp({ town, story, article }: { town: string; story: Story; article: Article }) {
  const { lang, t } = useI18n();
  const { turns, busy, ask } = useAsk(town, story, article, lang);
  const [text, setText] = useState("");
  const lastAsked = turns.at(-1)?.question;

  return (
    <section className="ask" aria-labelledby="ask-h">
      <div className="ask-head">
        <h2 className="card-title" id="ask-h" style={{ margin: 0 }}>
          {t.ask.title}
        </h2>
        <span className="ask-tag">{t.ask.tag}</span>
      </div>
      <p className="fine" style={{ color: "var(--color-ink)" }}>
        {t.ask.intro}
      </p>
      <div className="q-list" role="group" aria-label={t.ask.suggestedLabel}>
        {t.ask.suggested.map((q) => (
          <button key={q} className="q-chip" type="button" aria-pressed={lastAsked === q} disabled={busy} onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
          setText("");
        }}
      >
        <label className="sr" htmlFor="ask-in">
          {t.ask.inputLabel}
        </label>
        <input
          className="input"
          id="ask-in"
          type="text"
          placeholder={t.ask.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>
          {t.ask.submit}
        </button>
      </form>

      {turns.map((turn, i) => (
        <div className="answer" role="status" aria-busy={!turn.answer && !turn.failed} key={i}>
          {/* div, not p: the design's `.answer p` rule would override .answer-q */}
          <div className="answer-q">{fill(t.ask.youAsked, { question: turn.question })}</div>
          {turn.failed ? (
            <p>{t.ask.failed}</p>
          ) : turn.answer ? (
            turn.answer
              .split(/\n+/)
              .filter((p) => p.trim())
              .map((p, j) => (
                <p key={j}>
                  <CitedText text={p} sources={turn.sources} />
                </p>
              ))
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="press" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <p className="fact-line">{t.ask.checking}</p>
            </div>
          )}
        </div>
      ))}

      <p className="fine" style={{ marginTop: 12 }}>
        {t.ask.disclaimer}
      </p>
    </section>
  );
}
