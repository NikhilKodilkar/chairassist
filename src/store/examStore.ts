import { create } from "zustand";
import { applyEvent } from "../domain/exam";
import { DEMO_PATIENT_NAME, createPatientFile, createTodayExam } from "../domain/seed";
import { captionForEvent, summarySentences } from "../domain/translator";
import type { ChartEvent, Exam, Site } from "../domain/types";
import { mockOpenDentalWritebacks, resetOpenDentalSession } from "../pms/opendental";
import type { OpenDentalCall } from "../pms/opendental";

const patient = createPatientFile();

export interface HeardItem {
  text: string;
  confidence: "high" | "low";
}

export interface WritebackItem {
  at: string;
  payload: OpenDentalCall | unknown;
}

export interface LastMention {
  id: number;
  tooth: number;
  teeth?: number[];
  sites: Site[];
  readings?: number[];
  bopSites?: Site[];
  rec?: number;
  note?: string;
  kind: ChartEvent["kind"];
}

interface ExamStore {
  lastVisit: Exam;
  current: Exam;
  activeTooth?: number;
  focusTeeth: number[];
  lastMention?: LastMention;
  caption?: string;
  summary?: string[];
  heard: HeardItem[];
  helloName?: string;
  writebacks: WritebackItem[];
  timeline: number;
  applyChartEvent: (event: ChartEvent) => void;
  selectTooth: (tooth: number) => void;
  clearToothFocus: () => void;
  setCaption: (text: string) => void;
  setSummary: (sentences: string[]) => void;
  setHeard: (item: HeardItem) => void;
  addWriteback: (payload: unknown) => void;
  resetExam: (exam?: Exam) => void;
  setTimeline: (value: number) => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  lastVisit: patient.lastVisit,
  current: createTodayExam(patient),
  heard: [],
  helloName: DEMO_PATIENT_NAME,
  writebacks: [],
  timeline: 1,
  focusTeeth: [],
  selectTooth: (tooth) => {
    const state = get();
    set({
      activeTooth: tooth,
      focusTeeth: [tooth],
      lastMention: {
        id: (state.lastMention?.id ?? 0) + 1,
        tooth,
        teeth: [tooth],
        sites: [],
        kind: "navigation",
      },
    });
  },
  clearToothFocus: () =>
    set({
      activeTooth: undefined,
      focusTeeth: [],
      lastMention: undefined,
    }),
  applyChartEvent: (event) => {
    if (event.kind === "set_name" && event.note) {
      const state = get();
      set({
        current: { ...state.current, patientName: event.note },
        helloName: event.note,
        heard: [{ text: event.raw, confidence: event.confidence }, ...state.heard].slice(0, 6),
      });
      return;
    }
    const state = get();
    const willWritePd =
      event.kind === "reading" && event.confidence === "high" && Boolean(event.tooth) && Boolean(event.readings?.length);
    let skipReason: string | undefined;
    if (!event.tooth) {
      skipReason = "no-tooth";
    } else if (event.confidence === "low") {
      skipReason = "low-confidence";
    } else if (event.kind !== "reading") {
      skipReason = event.kind;
    } else if (!event.readings?.length) {
      skipReason = "no-readings";
    }
    console.log("[clinician] apply", {
      kind: event.kind,
      tooth: event.tooth,
      sites: event.sites,
      readings: event.readings,
      confidence: event.confidence,
      willWritePd,
      skipReason,
    });
    const current = applyEvent(state.current, event);
    const caption = captionForEvent(event, state.lastVisit);
    const nextHeard = [{ text: event.raw, confidence: event.confidence }, ...state.heard].slice(0, 6);

    const calls = mockOpenDentalWritebacks(event, current);
    const writebacks = [
      ...calls.map((call) => ({ at: call.at, payload: call })),
      ...state.writebacks,
    ].slice(0, 30);

    const focusTeeth =
      event.teeth && event.teeth.length > 0
        ? event.teeth
        : event.tooth
          ? [event.tooth]
          : state.focusTeeth;
    const lastMention =
      event.tooth && event.confidence === "high"
        ? {
            id: (state.lastMention?.id ?? 0) + 1,
            tooth: event.tooth,
            teeth: event.kind === "reset_tooth" ? [event.tooth] : focusTeeth,
            sites: event.kind === "reset_tooth" ? [] : event.sites ?? event.bopSites ?? [],
            readings: event.kind === "reset_tooth" ? undefined : event.readings,
            bopSites: event.kind === "reset_tooth" ? undefined : event.bopSites,
            rec: event.kind === "reset_tooth" ? undefined : event.rec,
            note: event.kind === "reset_tooth" ? "cleared" : event.note,
            kind: event.kind,
          }
        : state.lastMention;

    set({
      current,
      activeTooth: event.tooth ?? state.activeTooth,
      focusTeeth,
      lastMention,
      caption: caption ?? state.caption,
      heard: nextHeard,
      writebacks,
      summary: event.kind === "summary_request" ? summarySentences(current, state.lastVisit) : state.summary,
    });
  },
  setCaption: (text) => set({ caption: text }),
  setSummary: (sentences) => set({ summary: sentences }),
  setHeard: (item) => set((state) => ({ heard: [item, ...state.heard].slice(0, 6) })),
  addWriteback: (payload) =>
    set((state) => ({
      writebacks: [{ at: new Date().toISOString(), payload }, ...state.writebacks].slice(0, 20),
    })),
  resetExam: (exam) => {
    resetOpenDentalSession();
    set({
      current: exam ?? createTodayExam(patient),
      caption: undefined,
      summary: undefined,
      heard: [],
      writebacks: [],
      timeline: 1,
      activeTooth: undefined,
      focusTeeth: [],
      lastMention: undefined,
      helloName: get().helloName ?? DEMO_PATIENT_NAME,
    });
  },
  setTimeline: (value) => set({ timeline: value }),
}));
