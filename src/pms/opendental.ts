import type { ChartEvent, Exam, Site, ToothState } from "../domain/types";
import { SITES } from "../domain/types";

export type OpenDentalMethod = "GET" | "POST" | "PUT" | "DELETE";
export type OpenDentalSequence =
  | "Probing"
  | "BleedSupPlaqCalc"
  | "Mobility"
  | "Furcation"
  | "GingMargin"
  | "SkipTooth";

export interface OpenDentalCall {
  id: string;
  at: string;
  label: string;
  method: OpenDentalMethod;
  path: string;
  url: string;
  status: number;
  statusText: string;
  requestHeaders: Record<string, string>;
  requestBody: Record<string, unknown> | null;
  responseBody: Record<string, unknown> | null;
}

interface SurfaceValues {
  MBvalue: number;
  Bvalue: number;
  DBvalue: number;
  MLvalue: number;
  Lvalue: number;
  DLvalue: number;
}

interface MeasureRecord extends SurfaceValues {
  PerioMeasureNum: number;
  PerioExamNum: number;
  SequenceType: OpenDentalSequence;
  IntTooth: number;
  ToothValue: number;
  SecDateTEdit: string;
}

interface ExamRecord {
  PerioExamNum: number;
  PatNum: number;
  ExamDate: string;
  ProvNum: number;
  DateTMeasureEdit: string;
  Note: string;
}

interface Session {
  exam: ExamRecord | null;
  nextExamNum: number;
  nextMeasureNum: number;
  nextProcNum: number;
  nextCallId: number;
  measures: Map<string, MeasureRecord>;
  procedures: Set<string>;
}

const SITE_FIELD: Record<Site, keyof SurfaceValues> = {
  MB: "MBvalue",
  B: "Bvalue",
  DB: "DBvalue",
  ML: "MLvalue",
  L: "Lvalue",
  DL: "DLvalue",
};

const EMPTY_SURFACES: SurfaceValues = {
  MBvalue: -1,
  Bvalue: -1,
  DBvalue: -1,
  MLvalue: -1,
  Lvalue: -1,
  DLvalue: -1,
};

function envText(name: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[name];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return fallback;
}

function envNumber(name: keyof ImportMetaEnv, fallback: number): number {
  const parsed = Number(envText(name, ""));
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

export function openDentalApiBase(): string {
  const base = envText("VITE_OPENDENTAL_API_BASE", "https://api.opendental.com/api/v1");
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function developerKey(): string {
  return envText("VITE_OPENDENTAL_DEVELOPER_KEY", "DEMODEVKEY");
}

function customerKey(): string {
  return envText("VITE_OPENDENTAL_CUSTOMER_KEY", "DEMOCUSTKEY");
}

function providerNum(): number {
  return envNumber("VITE_OPENDENTAL_PROV_NUM", 3);
}

export function patNumFor(patientId: string): number {
  const mapped = envNumber("VITE_OPENDENTAL_PAT_NUM", 0);
  if (mapped > 0) {
    return mapped;
  }
  if (patientId === "andrew") {
    return 20;
  }
  return 20;
}

function joinUrl(path: string): string {
  return `${openDentalApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function examDateOf(exam: Exam): string {
  return exam.date.slice(0, 10);
}

function stamp(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function requestHeaders(): Record<string, string> {
  return {
    Authorization: `ODFHIR ${developerKey()}/${customerKey()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function measureKey(tooth: number, sequence: OpenDentalSequence): string {
  return `${tooth}:${sequence}`;
}

function createSession(): Session {
  return {
    exam: null,
    nextExamNum: 31,
    nextMeasureNum: 206,
    nextProcNum: 301,
    nextCallId: 1,
    measures: new Map(),
    procedures: new Set(),
  };
}

let session = createSession();

export function resetOpenDentalSession(): void {
  session = createSession();
}

function blankSurfaces(): SurfaceValues {
  return { ...EMPTY_SURFACES };
}

function probingSurfaces(tooth: ToothState): SurfaceValues {
  const values = blankSurfaces();
  for (const site of SITES) {
    const pd = tooth.sites[site].pd;
    if (pd !== undefined) {
      values[SITE_FIELD[site]] = pd;
    }
  }
  return values;
}

function hasAnySurface(values: SurfaceValues): boolean {
  return (
    values.MBvalue !== -1 ||
    values.Bvalue !== -1 ||
    values.DBvalue !== -1 ||
    values.MLvalue !== -1 ||
    values.Lvalue !== -1 ||
    values.DLvalue !== -1
  );
}

function bleedSurfaces(tooth: ToothState, event: ChartEvent): SurfaceValues {
  const values = blankSurfaces();
  const flagged = event.bopSites ?? [];
  for (const site of SITES) {
    if (flagged.includes(site) || tooth.sites[site].bop) {
      values[SITE_FIELD[site]] = 1;
    } else if (tooth.sites[site].pd !== undefined) {
      values[SITE_FIELD[site]] = 0;
    }
  }
  return values;
}

function gingSurfaces(tooth: ToothState, event: ChartEvent): SurfaceValues {
  const values = blankSurfaces();
  const recSites = event.recSites ?? event.sites ?? [];
  for (const site of SITES) {
    const rec = tooth.sites[site].rec;
    if (rec !== undefined) {
      values[SITE_FIELD[site]] = rec;
    } else if (event.rec !== undefined && recSites.includes(site)) {
      values[SITE_FIELD[site]] = event.rec;
    }
  }
  return values;
}

function furcationSurfaces(event: ChartEvent): SurfaceValues {
  const values = blankSurfaces();
  const grade = event.furcation ?? 0;
  const sites = event.sites && event.sites.length > 0 ? event.sites : (["B"] as Site[]);
  for (const site of sites) {
    values[SITE_FIELD[site]] = grade;
  }
  return values;
}

function folded(text: string): string {
  return text.toLowerCase();
}

function procedureFromNotes(notes: string[]): { procCode: string; descript: string } | undefined {
  const blob = notes.map(folded).join(" ");
  if (blob.includes("crown")) {
    return { procCode: "D2740", descript: "crown - porcelain/ceramic substrate" };
  }
  if (blob.includes("composite") || blob.includes("filling") || blob.includes("filled")) {
    return { procCode: "D2391", descript: "resin-based composite - one surface, posterior" };
  }
  return undefined;
}

function makeCall(
  label: string,
  method: OpenDentalMethod,
  path: string,
  status: number,
  requestBody: Record<string, unknown> | null,
  responseBody: Record<string, unknown> | null,
  at: Date,
): OpenDentalCall {
  const id = `od-${session.nextCallId}`;
  session.nextCallId += 1;
  return {
    id,
    at: at.toISOString(),
    label,
    method,
    path,
    url: joinUrl(path),
    status,
    statusText: status === 201 ? "Created" : "OK",
    requestHeaders: requestHeaders(),
    requestBody,
    responseBody,
  };
}

function ensureExam(exam: Exam, at: Date, calls: OpenDentalCall[]): ExamRecord {
  if (session.exam) {
    return session.exam;
  }
  const record: ExamRecord = {
    PerioExamNum: session.nextExamNum,
    PatNum: patNumFor(exam.patientId),
    ExamDate: examDateOf(exam),
    ProvNum: providerNum(),
    DateTMeasureEdit: stamp(at),
    Note: (exam.notes ?? []).join(" "),
  };
  session.nextExamNum += 1;
  session.exam = record;
  const body = {
    PatNum: record.PatNum,
    ExamDate: record.ExamDate,
    ProvNum: record.ProvNum,
    Note: record.Note,
  };
  calls.push(makeCall("Create periodontal exam", "POST", "/perioexams", 201, body, { ...record }, at));
  return record;
}

function upsertMeasure(
  label: string,
  sequence: OpenDentalSequence,
  tooth: number,
  surfaces: SurfaceValues,
  toothValue: number,
  examRecord: ExamRecord,
  at: Date,
  calls: OpenDentalCall[],
): void {
  const key = measureKey(tooth, sequence);
  const existing = session.measures.get(key);
  if (existing) {
    const next: MeasureRecord = {
      ...existing,
      ...surfaces,
      ToothValue: toothValue,
      SecDateTEdit: stamp(at),
    };
    session.measures.set(key, next);
    const body =
      sequence === "Mobility" || sequence === "SkipTooth"
        ? { ToothValue: toothValue }
        : { ...surfaces };
    calls.push(
      makeCall(
        label,
        "PUT",
        `/periomeasures/${existing.PerioMeasureNum}`,
        200,
        body,
        { ...next },
        at,
      ),
    );
    return;
  }

  const record: MeasureRecord = {
    PerioMeasureNum: session.nextMeasureNum,
    PerioExamNum: examRecord.PerioExamNum,
    SequenceType: sequence,
    IntTooth: tooth,
    ToothValue: toothValue,
    ...surfaces,
    SecDateTEdit: stamp(at),
  };
  session.nextMeasureNum += 1;
  session.measures.set(key, record);

  const body: Record<string, unknown> = {
    PerioExamNum: examRecord.PerioExamNum,
    SequenceType: sequence,
    IntTooth: tooth,
  };
  if (sequence === "Mobility" || sequence === "SkipTooth") {
    body.ToothValue = toothValue;
  } else {
    body.MBvalue = surfaces.MBvalue;
    body.Bvalue = surfaces.Bvalue;
    body.DBvalue = surfaces.DBvalue;
    body.MLvalue = surfaces.MLvalue;
    body.Lvalue = surfaces.Lvalue;
    body.DLvalue = surfaces.DLvalue;
  }
  calls.push(makeCall(label, "POST", "/periomeasures", 201, body, { ...record }, at));
}

function updateExamNote(exam: Exam, examRecord: ExamRecord, at: Date, calls: OpenDentalCall[]): void {
  const note = (exam.notes ?? []).join(" ");
  if (note === examRecord.Note) {
    return;
  }
  examRecord.Note = note;
  examRecord.DateTMeasureEdit = stamp(at);
  calls.push(
    makeCall(
      "Update exam note",
      "PUT",
      `/perioexams/${examRecord.PerioExamNum}`,
      200,
      { Note: note },
      { ...examRecord },
      at,
    ),
  );
}

function chartProcedure(exam: Exam, tooth: number, notes: string[], at: Date, calls: OpenDentalCall[]): void {
  const found = procedureFromNotes(notes);
  if (!found) {
    return;
  }
  const key = `${tooth}:${found.procCode}`;
  if (session.procedures.has(key)) {
    return;
  }
  session.procedures.add(key);
  const procNum = session.nextProcNum;
  session.nextProcNum += 1;
  const body = {
    PatNum: patNumFor(exam.patientId),
    ProcDate: examDateOf(exam),
    ProcStatus: "EC",
    procCode: found.procCode,
    ToothNum: String(tooth),
    ProvNum: providerNum(),
  };
  calls.push(
    makeCall(`Chart existing ${found.procCode} · tooth ${tooth}`, "POST", "/procedurelogs", 201, body, {
      ProcNum: procNum,
      ...body,
      Surf: "",
      ToothRange: "",
      descript: found.descript,
      PlaceService: "Office",
    }, at),
  );
}

export function mockOpenDentalWritebacks(event: ChartEvent, exam: Exam): OpenDentalCall[] {
  if (event.confidence === "low") {
    return [];
  }

  const at = new Date();
  const calls: OpenDentalCall[] = [];

  if (event.kind === "reset_tooth" && event.tooth) {
    const examRecord = ensureExam(exam, at, calls);
    upsertMeasure(
      `Skip tooth ${event.tooth}`,
      "SkipTooth",
      event.tooth,
      blankSurfaces(),
      1,
      examRecord,
      at,
      calls,
    );
    return calls;
  }

  const examNotes = event.examNotes && event.examNotes.length > 0;
  if (event.kind === "flag" && examNotes) {
    const examRecord = ensureExam(exam, at, calls);
    updateExamNote(exam, examRecord, at, calls);
    return calls;
  }

  if (event.kind !== "reading" || !event.tooth) {
    return calls;
  }

  const tooth = exam.teeth[event.tooth];
  if (!tooth) {
    return calls;
  }

  const examRecord = ensureExam(exam, at, calls);
  const pd = probingSurfaces(tooth);
  if (hasAnySurface(pd)) {
    const verb = session.measures.has(measureKey(event.tooth, "Probing")) ? "Update" : "Write";
    upsertMeasure(`${verb} probing · tooth ${event.tooth}`, "Probing", event.tooth, pd, -1, examRecord, at, calls);
  }

  const bleed = bleedSurfaces(tooth, event);
  if (hasAnySurface(bleed) && (event.bopSites?.length || SITES.some((site) => tooth.sites[site].bop))) {
    const verb = session.measures.has(measureKey(event.tooth, "BleedSupPlaqCalc")) ? "Update" : "Write";
    upsertMeasure(
      `${verb} bleeding flags · tooth ${event.tooth}`,
      "BleedSupPlaqCalc",
      event.tooth,
      bleed,
      -1,
      examRecord,
      at,
      calls,
    );
  }

  if (event.rec !== undefined || SITES.some((site) => tooth.sites[site].rec !== undefined)) {
    const ging = gingSurfaces(tooth, event);
    if (hasAnySurface(ging)) {
      const verb = session.measures.has(measureKey(event.tooth, "GingMargin")) ? "Update" : "Write";
      upsertMeasure(
        `${verb} gingival margin · tooth ${event.tooth}`,
        "GingMargin",
        event.tooth,
        ging,
        -1,
        examRecord,
        at,
        calls,
      );
    }
  }

  if (event.mobility !== undefined) {
    const verb = session.measures.has(measureKey(event.tooth, "Mobility")) ? "Update" : "Write";
    upsertMeasure(
      `${verb} mobility · tooth ${event.tooth}`,
      "Mobility",
      event.tooth,
      blankSurfaces(),
      event.mobility,
      examRecord,
      at,
      calls,
    );
  }

  if (event.furcation !== undefined) {
    const verb = session.measures.has(measureKey(event.tooth, "Furcation")) ? "Update" : "Write";
    upsertMeasure(
      `${verb} furcation · tooth ${event.tooth}`,
      "Furcation",
      event.tooth,
      furcationSurfaces(event),
      -1,
      examRecord,
      at,
      calls,
    );
  }

  if (examNotes) {
    updateExamNote(exam, examRecord, at, calls);
  }

  const incomingNotes = [...(event.notes ?? [])];
  if (event.note) {
    incomingNotes.push(event.note);
  }
  if (incomingNotes.length > 0) {
    chartProcedure(exam, event.tooth, incomingNotes, at, calls);
  }

  return calls;
}

export function isOpenDentalCall(value: unknown): value is OpenDentalCall {
  if (!value || typeof value !== "object") {
    return false;
  }
  const call = value as OpenDentalCall;
  return typeof call.method === "string" && typeof call.path === "string" && typeof call.url === "string";
}
