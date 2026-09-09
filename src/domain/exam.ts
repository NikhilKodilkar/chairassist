import { SITES } from "./types";
import type { ChartEvent, Exam, Site, SiteReading, ToothState } from "./types";

export function emptySites(): Record<Site, SiteReading> {
  return {
    MB: {},
    B: {},
    DB: {},
    ML: {},
    L: {},
    DL: {},
  };
}

export function emptyTooth(tooth: number): ToothState {
  return {
    tooth,
    sites: emptySites(),
    notes: [],
  };
}

export function emptyExam(patientId: string, patientName: string, date: string): Exam {
  const teeth: Record<number, ToothState> = {};
  for (let tooth = 1; tooth <= 32; tooth += 1) {
    teeth[tooth] = emptyTooth(tooth);
  }
  return { patientId, patientName, date, teeth };
}

export function cloneExam(exam: Exam): Exam {
  return structuredClone(exam);
}

export function worstPd(tooth: ToothState): number | undefined {
  let worst: number | undefined;
  for (const site of SITES) {
    const pd = tooth.sites[site].pd;
    if (pd === undefined) {
      continue;
    }
    if (worst === undefined || pd > worst) {
      worst = pd;
    }
  }
  return worst;
}

export function statusColor(pd: number | undefined): "grey" | "green" | "amber" | "red" {
  if (pd === undefined) {
    return "grey";
  }
  if (pd >= 5) {
    return "red";
  }
  if (pd === 4) {
    return "amber";
  }
  return "green";
}

export function applyEvent(exam: Exam, event: ChartEvent): Exam {
  const next = cloneExam(exam);
  if (!event.tooth || event.confidence === "low") {
    return next;
  }

  const tooth = next.teeth[event.tooth] ?? emptyTooth(event.tooth);

  if (event.kind === "flag" && event.note && !tooth.notes.includes(event.note)) {
    tooth.notes = [...tooth.notes, event.note];
  }

  if (event.kind === "reading") {
    if (event.mobility !== undefined) {
      tooth.mobility = event.mobility;
    }
    if (event.furcation !== undefined) {
      tooth.furcation = event.furcation;
    }
    const sites = event.sites ?? [];
    sites.forEach((site, index) => {
      const reading = { ...tooth.sites[site] };
      if (event.readings && event.readings[index] !== undefined) {
        reading.pd = event.readings[index];
      } else if (event.readings && event.readings.length === 1) {
        reading.pd = event.readings[0];
      }
      if (event.rec !== undefined) {
        reading.rec = event.rec;
      }
      if (event.bopSites && event.bopSites.includes(site)) {
        reading.bop = true;
      }
      tooth.sites[site] = reading;
    });
  }

  next.teeth[event.tooth] = tooth;
  return next;
}

export function pdDelta(current: SiteReading, previous: SiteReading): number | undefined {
  if (current.pd === undefined || previous.pd === undefined) {
    return undefined;
  }
  return current.pd - previous.pd;
}
