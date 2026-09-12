import { isOpenDentalCall } from "../pms/opendental";
import type { WritebackItem } from "../store/examStore";

function methodClass(method: string): string {
  return `od-method ${method.toLowerCase()}`;
}

function formatBody(value: Record<string, unknown> | null): string {
  if (!value) {
    return "";
  }
  return JSON.stringify(value, null, 2);
}

function formatHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}`)
    .join("\n");
}

export function WritebackDrawer({ items }: { items: WritebackItem[] }) {
  return (
    <section className="panel writeback-panel">
      <h2>Open Dental write-back</h2>
      {items.length === 0 ? (
        <p className="hint">Mock API calls appear here when a reading is charted.</p>
      ) : (
        <p className="hint">Mocked Open Dental API v1 — request is built, not sent.</p>
      )}
      {items.map((item) => {
        if (!isOpenDentalCall(item.payload)) {
          return (
            <pre className="writeback" key={item.at}>
              <span className="writeback-time">{item.at}</span>
              {JSON.stringify(item.payload, null, 2)}
            </pre>
          );
        }
        const call = item.payload;
        return (
          <article className="od-call" key={call.id}>
            <header className="od-call-head">
              <span className={methodClass(call.method)}>{call.method}</span>
              <span className="od-path">{call.path}</span>
              <span className="od-status">
                {call.status} {call.statusText}
              </span>
            </header>
            <p className="od-label">{call.label}</p>
            <p className="od-url">{call.url}</p>
            <pre className="writeback">
              {formatHeaders(call.requestHeaders)}
              {"\n\n"}
              {formatBody(call.requestBody)}
            </pre>
            <p className="od-response-label">Response</p>
            <pre className="writeback od-response">{formatBody(call.responseBody)}</pre>
          </article>
        );
      })}
    </section>
  );
}
