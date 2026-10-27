"use client";

import { useState } from "react";
import { PLACES, type Place } from "@/lib/places";

type Props = {
  selected: Place;
  disabled: boolean;
  onChoose: (place: Place) => void;
};

function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <b>{text.slice(at, at + query.length)}</b>
      {text.slice(at + query.length)}
    </>
  );
}

// Selecting during the click is undone by the browser's own caret placement, so wait a frame.
const selectSoon = (input: HTMLInputElement) => requestAnimationFrame(() => input.select());

export function PlacePicker({ selected, disabled, onChoose }: Props) {
  const [text, setText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const q = (text ?? "").trim().toLowerCase();
  // Prefix matches first, then anywhere-in-name matches.
  const options = PLACES.filter((p) => p.name.toLowerCase().includes(q)).sort(
    (a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)),
  );
  const current = Math.min(active, Math.max(options.length - 1, 0));

  const close = () => {
    setOpen(false);
    setText(null);
    setActive(0);
  };
  const choose = (place: Place) => {
    close();
    if (place.query !== selected.query) onChoose(place);
  };

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive(Math.min(options.length - 1, current + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(0, current - 1));
    } else if (e.key === "Enter" && open && options[current]) {
      e.preventDefault();
      choose(options[current]);
    } else if (e.key === "Escape") {
      close();
    }
  }

  return (
    <div className="combo">
      <label className="sr" htmlFor="place-in">
        Find your neighborhood or town
      </label>
      <svg className="combo-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="M13 13l4.5 4.5" />
      </svg>
      <input
        className="input"
        id="place-in"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="place-list"
        aria-autocomplete="list"
        aria-activedescendant={open && options.length ? `place-opt-${current}` : undefined}
        autoComplete="off"
        placeholder="Search neighborhoods or towns"
        disabled={disabled}
        value={text ?? selected.name}
        onFocus={(e) => {
          setOpen(true);
          selectSoon(e.target);
        }}
        onClick={(e) => {
          if (open) return;
          setOpen(true);
          selectSoon(e.currentTarget);
        }}
        onBlur={close}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      {open && options.length > 0 && (
        <ul className="combo-list" id="place-list" role="listbox" aria-label="Neighborhoods and towns">
          {options.map((place, i) => (
            <li
              key={place.query}
              id={`place-opt-${i}`}
              className={`combo-opt ${i === current ? "is-active" : ""}`}
              role="option"
              aria-selected={i === current}
              // mousedown, not click, so the choice lands before the input's blur closes the list
              onMouseDown={(e) => {
                e.preventDefault();
                choose(place);
              }}
            >
              <span>
                <Highlight text={place.name} query={q} />
              </span>
              <span aria-hidden="true">{place.query === selected.query ? "✓" : ""}</span>
            </li>
          ))}
        </ul>
      )}
      {open && options.length === 0 && (
        <div className="combo-list" id="place-list">
          <p className="combo-note">No match for “{text}”. Check the spelling, or try a nearby neighborhood.</p>
        </div>
      )}
      <p className="sr" role="status">
        {open ? (options.length ? `${options.length} places found` : "No places found") : ""}
      </p>
    </div>
  );
}
