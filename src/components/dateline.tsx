"use client";

import { longDate } from "@/lib/dates";
import { fill } from "@/lib/i18n";
import type { Place } from "@/lib/places";
import { useI18n } from "./i18n";
import { PlacePicker } from "./place-picker";

type Props = {
  place: Place;
  date?: string;
  busy: boolean;
  onPlaceChange: (place: Place) => void;
};

export function Dateline({ place, date, busy, onPlaceChange }: Props) {
  const { lang, t } = useI18n();
  return (
    <div className="dateline">
      <div className="dl-ed">
        <span className="dl-name">{fill(t.front.edition, { place: place.name })}</span>
        {date && <span className="dl-date">{longDate(date, lang)}</span>}
      </div>
      <div className="dl-controls">
        <PlacePicker selected={place} disabled={busy} onChoose={onPlaceChange} />
        <button className="btn btn-primary" type="button" aria-busy={busy} onClick={() => window.print()}>
          {t.front.print}
        </button>
      </div>
    </div>
  );
}
