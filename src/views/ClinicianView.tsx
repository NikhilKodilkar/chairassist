import { useEffect, useRef, useState } from "react";
import { listMics, openMic, pickPreferredMic } from "../audio/devices";
import type { MicDevice } from "../audio/devices";
import { createWhisperSession } from "../audio/stt";
import type { SttStatus } from "../audio/stt";
import { attachEnergyVad } from "../audio/vad";
import { createBus } from "../bus/channel";
import { parseUtterance, createParserContext } from "../domain/parser";
import type { ParserContext } from "../domain/parser";
import { DEMO1_LINES } from "../rehearsal/demo1";
import { useExamStore } from "../store/examStore";
import { HeardTicker } from "./HeardTicker";
import { MicBar } from "./MicBar";
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
  const sessionRef = useRef<ReturnType<typeof createWhisperSession> | null>(null);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const publishUtterance = (raw: string) => {
    const parsed = parseUtterance(raw, parser.current);
    parser.current = parsed.context;
    busRef.current?.publish({ type: "chart-event", event: parsed.event });
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
      const preferred = pickPreferredMic(next);
      setSelectedId((current) => current ?? preferred?.id);
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
        setSelectedId((current) => current ?? pickPreferredMic(next)?.id);
      });
    };
    navigator.mediaDevices.addEventListener("devicechange", onChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", onChange);
  }, []);

  const startMic = async () => {
    sessionRef.current?.load();
    const stream = await openMic(selectedId);
    streamRef.current = stream;
    setListening(true);
    vadRef.current = attachEnergyVad(stream, {
      silenceMs: 300,
      minSpeechMs: 250,
      threshold: 0.02,
      onLevel: (nextLevel, nextSpeaking) => {
        setLevel(nextLevel);
        setSpeaking(nextSpeaking);
      },
      onUtterance: (samples, sampleRate) => {
        const session = sessionRef.current;
        if (!session) {
          return;
        }
        void session
          .transcribe(samples, sampleRate)
          .then((text) => {
            if (text) {
              publishUtterance(text);
            }
          })
          .catch((error: unknown) => {
            setStatus("error");
            setStatusDetail(error instanceof Error ? error.message : "Transcription failed");
          });
      },
    });
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
        <div>
          <p className="eyebrow">Clinician view</p>
          <h1>{store.current.patientName}</h1>
          <p className="hint">
            {rehearsal ? "Rehearsal mode: spacebar advances the script." : "Live mic or push a test event."}
          </p>
        </div>
        <div className="controls">
          <button type="button" onClick={() => void refreshDevices()}>
            Refresh mics
          </button>
          <button
            className="primary"
            type="button"
            onClick={() => publishUtterance("tooth fourteen, distal five, bleeding")}
          >
            Test event
          </button>
          <button type="button" onClick={() => publishUtterance(DEMO1_LINES[step.current++] ?? "let's wrap up")}>
            Next script line
          </button>
        </div>
      </header>

      <MicBar
        devices={devices}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onStart={() => void startMic()}
        onStop={stopMic}
        listening={listening}
        level={level}
        speaking={speaking}
        status={status}
        statusDetail={statusDetail}
      />

      <PerioGrid exam={store.current} lastVisit={store.lastVisit} activeTooth={store.activeTooth} />

      <div className="heard">
        <HeardTicker items={store.heard} />
        <WritebackDrawer items={store.writebacks} />
      </div>
    </main>
  );
}
