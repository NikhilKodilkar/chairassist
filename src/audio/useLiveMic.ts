import { useCallback, useEffect, useRef, useState } from "react";
import { createBus } from "../bus/channel";
import { interpretLingo } from "../domain/lingo";
import { createParserContext, parseUtterance } from "../domain/parser";
import type { ParserContext } from "../domain/parser";
import { useExamStore } from "../store/examStore";
import { listMics, openMic, selectMicId } from "./devices";
import type { MicDevice } from "./devices";
import { createWhisperSession } from "./stt";
import type { SttStatus } from "./stt";
import { isUsableTranscript } from "./transcript";
import { attachEnergyVad } from "./vad";

export function useLiveMic() {
  const parser = useRef<ParserContext>(createParserContext());
  const busRef = useRef<ReturnType<typeof createBus> | null>(null);
  const sessionRef = useRef<ReturnType<typeof createWhisperSession> | null>(null);
  const vadRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MicDevice[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState<SttStatus>("idle");
  const [statusDetail, setStatusDetail] = useState<string>();
  const [captureHint, setCaptureHint] = useState("Mic idle");
  const [pendingResetAll, setPendingResetAll] = useState(false);

  const publishUtterance = useCallback((raw: string) => {
    const lingo = interpretLingo(raw);
    console.log("[mic] lingo", {
      raw: lingo.raw,
      text: lingo.text,
      command: lingo.command,
      name: lingo.name,
      rewrote: lingo.rewrote,
    });

    if (lingo.command === "set_name" && lingo.name) {
      busRef.current?.publish({
        type: "chart-event",
        event: {
          kind: "set_name",
          note: lingo.name,
          raw: lingo.heard,
          confidence: "high",
        },
      });
      return;
    }

    if (lingo.command === "reset_all") {
      setPendingResetAll(true);
      useExamStore.getState().setHeard({ text: lingo.heard, confidence: "high" });
      return;
    }

    if (lingo.command === "reset_tooth") {
      const tooth = parser.current.tooth ?? useExamStore.getState().activeTooth;
      if (!tooth) {
        useExamStore.getState().setHeard({ text: "reset — no current tooth", confidence: "low" });
        return;
      }
      parser.current = {
        tooth,
        side: parser.current.side,
        lastSites: [],
        lastEvent: undefined,
      };
      busRef.current?.publish({
        type: "chart-event",
        event: {
          kind: "reset_tooth",
          tooth,
          raw: `${lingo.heard} #${tooth}`,
          confidence: "high",
        },
      });
      return;
    }

    const parsed = parseUtterance(lingo.text, parser.current);
    parser.current = parsed.context;
    const batch = parsed.events && parsed.events.length > 0 ? parsed.events : [parsed.event];
    for (const event of batch) {
      event.raw = lingo.heard;
      console.log("[mic] parse", {
        raw: lingo.heard,
        kind: event.kind,
        tooth: event.tooth,
        teeth: event.teeth,
        sites: event.sites,
        readings: event.readings,
        bopSites: event.bopSites,
        rec: event.rec,
        notes: event.notes,
        confidence: event.confidence,
      });
      busRef.current?.publish({ type: "chart-event", event });
    }
  }, []);

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
              console.log("[mic] transcript", {
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
              console.log("[mic] skip chart — transcript looks like junk, not a perio line");
              useExamStore.getState().setHeard({ text, confidence: "low" });
            })
            .catch((error: unknown) => {
              const message = error instanceof Error ? error.message : "Transcription failed";
              console.log("[mic] transcribe error", message);
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
    streamRef.current?.getTracks().forEach((track) => stopTrack(track));
    setListening(false);
    setSpeaking(false);
    setLevel(0);
  };

  const resetParser = () => {
    parser.current = createParserContext();
  };

  const confirmResetAll = () => {
    resetParser();
    useExamStore.getState().resetExam();
    setPendingResetAll(false);
    useExamStore.getState().setHeard({ text: "reset all — chart cleared", confidence: "high" });
  };

  return {
    devices,
    selectedId,
    setSelectedId,
    listening,
    level,
    speaking,
    status,
    statusDetail,
    captureHint,
    pendingResetAll,
    publishUtterance,
    startMic,
    stopMic,
    refreshDevices,
    resetParser,
    confirmResetAll,
    cancelResetAll: () => setPendingResetAll(false),
  };
}

function stopTrack(track: MediaStreamTrack) {
  track.stop();
}
