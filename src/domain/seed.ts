import andrewJson from "../data/andrew.json" with { type: "json" };
import { emptyExam, emptySites } from "./exam";
import type { Exam, PatientFile, SiteReading, ToothState } from "./types";

export interface AndrewDiskTooth {
  pd: [number, number, number, number, number, number];
  notes?: string[];
  mobility?: 0 | 1 | 2 | 3;
  furcation?: 0 | 1 | 2 | 3;
}

export interface AndrewDiskFile {
  patientId: string;
  patientName: string;
  todayDate: string;
  lastVisit: {
    date: string;
    notes: string[];
    teeth: Record<string, AndrewDiskTooth>;
  };
}

function asAndrewFile(value: unknown): AndrewDiskFile {
  const file = value as AndrewDiskFile;
  if (!file || typeof file.patientId !== "string" || !file.lastVisit) {
    throw new Error("Andrew patient JSON is missing or invalid");
  }
  return file;
}

const ANDREW = asAndrewFile(andrewJson);

export const DEMO_PATIENT_ID = ANDREW.patientId;
export const DEMO_PATIENT_NAME = ANDREW.patientName;
export const MARCH_VISIT_DATE = ANDREW.lastVisit.date;
export const TODAY_VISIT_DATE = ANDREW.todayDate;

function sitesFrom(pockets: AndrewDiskTooth["pd"]): Record<keyof ToothState["sites"], SiteReading> {
  const sites = emptySites();
  sites.MB = { pd: pockets[0] };
  sites.B = { pd: pockets[1] };
  sites.DB = { pd: pockets[2] };
  sites.ML = { pd: pockets[3] };
  sites.L = { pd: pockets[4] };
  sites.DL = { pd: pockets[5] };
  return sites;
}

function toothFromDisk(tooth: number, record: AndrewDiskTooth): ToothState {
  const next: ToothState = {
    tooth,
    sites: sitesFrom(record.pd),
    notes: record.notes ? [...record.notes] : [],
  };
  if (record.mobility !== undefined) {
    next.mobility = record.mobility;
  }
  if (record.furcation !== undefined) {
    next.furcation = record.furcation;
  }
  return next;
}

export const ANDREW_MARCH_POCKETS: Record<number, AndrewDiskTooth["pd"]> = {};
for (let tooth = 1; tooth <= 32; tooth += 1) {
  const record = ANDREW.lastVisit.teeth[String(tooth)];
  if (record) {
    ANDREW_MARCH_POCKETS[tooth] = record.pd;
  }
}

export function createMarchExam(): Exam {
  const exam = emptyExam(ANDREW.patientId, ANDREW.patientName, ANDREW.lastVisit.date);
  exam.notes = [...ANDREW.lastVisit.notes];
  for (let tooth = 1; tooth <= 32; tooth += 1) {
    const record = ANDREW.lastVisit.teeth[String(tooth)];
    if (record) {
      exam.teeth[tooth] = toothFromDisk(tooth, record);
    }
  }
  return exam;
}

export function createPatientFile(): PatientFile {
  return {
    patientId: ANDREW.patientId,
    patientName: ANDREW.patientName,
    lastVisit: createMarchExam(),
  };
}

export function createTodayExam(patient: PatientFile): Exam {
  return emptyExam(patient.patientId, patient.patientName, ANDREW.todayDate);
}
