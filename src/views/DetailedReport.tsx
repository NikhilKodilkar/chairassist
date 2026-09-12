import { detailedReportLines } from "../domain/exam";
import type { Exam } from "../domain/types";

export function DetailedReport({ exam }: { exam: Exam }) {
  const lines = detailedReportLines(exam);
  return (
    <section className="panel report-panel">
      <h2>Detailed report</h2>
      {lines.length === 0 ? (
        <p className="hint">Clinical notes land here — including negatives like “no bleeding.”</p>
      ) : (
        <ul className="report-list">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
