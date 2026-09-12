import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveMic } from "../audio/useLiveMic";
import { runAllParserCases } from "../domain/parser.cases";
import type { ParserCaseResult } from "../domain/parser.cases";
import { DEMO1_LINES } from "../rehearsal/demo1";
import { useExamStore } from "../store/examStore";
import { clinicianNeoPath } from "../config/paths";
import { AppLogo } from "./AppLogo";
import { ArchitectureLink } from "./ArchitectureLink";
import { DetailedReport } from "./DetailedReport";
import { HeardTicker } from "./HeardTicker";
import { HygienistScript } from "./HygienistScript";
import { MicBar } from "./MicBar";
import { ParserResults } from "./ParserResults";
import { PerioGrid } from "./PerioGrid";
import { WritebackDrawer } from "./WritebackDrawer";

function useQueryFlag(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function ClinicianView() {
  const store = useExamStore();
  const script = useQueryFlag("script");
  const rehearsal = script === "demo1";
  const step = useRef(0);
  const [parserResults, setParserResults] = useState<ParserCaseResult[]>();
  const [scriptOpen, setScriptOpen] = useState(false);
  const mic = useLiveMic();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" || !rehearsal) {
        return;
      }
      event.preventDefault();
      const line = DEMO1_LINES[step.current];
      if (!line) {
        return;
      }
      step.current += 1;
      mic.publishUtterance(line);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rehearsal, mic.publishUtterance]);

  return (
    <main className="screen clinician">
      <header className="topbar">
        <AppLogo compact />
        <h1>{store.current.patientName}</h1>
        <div className="controls">
          <button
            className="primary"
            type="button"
            onClick={() => mic.publishUtterance("tooth fourteen, distal five, bleeding")}
          >
            Test event
          </button>
          <button type="button" onClick={() => mic.publishUtterance(DEMO1_LINES[step.current++] ?? "let's wrap up")}>
            Next line
          </button>
          <button type="button" onClick={() => setScriptOpen((value) => !value)}>
            {scriptOpen ? "Hide script" : "Show script"}
          </button>
        </div>
        <MicBar
          devices={mic.devices}
          selectedId={mic.selectedId}
          onSelect={mic.setSelectedId}
          onStart={() => void mic.startMic()}
          onStop={mic.stopMic}
          onRefresh={() => void mic.refreshDevices()}
          listening={mic.listening}
          level={mic.level}
          speaking={mic.speaking}
          status={mic.status}
          statusDetail={mic.statusDetail}
        />
        <div className="header-tools">
          <Link className="header-link" to={clinicianNeoPath}>
            Neo
          </Link>
          <ArchitectureLink />
          <button type="button" onClick={() => setParserResults(runAllParserCases())}>
            Test suite
          </button>
        </div>
      </header>

      <HeardTicker items={store.heard} speaking={mic.speaking} />
      <div className="heard-and-script">
        <HygienistScript
          open={scriptOpen}
          onUtterance={mic.publishUtterance}
          onNarration={(text) => useExamStore.getState().setHeard({ text, confidence: "high" })}
          onReset={() => {
            mic.resetParser();
            useExamStore.getState().resetExam();
            step.current = 0;
          }}
        />
      </div>

      <div className="chart-and-writeback">
        <PerioGrid exam={store.current} lastVisit={store.lastVisit} activeTooth={store.activeTooth} />
        <div className="report-and-writeback">
          <DetailedReport exam={store.current} />
          <WritebackDrawer items={store.writebacks} />
        </div>
      </div>

      {mic.pendingResetAll ? (
        <div className="confirm-overlay">
          <section className="panel confirm-dialog">
            <h2>Reset all charted data?</h2>
            <p className="hint">This clears today’s perio chart for {store.current.patientName}. Last-visit values stay.</p>
            <div className="controls">
              <button type="button" onClick={mic.cancelResetAll}>
                Cancel
              </button>
              <button className="primary" type="button" onClick={mic.confirmResetAll}>
                Reset all
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {parserResults ? <ParserResults results={parserResults} onClose={() => setParserResults(undefined)} /> : null}
    </main>
  );
}
