import type { HeardItem } from "../store/examStore";

export function HeardTicker({ items }: { items: HeardItem[] }) {
  return (
    <section className="panel">
      <h2>Heard</h2>
      {items.length === 0 ? <p className="hint">Waiting for speech or spacebar…</p> : null}
      {items.map((item, index) => (
        <div className="heard-item" key={`${item.text}-${index}`}>
          <span>{item.text}</span>
          <span className={item.confidence}>{item.confidence}</span>
        </div>
      ))}
    </section>
  );
}
