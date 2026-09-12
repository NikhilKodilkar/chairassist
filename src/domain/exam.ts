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

export function toothHasBleeding(tooth: ToothState | undefined): boolean {
  if (!tooth) {
    return false;
  }
  return SITES.some((site) => tooth.sites[site].bop === true);
}

export type ToothRestoration = "crown" | "filling";

function noteMentions(notes: string[], phrase: string): boolean {
  const needle = phrase.toLowerCase();
  return notes.some((note) => note.toLowerCase().includes(needle));
}

export function toothRestoration(tooth: ToothState | undefined): ToothRestoration | undefined {
  if (!tooth || tooth.notes.length === 0) {
    return undefined;
  }
  if (noteMentions(tooth.notes, "crown")) {
    return "crown";
  }
  if (
    noteMentions(tooth.notes, "composite") ||
    noteMentions(tooth.notes, "filling") ||
    noteMentions(tooth.notes, "filled")
  ) {
    return "filling";
  }
  return undefined;
}

export function displayRestoration(current: Exam, lastVisit: Exam, tooth: number): ToothRestoration | undefined {
  return toothRestoration(current.teeth[tooth]) ?? toothRestoration(lastVisit.teeth[tooth]);
}

export function toothStatusColor(tooth: ToothState | undefined): "grey" | "green" | "amber" | "red" {
  if (!tooth) {
    return "grey";
  }
  if (toothHasBleeding(tooth)) {
    return "red";
  }
  return statusColor(worstPd(tooth));
}

export function toothHasTodayReading(tooth: ToothState | undefined): boolean {
  if (!tooth) {
    return false;
  }
  return toothHasBleeding(tooth) || worstPd(tooth) !== undefined;
}

export function chartedToothCount(exam: Exam): number {
  let count = 0;
  for (let tooth = 1; tooth <= 32; tooth += 1) {
    if (toothHasTodayReading(exam.teeth[tooth])) {
      count += 1;
    }
  }
  return count;
}

export function displayToothColor(
  current: Exam,
  lastVisit: Exam,
  tooth: number,
): { color: "grey" | "green" | "amber" | "red"; fromHistory: boolean } {
  const today = current.teeth[tooth];
  if (toothHasTodayReading(today)) {
    return { color: toothStatusColor(today), fromHistory: false };
  }
  return { color: toothStatusColor(lastVisit.teeth[tooth]), fromHistory: true };
}

function mergeNotes(existing: string[] | undefined, incoming: string[] | undefined): string[] {
  const next = [...(existing ?? [])];
  if (!incoming) {
    return next;
  }
  for (const note of incoming) {
    if (!next.includes(note)) {
      next.push(note);
    }
  }
  return next;
}

export function applyEvent(exam: Exam, event: ChartEvent): Exam {
  const next = cloneExam(exam);
  if (event.examNotes && event.examNotes.length > 0) {
    next.notes = mergeNotes(next.notes, event.examNotes);
  }

  if (event.confidence === "low") {
    return next;
  }

  const targets = event.teeth ?? (event.tooth ? [event.tooth] : []);
  if (event.kind === "reset_tooth" && event.tooth) {
    next.teeth[event.tooth] = emptyTooth(event.tooth);
    return next;
  }

  if (targets.length === 0) {
    return next;
  }

  for (const id of targets) {
    const tooth = next.teeth[id] ?? emptyTooth(id);
    const incomingNotes = [...(event.notes ?? [])];
    if (event.note) {
      incomingNotes.push(event.note);
    }
    tooth.notes = mergeNotes(tooth.notes, incomingNotes);

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
        if (event.bopSites && event.bopSites.includes(site)) {
          reading.bop = true;
        }
        tooth.sites[site] = reading;
      });
      if (event.rec !== undefined) {
        const recAt = event.recSites ?? sites;
        recAt.forEach((site) => {
          tooth.sites[site] = { ...tooth.sites[site], rec: event.rec };
        });
      }
    }

    next.teeth[id] = tooth;
  }

  return next;
}

export function detailedReportLines(exam: Exam): string[] {
  const toothLines: string[] = [];
  const used = new Set<string>();
  for (let id = 1; id <= 32; id += 1) {
    const tooth = exam.teeth[id];
    if (!tooth) {
      continue;
    }
    for (const note of tooth.notes) {
      toothLines.push(`#${id} · ${note}`);
      used.add(note);
    }
    if (tooth.mobility !== undefined) {
      toothLines.push(`#${id} · mobility ${tooth.mobility}`);
    }
    if (tooth.furcation !== undefined) {
      toothLines.push(`#${id} · furcation ${tooth.furcation}`);
    }
  }
  const lines: string[] = [];
  for (const note of exam.notes ?? []) {
    if (!used.has(note)) {
      lines.push(note);
    }
  }
  return [...lines, ...toothLines];
}

export function pdDelta(current: SiteReading, previous: SiteReading): number | undefined {
  if (current.pd === undefined || previous.pd === undefined) {
    return undefined;
  }
  return current.pd - previous.pd;
}
