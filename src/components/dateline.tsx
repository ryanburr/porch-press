"use client";

import { longDate } from "@/lib/dates";
import type { Place } from "@/lib/places";
import { PlacePicker } from "./place-picker";

type Props = {
  place: Place;
  date?: string;
  busy: boolean;
  onPlaceChange: (place: Place) => void;
};

export function Dateline({ place, date, busy, onPlaceChange }: Props) {
  return (
    <div className="dateline">
      <div className="dl-ed">
        <span className="dl-name">{place.name} Edition</span>
        {date && <span className="dl-date">{longDate(date)}</span>}
      </div>
      <div className="dl-controls">
        <PlacePicker selected={place} disabled={busy} onChoose={onPlaceChange} />
        <button className="btn btn-primary" type="button" aria-busy={busy} onClick={() => window.print()}>
          Print my paper
        </button>
      </div>
    </div>
  );
}
