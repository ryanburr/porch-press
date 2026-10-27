import { fill } from "@/lib/i18n";
import { useI18n } from "./i18n";

export function Loading({ town }: { town: string }) {
  const { t } = useI18n();
  return (
    <div className="state" role="status">
      <span className="press" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p className="state-title">{t.states.loading}</p>
      <p className="state-note">{fill(t.states.loadingNote, { town })}</p>
    </div>
  );
}

export function PressJam({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="state" role="alert">
      <p className="state-note is-error">{t.states.jam}</p>
      <button className="btn" type="button" onClick={onRetry}>
        {t.states.retry}
      </button>
    </div>
  );
}
