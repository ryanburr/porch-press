export function WeatherCard({ weather }: { weather: string }) {
  return (
    <section className="card" aria-labelledby="weather-h">
      <h2 className="card-label" id="weather-h">
        <span>Today&apos;s Weather</span>
      </h2>
      <p className="num-label">{weather}</p>
    </section>
  );
}

export function BriefsCard({ briefs }: { briefs: string[] }) {
  if (!briefs.length) return null;
  return (
    <section className="card todo" aria-labelledby="briefs-h">
      <h2 className="card-label" id="briefs-h">
        <span>In Brief</span>
      </h2>
      <ul className="actions">
        {briefs.map((brief) => (
          <li key={brief}>{brief}</li>
        ))}
      </ul>
    </section>
  );
}
