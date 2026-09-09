import { create } from "zustand";
import { applyEvent } from "../domain/exam";
import { createPatientFile, createTodayExam } from "../domain/seed";
import { captionForEvent, summarySentences } from "../domain/translator";
import type { ChartEvent, Exam } from "../domain/types";

const patient = createPatientFile();

export interface HeardItem {
  text: string;
  confidence: "high" | "low";
}

export interface WritebackItem {
  at: string;
  payload: unknown;
}

interface ExamStore {
  lastVisit: Exam;
  current: Exam;
  activeTooth?: number;
  caption?: string;
  summary?: string[];
  heard: HeardItem[];
  writebacks: WritebackItem[];
  timeline: number;
  applyChartEvent: (event: ChartEvent) => void;
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
  writebacks: [],
  timeline: 1,
  applyChartEvent: (event) => {
    const state = get();
    const current = applyEvent(state.current, event);
    const caption = captionForEvent(event, state.lastVisit);
    const nextHeard = [{ text: event.raw, confidence: event.confidence }, ...state.heard].slice(0, 6);

    const writebacks = [...state.writebacks];
    if (event.kind === "reading" && event.confidence === "high" && event.tooth) {
      writebacks.unshift({
        at: new Date().toISOString(),
        payload: {
          endpoint: "POST /mock/opendental/perio",
          patientId: current.patientId,
          tooth: event.tooth,
          sites: event.sites,
          readings: event.readings,
          bopSites: event.bopSites,
        },
      });
    }

    set({
      current,
      activeTooth: event.tooth ?? state.activeTooth,
      caption: caption ?? state.caption,
      heard: nextHeard,
      writebacks: writebacks.slice(0, 20),
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
  resetExam: (exam) =>
    set({
      current: exam ?? createTodayExam(patient),
      caption: undefined,
      summary: undefined,
      heard: [],
      writebacks: [],
      timeline: 1,
    }),
  setTimeline: (value) => set({ timeline: value }),
}));
