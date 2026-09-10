import { useEffect, useRef, useState } from "react";
import { createBus } from "../bus/channel";
import { PARSER_CASES, runAllParserCases } from "../domain/parser.cases";
import type { ParserCaseResult } from "../domain/parser.cases";
import { useExamStore } from "../store/examStore";
import { ArchStrip } from "./ArchStrip";
import { CaptionBand } from "./CaptionBand";
import { HeroTooth } from "./HeroTooth";
import { ParserResults } from "./ParserResults";
import { TakeHomeCard } from "./TakeHomeCard";
import { TimelineScrubber } from "./TimelineScrubber";

export function PatientView() {
  const store = useExamStore();
  const busRef = useRef<ReturnType<typeof createBus> | null>(null);
  const [parserResults, setParserResults] = useState<ParserCaseResult[]>();

  useEffect(() => {
    const bus = createBus((message) => {
      if (message.type === "chart-event") {
        useExamStore.getState().applyChartEvent(message.event);
      }
    });
    busRef.current = bus;
    return () => bus.close();
  }, []);

  return (
    <main className="screen patient">
      <header className="topbar" style={{ padding: "20px 24px 0" }}>
        <div>
          <p className="eyebrow">Patient view</p>
          <h1>Your checkup, in plain language</h1>
          <div className="controls" style={{ marginTop: 12 }}>
            <button className="primary" type="button" onClick={() => setParserResults(runAllParserCases())}>
              Run {PARSER_CASES.length} parser cases
            </button>
          </div>
        </div>
      </header>
      <HeroTooth
        current={store.current}
        lastVisit={store.lastVisit}
        timeline={store.timeline}
        activeTooth={store.activeTooth}
        lastMention={store.lastMention}
      />
      <CaptionBand text={store.caption} />
      <ArchStrip exam={store.current} activeTooth={store.activeTooth} />
      <TimelineScrubber value={store.timeline} onChange={store.setTimeline} />
      {parserResults ? (
        <div className="parser-overlay">
          <ParserResults results={parserResults} onClose={() => setParserResults(undefined)} />
        </div>
      ) : null}
      {store.summary ? (
        <TakeHomeCard name={store.current.patientName} date={store.current.date} sentences={store.summary} />
      ) : null}
    </main>
  );
}
