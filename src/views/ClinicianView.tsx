import { useEffect, useRef, useState } from "react";
import { listMics, openMic, selectMicId } from "../audio/devices";
import type { MicDevice } from "../audio/devices";
import { createWhisperSession } from "../audio/stt";
import type { SttStatus } from "../audio/stt";
import { isUsableTranscript } from "../audio/transcript";
import { attachEnergyVad } from "../audio/vad";
import { createBus } from "../bus/channel";
import { parseUtterance, createParserContext } from "../domain/parser";
import type { ParserContext } from "../domain/parser";
import { PARSER_CASES, runAllParserCases } from "../domain/parser.cases";
import type { ParserCaseResult } from "../domain/parser.cases";
import { DEMO1_LINES } from "../rehearsal/demo1";
import { useExamStore } from "../store/examStore";
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
  const parser = useRef<ParserContext>(createParserContext());
  const busRef = useRef<ReturnType<typeof createBus> | null>(null);
  const [devices, setDevices] = useState<MicDevice[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState<SttStatus>("idle");
  const [statusDetail, setStatusDetail] = useState<string>();
  const [captureHint, setCaptureHint] = useState("Mic idle");
  const [parserResults, setParserResults] = useState<ParserCaseResult[]>();
  const sessionRef = useRef<ReturnType<typeof createWhisperSession> | null>(null);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const publishUtterance = (raw: string) => {
    const parsed = parseUtterance(raw, parser.current);
    parser.current = parsed.context;
    const event = parsed.event;
    console.log("[clinician] parse", {
      raw,
      kind: event.kind,
      tooth: event.tooth,
      side: event.side,
      sites: event.sites,
      readings: event.readings,
      confidence: event.confidence,
    });
    busRef.current?.publish({ type: "chart-event", event });
  };

  useEffect(() => {
    const bus = createBus((message) => {
      if (message.type === "chart-event") {
        useExamStore.getState().applyChartEvent(message.event);
      }
    });
    busRef.current = bus;
    return () => bus.close();
  }, []);

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
      publishUtterance(line);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rehearsal]);

  useEffect(() => {
    const session = createWhisperSession((next, detail) => {
      setStatus(next);
      setStatusDetail(detail);
    });
    sessionRef.current = session;
    return () => session.dispose();
  }, []);

  const refreshDevices = async () => {
    try {
      const stream = await openMic();
      stream.getTracks().forEach((track) => track.stop());
      const next = await listMics();
      setDevices(next);
      setSelectedId((current) => selectMicId(current, next));
    } catch (error) {
      setStatus("error");
      setStatusDetail(error instanceof Error ? error.message : "Mic permission denied");
    }
  };

  useEffect(() => {
    void refreshDevices();
    const onChange = () => {
      void listMics().then((next) => {
        setDevices(next);
        setSelectedId((current) => selectMicId(current, next));
      });
    };
    navigator.mediaDevices.addEventListener("devicechange", onChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", onChange);
  }, []);

  const startMic = async () => {
    try {
      sessionRef.current?.load();
      const stream = await openMic(selectedId);
      streamRef.current = stream;
      setListening(true);
      setCaptureHint("Mic open — waiting for speech");
      vadRef.current = attachEnergyVad(stream, {
        silenceMs: 550,
        minSpeechMs: 700,
        threshold: 0.012,
        onLevel: (nextLevel, nextSpeaking, detail) => {
          setLevel(nextLevel);
          setSpeaking(nextSpeaking);
          setCaptureHint(detail);
        },
        onUtterance: (samples, sampleRate) => {
          const session = sessionRef.current;
          if (!session) {
            return;
          }
          useExamStore.getState().setHeard({ text: "Transcribing…", confidence: "low" });
          void session
            .transcribe(samples, sampleRate)
            .then((text) => {
              const usable = Boolean(text) && isUsableTranscript(text);
              console.log("[clinician] transcript", {
                text,
                usable,
                samples: samples.length,
                sampleRate,
              });
              if (!text) {
                useExamStore.getState().setHeard({ text: "(empty transcript)", confidence: "low" });
                return;
              }
              if (usable) {
                publishUtterance(text);
                return;
              }
              console.log("[clinician] skip chart — transcript looks like junk, not a perio line");
              useExamStore.getState().setHeard({ text, confidence: "low" });
            })
            .catch((error: unknown) => {
              const message = error instanceof Error ? error.message : "Transcription failed";
              console.log("[clinician] transcribe error", message);
              useExamStore.getState().setHeard({ text: message, confidence: "low" });
            });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mic failed to start";
      setListening(false);
      setCaptureHint(message);
      useExamStore.getState().setHeard({ text: message, confidence: "low" });
    }
  };

  const stopMic = () => {
    vadRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setListening(false);
    setSpeaking(false);
    setLevel(0);
  };

  return (
    <main className="screen clinician">
      <header className="topbar">
        <h1>{store.current.patientName}</h1>
        <p className="hint">
          {rehearsal ? "Rehearsal · spacebar advances the script" : "Live mic"}
        </p>
        <div className="controls">
          <button
            className="primary"
            type="button"
            onClick={() => publishUtterance("tooth fourteen, distal five, bleeding")}
          >
            Test event
          </button>
          <button type="button" onClick={() => publishUtterance(DEMO1_LINES[step.current++] ?? "let's wrap up")}>
            Next line
          </button>
          <button type="button" onClick={() => setParserResults(runAllParserCases())}>
            Parser {PARSER_CASES.length}
          </button>
        </div>
      </header>

      <MicBar
        devices={devices}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onStart={() => void startMic()}
        onStop={stopMic}
        onRefresh={() => void refreshDevices()}
        listening={listening}
        level={level}
        speaking={speaking}
        status={status}
        statusDetail={statusDetail}
      />

      <div className="heard-and-script">
        <HeardTicker items={store.heard} captureHint={captureHint} />
        <HygienistScript
          onUtterance={publishUtterance}
          onNarration={(text) => useExamStore.getState().setHeard({ text, confidence: "high" })}
          onReset={() => {
            parser.current = createParserContext();
            useExamStore.getState().resetExam();
            step.current = 0;
          }}
        />
      </div>

      <div className="chart-and-writeback">
        <PerioGrid exam={store.current} lastVisit={store.lastVisit} activeTooth={store.activeTooth} />
        <WritebackDrawer items={store.writebacks} />
      </div>

      {parserResults ? <ParserResults results={parserResults} onClose={() => setParserResults(undefined)} /> : null}
    </main>
  );
}
