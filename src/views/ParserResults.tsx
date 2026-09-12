import type { ParserCaseResult } from "../domain/parser.cases";
import { formatEvent } from "../domain/parser.cases";

export function ParserResults({
  results,
  onClose,
}: {
  results: ParserCaseResult[];
  onClose: () => void;
}) {
  const passed = results.filter((result) => result.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <section className="panel parser-results">
      <div className="parser-results-head">
        <h2>Test suite</h2>
        <span className={allPassed ? "high" : "low"}>
          {passed}/{total} passed
        </span>
        <button type="button" onClick={onClose}>
          Hide
        </button>
      </div>
      <ol className="parser-case-list">
        {results.map((result, index) => (
          <li key={result.name} className={result.passed ? "pass" : "fail"}>
            <div className="parser-case-title">
              <strong>
                {index + 1}. {result.name}
              </strong>
              <span className={result.passed ? "high" : "low"}>{result.passed ? "pass" : "fail"}</span>
            </div>
            <p className="hint">“{result.lines.join(" → ")}”</p>
            <p className="writeback">{result.events.map(formatEvent).join("\n")}</p>
            {result.passed ? null : <p className="low">{result.detail}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
