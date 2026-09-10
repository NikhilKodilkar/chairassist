import { useEffect, useRef } from "react";
import { createBus } from "../bus/channel";
import { useExamStore } from "../store/examStore";
import { ArchStrip } from "./ArchStrip";
import { CaptionBand } from "./CaptionBand";
import { HeroTooth } from "./HeroTooth";
import { TakeHomeCard } from "./TakeHomeCard";
import { TimelineScrubber } from "./TimelineScrubber";

export function PatientView() {
  const store = useExamStore();
  const busRef = useRef<ReturnType<typeof createBus> | null>(null);

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
        </div>
      </header>
      <HeroTooth current={store.current} lastVisit={store.lastVisit} timeline={store.timeline} />
      <CaptionBand text={store.caption} />
      <ArchStrip exam={store.current} />
      <TimelineScrubber value={store.timeline} onChange={store.setTimeline} />
      {store.summary ? (
        <TakeHomeCard name={store.current.patientName} date={store.current.date} sentences={store.summary} />
      ) : null}
    </main>
  );
}
