export type Site = "MB" | "B" | "DB" | "ML" | "L" | "DL";

export type Side = "buccal" | "lingual";

export interface SiteReading {
  pd?: number;
  bop?: boolean;
  rec?: number;
}

export interface ToothState {
  tooth: number;
  sites: Record<Site, SiteReading>;
  mobility?: 0 | 1 | 2 | 3;
  furcation?: 0 | 1 | 2 | 3;
  notes: string[];
  missing?: boolean;
}

export interface Exam {
  patientId: string;
  patientName: string;
  date: string;
  teeth: Record<number, ToothState>;
}

export interface ChartEvent {
  kind: "reading" | "flag" | "navigation" | "summary_request";
  tooth?: number;
  side?: Side;
  sites?: Site[];
  readings?: number[];
  bopSites?: Site[];
  rec?: number;
  mobility?: 0 | 1 | 2 | 3;
  furcation?: 0 | 1 | 2 | 3;
  note?: string;
  raw: string;
  confidence: "high" | "low";
}

export interface PatientFile {
  patientId: string;
  patientName: string;
  lastVisit: Exam;
}

export const SITES: Site[] = ["MB", "B", "DB", "ML", "L", "DL"];
export const BUCCAL_SITES: Site[] = ["MB", "B", "DB"];
export const LINGUAL_SITES: Site[] = ["ML", "L", "DL"];
export const HERO_TOOTH = 14;
