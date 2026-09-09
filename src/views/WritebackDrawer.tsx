import type { WritebackItem } from "../store/examStore";

export function WritebackDrawer({ items }: { items: WritebackItem[] }) {
  return (
    <section className="panel">
      <h2>Open Dental — Periodontal Exam API (mock)</h2>
      {items.length === 0 ? <p className="hint">Write-back payloads will land here live.</p> : null}
      {items.map((item) => (
        <pre className="writeback" key={item.at}>
          {item.at}
          {"\n"}
          {JSON.stringify(item.payload, null, 2)}
        </pre>
      ))}
    </section>
  );
}
