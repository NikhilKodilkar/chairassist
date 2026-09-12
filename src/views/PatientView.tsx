import { useState } from "react";
import { useLiveMic } from "../audio/useLiveMic";
import { runAllParserCases } from "../domain/parser.cases";
import type { ParserCaseResult } from "../domain/parser.cases";
import { useExamStore } from "../store/examStore";
import { AppLogo } from "./AppLogo";
import { ArchitectureLink } from "./ArchitectureLink";
import { JawMap } from "./JawMap";
import { MicBar } from "./MicBar";
import { ParserResults } from "./ParserResults";
import { TakeHomeCard } from "./TakeHomeCard";
import { ToothMeaning } from "./ToothMeaning";

export function PatientView() {
  const store = useExamStore();
  const mic = useLiveMic();
  const [parserResults, setParserResults] = useState<ParserCaseResult[]>();

  return (
    <main className="screen patient">
      <header className="topbar patient-topbar">
        <AppLogo compact />
        <div className="patient-title">
          <p className="eyebrow">MolarMind</p>
          <h1>Your checkup, in plain language</h1>
        </div>
        <div className="controls">
          <MicBar
            compact
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
          {store.helloName ? <p className="patient-hello">Hello {store.helloName}</p> : null}
        </div>
        <div className="header-tools">
          <ArchitectureLink />
          <button className="primary" type="button" onClick={() => setParserResults(runAllParserCases())}>
            Test suite
          </button>
        </div>
      </header>
      {store.heard[0] ? (
        <p className="patient-heard">
          {mic.speaking ? "Hearing you…" : "Heard"} · {store.heard[0].text}
        </p>
      ) : null}
      <div className="patient-body">
        <JawMap
          exam={store.current}
          lastVisit={store.lastVisit}
          activeTooth={store.activeTooth}
          focusTeeth={store.focusTeeth}
          lastMention={store.lastMention}
          onSelectTooth={store.selectTooth}
        />
        <ToothMeaning
          exam={store.current}
          lastVisit={store.lastVisit}
          activeTooth={store.activeTooth}
          lastMention={store.lastMention}
          caption={store.caption}
          onSelectTooth={store.selectTooth}
          onShowAll={store.clearToothFocus}
        />
      </div>
      {parserResults ? (
        <div className="parser-overlay">
          <ParserResults results={parserResults} onClose={() => setParserResults(undefined)} />
        </div>
      ) : null}
      {store.summary ? (
        <TakeHomeCard name={store.current.patientName} date={store.current.date} sentences={store.summary} />
      ) : null}
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
    </main>
  );
}
