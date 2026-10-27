export function Loading({ town }: { town: string }) {
  return (
    <div className="state" role="status">
      <span className="press" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p className="state-title">Stopping the presses…</p>
      <p className="state-note">Writing today&apos;s paper for {town}.</p>
    </div>
  );
}

export function PressJam({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="state" role="alert">
      <p className="state-note is-error">The press jammed: we could not load this edition.</p>
      <button className="btn" type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
