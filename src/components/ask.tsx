"use client";

import { useState } from "react";
import { useAsk } from "@/lib/use-ask";
import type { Article, Story } from "@/lib/types";
import { CitedText } from "./cited-text";

const SUGGESTED = ["When is the next meeting or vote?", "How can residents weigh in?", "What happens next?"];

export function AskFollowUp({ town, story, article }: { town: string; story: Story; article: Article }) {
  const { turns, busy, ask } = useAsk(town, story, article);
  const [text, setText] = useState("");
  const lastAsked = turns.at(-1)?.question;

  return (
    <section className="ask" aria-labelledby="ask-h">
      <div className="ask-head">
        <h2 className="card-title" id="ask-h" style={{ margin: 0 }}>
          Ask a follow-up
        </h2>
        <span className="ask-tag">AI</span>
      </div>
      <p className="fine" style={{ color: "var(--color-ink)" }}>
        Questions about this story, answered from the latest local reporting. Pick one or type your own.
      </p>
      <div className="q-list" role="group" aria-label="Suggested questions">
        {SUGGESTED.map((q) => (
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
          Your question about this story
        </label>
        <input
          className="input"
          id="ask-in"
          type="text"
          placeholder="Ask about this story"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>
          Ask
        </button>
      </form>

      {turns.map((turn, i) => (
        <div className="answer" role="status" aria-busy={!turn.answer} key={i}>
          {/* div, not p: the design's `.answer p` rule would override .answer-q */}
          <div className="answer-q">You asked: {turn.question}</div>
          {turn.answer ? (
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
              <p className="fact-line">Checking the latest reporting…</p>
            </div>
          )}
        </div>
      ))}

      <p className="fine" style={{ marginTop: 12 }}>
        Answers are written by AI and can be wrong. Check the linked sources.
      </p>
    </section>
  );
}
