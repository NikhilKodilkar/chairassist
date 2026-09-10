import type { HeardItem } from "../store/examStore";

export function HeardTicker({ items }: { items: HeardItem[] }) {
  const latest = items[0];

  return (
    <section className="panel heard-live">
      <h2>Heard</h2>
      {latest ? (
        <p className={`heard-latest ${latest.confidence}`}>{latest.text}</p>
      ) : (
        <p className="heard-latest muted">Say a line — the raw transcript lands here.</p>
      )}
      {items.length === 0 ? null : (
        <div className="heard-log">
          {items.map((item, index) => (
            <div className="heard-item" key={`${item.text}-${index}`}>
              <span>{item.text}</span>
              <span className={item.confidence}>{item.confidence}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
