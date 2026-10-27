import { useI18n } from "./i18n";

export function WeatherCard({ weather }: { weather: string }) {
  const { t } = useI18n();
  return (
    <section className="card" aria-labelledby="weather-h">
      <h2 className="card-label" id="weather-h">
        <span>{t.sidebar.weather}</span>
      </h2>
      <p className="num-label">{weather}</p>
    </section>
  );
}

export function BriefsCard({ briefs }: { briefs: string[] }) {
  const { t } = useI18n();
  if (!briefs.length) return null;
  return (
    <section className="card todo" aria-labelledby="briefs-h">
      <h2 className="card-label" id="briefs-h">
        <span>{t.sidebar.briefs}</span>
      </h2>
      <ul className="actions">
        {briefs.map((brief) => (
          <li key={brief}>{brief}</li>
        ))}
      </ul>
    </section>
  );
}
