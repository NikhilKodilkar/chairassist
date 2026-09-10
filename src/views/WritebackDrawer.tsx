import type { WritebackItem } from "../store/examStore";

export function WritebackDrawer({ items }: { items: WritebackItem[] }) {
  return (
    <section className="panel writeback-panel">
      <h2>Open Dental write-back</h2>
      {items.length === 0 ? <p className="hint">Payloads appear here when a reading is charted.</p> : null}
      {items.map((item) => (
        <pre className="writeback" key={item.at}>
          <span className="writeback-time">{item.at}</span>
          {JSON.stringify(item.payload, null, 2)}
        </pre>
      ))}
    </section>
  );
}
