import { indexOfPhrase, numberAt, phraseHas, tokenToNumber } from "./numbers";
import { BUCCAL_SITES, LINGUAL_SITES, SITES } from "./types";
import type { ChartEvent, Side, Site } from "./types";

const FILLER = [
  "is",
  "a",
  "an",
  "the",
  "of",
  "about",
  "got",
  "ive",
  "i",
  "have",
  "has",
  "with",
  "and",
  "on",
  "there",
  "theres",
  "does",
  "look",
  "looks",
  "ive",
];

const MEASURE_WORDS = ["millimeter", "millimeters", "mm", "pocket", "pockets"];

const STOP_TOOTH_LIST = [
  "look",
  "looks",
  "healthy",
  "has",
  "have",
  "probing",
  "plaque",
  "calculus",
  "bleeding",
  "existing",
  "got",
  "mb",
  "db",
  "buccal",
  "facial",
];

const LOWER_ANTERIOR = [22, 23, 24, 25, 26, 27];

export interface ClinicalFinding {
  teeth: number[];
  sites: Site[];
  readings: number[];
  bopSites: Site[];
  rec?: number;
  recSites?: Site[];
  mobility?: 0 | 1 | 2 | 3;
  furcation?: 0 | 1 | 2 | 3;
  notes: string[];
  examNotes: string[];
  throughout?: { min: number; max: number };
}

function skipFiller(tokens: string[], start: number): number {
  let index = start;
  while (index < tokens.length && (FILLER.includes(tokens[index]) || MEASURE_WORDS.includes(tokens[index]))) {
    index += 1;
  }
  return index;
}

function explicitSite(token: string | undefined, side: Side): Site | undefined {
  if (!token) {
    return undefined;
  }
  if (token === "mb" || token === "mesiobuccal") {
    return "MB";
  }
  if (token === "db" || token === "distobuccal") {
    return "DB";
  }
  if (token === "ml" || token === "mesiolingual") {
    return "ML";
  }
  if (token === "dl" || token === "distolingual") {
    return "DL";
  }
  if (token === "b") {
    return "B";
  }
  if (token === "buccal" || token === "buccally" || token === "facial" || token === "facially" || token === "labial") {
    return "B";
  }
  if (token === "l") {
    return "L";
  }
  if (token === "lingual" || token === "lingually" || token === "palatal") {
    return "L";
  }
  if (token === "mesial") {
    return side === "lingual" ? "ML" : "MB";
  }
  if (token === "distal") {
    return side === "lingual" ? "DL" : "DB";
  }
  return undefined;
}

function sideFromToken(token: string | undefined): Side | undefined {
  if (!token) {
    return undefined;
  }
  if (token === "lingual" || token === "lingually" || token === "palatal") {
    return "lingual";
  }
  if (token === "buccal" || token === "buccally" || token === "facial" || token === "facially" || token === "labial") {
    return "buccal";
  }
  return undefined;
}

function intensity(tokens: string[]): string {
  if (tokens.includes("heavy")) {
    return "heavy";
  }
  if (tokens.includes("moderate")) {
    return "moderate";
  }
  if (tokens.includes("minimal") || tokens.includes("light")) {
    return "minimal";
  }
  return "";
}

function collectNotes(tokens: string[]): { notes: string[]; examNotes: string[] } {
  const notes: string[] = [];
  const examNotes: string[] = [];
  const grade = intensity(tokens);

  if (phraseHas(tokens, ["subgingival", "calculus"]) || (tokens.includes("calculus") && tokens.includes("subgingival"))) {
    const where = tokens.includes("lingual") || tokens.includes("lingually") ? " lingual" : "";
    const text = `${grade} subgingival calculus${where}`.trim();
    if (tokens.includes("generalized") || tokens.includes("localized")) {
      examNotes.push(text);
    } else {
      notes.push(text);
    }
  } else if (tokens.includes("calculus")) {
    const text = `${grade} calculus`.trim();
    examNotes.push(text);
  }

  if (tokens.includes("plaque")) {
    const text = `${tokens.includes("generalized") ? "generalized " : ""}${grade} plaque`.trim();
    examNotes.push(text);
  }

  if (tokens.includes("mod") && (tokens.includes("composite") || tokens.includes("filling"))) {
    notes.push("MOD composite");
  }
  if (tokens.includes("crown")) {
    notes.push("existing crown");
  }
  if (phraseHas(tokens, ["recurrent", "decay"]) || phraseHas(tokens, ["recurrent", "caries"])) {
    notes.push("recurrent decay on the distal margin");
  }
  if (phraseHas(tokens, ["open", "distal", "margin"]) || phraseHas(tokens, ["open", "margin"])) {
    notes.push("open distal margin");
  }
  if (phraseHas(tokens, ["food", "impaction"]) || phraseHas(tokens, ["food", "trap"])) {
    notes.push("food impaction");
  }
  if (phraseHas(tokens, ["generalized", "bleeding"])) {
    examNotes.push("generalized bleeding on probing");
  }
  if (phraseHas(tokens, ["no", "bleeding"])) {
    examNotes.push("no bleeding");
    notes.push("no bleeding");
  }

  return { notes, examNotes };
}

function mobilityFrom(tokens: string[]): 0 | 1 | 2 | 3 | undefined {
  const at = tokens.indexOf("mobility");
  if (at < 0) {
    return undefined;
  }
  const after = tokenToNumber(tokens[at + 1] ?? "");
  if (after !== undefined && after >= 0 && after <= 3) {
    return after as 0 | 1 | 2 | 3;
  }
  const classAt = indexOfPhrase(tokens, ["class"]);
  if (classAt >= 0 && tokens[classAt + 2] === "mobility") {
    const grade = tokenToNumber(tokens[classAt + 1] ?? "");
    if (grade !== undefined && grade >= 0 && grade <= 3) {
      return grade as 0 | 1 | 2 | 3;
    }
  }
  const nearby = [tokens[at - 1], tokens[at - 2]];
  if (nearby.includes("severe") || nearby.includes("heavy")) {
    return 3;
  }
  if (nearby.includes("moderate")) {
    return 2;
  }
  if (nearby.includes("slight") || nearby.includes("mild") || nearby.includes("light")) {
    return 1;
  }
  return undefined;
}

function furcationFrom(tokens: string[]): 0 | 1 | 2 | 3 | undefined {
  if (!tokens.includes("furcation")) {
    return undefined;
  }
  const classAt = indexOfPhrase(tokens, ["class"]);
  if (classAt >= 0) {
    const grade = tokenToNumber(tokens[classAt + 1] ?? "");
    if (grade !== undefined && grade >= 0 && grade <= 3) {
      return grade as 0 | 1 | 2 | 3;
    }
  }
  return undefined;
}

function probingRange(tokens: string[]): { min: number; max: number } | undefined {
  for (let i = 0; i < tokens.length - 2; i += 1) {
    const left = tokenToNumber(tokens[i]);
    if (left === undefined || left < 1 || left > 12) {
      continue;
    }
    if (tokens[i + 1] !== "to") {
      continue;
    }
    const right = tokenToNumber(tokens[i + 2]);
    if (right === undefined || right < 1 || right > 12) {
      continue;
    }
    let look = i + 3;
    while (look < tokens.length && MEASURE_WORDS.includes(tokens[look])) {
      look += 1;
    }
    if (tokens[look] === "probing" || tokens[look] === "throughout" || tokens.includes("throughout") || tokens.includes("pockets")) {
      return { min: left, max: right };
    }
  }
  return undefined;
}

function throughRange(tokens: string[]): number[] {
  const teeth: number[] = [];
  for (let i = 0; i < tokens.length - 2; i += 1) {
    const from = numberAt(tokens, i);
    if (!from || from.value < 1 || from.value > 32) {
      continue;
    }
    const next = i + from.width;
    if (tokens[next] !== "through") {
      continue;
    }
    const to = numberAt(tokens, next + 1);
    if (!to || to.value < 1 || to.value > 32) {
      continue;
    }
    const start = Math.min(from.value, to.value);
    const end = Math.max(from.value, to.value);
    for (let tooth = start; tooth <= end; tooth += 1) {
      teeth.push(tooth);
    }
  }
  return teeth;
}

function lastNumberCue(tokens: string[]): number | undefined {
  let last: number | undefined;
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] !== "number") {
      continue;
    }
    const parsed = numberAt(tokens, i + 1);
    if (parsed && parsed.value >= 1 && parsed.value <= 32) {
      last = parsed.value;
    }
  }
  return last;
}

function listedTeeth(tokens: string[]): number[] {
  const teeth: number[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] !== "numbers" && !(tokens[i] === "around" && tokens[i + 1] === "numbers")) {
      continue;
    }
    let cursor = tokens[i] === "around" ? i + 2 : i + 1;
    while (cursor < tokens.length) {
      if (STOP_TOOTH_LIST.includes(tokens[cursor])) {
        break;
      }
      if (tokens[cursor] === "and") {
        cursor += 1;
        continue;
      }
      const parsed = numberAt(tokens, cursor);
      if (parsed && parsed.value >= 1 && parsed.value <= 32) {
        teeth.push(parsed.value);
        cursor += parsed.width;
        continue;
      }
      cursor += 1;
    }
  }
  return teeth;
}

function recessionFrom(tokens: string[], side: Side): { rec: number; sites: Site[] } | undefined {
  const at = tokens.indexOf("recession");
  if (at < 0) {
    return undefined;
  }
  let rec = tokenToNumber(tokens[at + 1] ?? "");
  if (rec === undefined) {
    for (let i = at - 1; i >= Math.max(0, at - 4); i -= 1) {
      if (MEASURE_WORDS.includes(tokens[i]) || FILLER.includes(tokens[i])) {
        continue;
      }
      rec = tokenToNumber(tokens[i]);
      if (rec !== undefined) {
        break;
      }
    }
  }
  if (rec === undefined || rec < 0 || rec > 12) {
    return undefined;
  }
  let recSide = side;
  for (let i = at; i < Math.min(tokens.length, at + 5); i += 1) {
    const nextSide = sideFromToken(tokens[i]);
    if (nextSide) {
      recSide = nextSide;
    }
  }
  for (let i = at - 1; i >= Math.max(0, at - 3); i -= 1) {
    const prevSide = sideFromToken(tokens[i]);
    if (prevSide) {
      recSide = prevSide;
    }
  }
  return { rec, sites: recSide === "lingual" ? [...LINGUAL_SITES] : [...BUCCAL_SITES] };
}

function reservedNumberIndexes(tokens: string[]): Set<number> {
  const skipped = new Set<number>();
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] === "through" && i > 0 && i + 1 < tokens.length) {
      skipped.add(i - 1);
      skipped.add(i + 1);
    }
    if (tokens[i] === "class" && tokens[i + 1]) {
      skipped.add(i + 1);
    }
    if ((tokens[i] === "number" || tokens[i] === "tooth" || tokens[i] === "on") && tokens[i + 1]) {
      const parsed = numberAt(tokens, i + 1);
      if (parsed && parsed.value >= 1 && parsed.value <= 32) {
        skipped.add(i + 1);
        if (parsed.width === 2) {
          skipped.add(i + 2);
        }
      }
    }
  }
  for (const tooth of listedTeeth(tokens)) {
    for (let i = 0; i < tokens.length; i += 1) {
      const parsed = numberAt(tokens, i);
      if (parsed && parsed.value === tooth) {
        skipped.add(i);
      }
    }
  }
  return skipped;
}

function nearWord(tokens: string[], index: number, word: string): boolean {
  for (let look = index; look <= index + 4 && look < tokens.length; look += 1) {
    if (tokens[look] === word) {
      return true;
    }
  }
  for (let look = index; look >= index - 4 && look >= 0; look -= 1) {
    if (tokens[look] === word) {
      return true;
    }
  }
  return false;
}

function isAbbrevSite(token: string | undefined): boolean {
  return (
    token === "mb" ||
    token === "db" ||
    token === "ml" ||
    token === "dl" ||
    token === "b" ||
    token === "l" ||
    token === "mesiobuccal" ||
    token === "distobuccal" ||
    token === "mesiolingual" ||
    token === "distolingual"
  );
}

function collectTripletAfter(tokens: string[], start: number, reserved: Set<number>): number[] | undefined {
  const values: number[] = [];
  let cursor = start;
  while (cursor < tokens.length && values.length < 3) {
    if (FILLER.includes(tokens[cursor]) || MEASURE_WORDS.includes(tokens[cursor])) {
      cursor += 1;
      continue;
    }
    if (reserved.has(cursor)) {
      cursor += 1;
      continue;
    }
    const value = tokenToNumber(tokens[cursor]);
    if (value === undefined || value < 1 || value > 12) {
      break;
    }
    values.push(value);
    cursor += 1;
  }
  return values.length === 3 ? values : undefined;
}

function extractSideTriplets(tokens: string[], reserved: Set<number>): Array<{ site: Site; pd: number; bop: boolean }> {
  const found: Array<{ site: Site; pd: number; bop: boolean }> = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (nearWord(tokens, i, "recession")) {
      continue;
    }
    const lead = sideFromToken(tokens[i]);
    if (!lead) {
      continue;
    }
    const values = collectTripletAfter(tokens, i + 1, reserved);
    if (!values) {
      continue;
    }
    const sites = lead === "lingual" ? LINGUAL_SITES : BUCCAL_SITES;
    sites.forEach((site, index) => {
      found.push({ site, pd: values[index], bop: false });
    });
  }
  return found;
}

function looksLikeTripletAfter(tokens: string[], numberIndex: number): boolean {
  let count = 0;
  let cursor = numberIndex;
  while (cursor < tokens.length && count < 3) {
    if (MEASURE_WORDS.includes(tokens[cursor]) || FILLER.includes(tokens[cursor])) {
      cursor += 1;
      continue;
    }
    const value = tokenToNumber(tokens[cursor]);
    if (value === undefined || value < 1 || value > 12) {
      break;
    }
    count += 1;
    cursor += 1;
  }
  return count >= 3;
}

function extractSiteReadings(tokens: string[], side: Side): Array<{ site: Site; pd: number; bop: boolean }> {
  const reserved = reservedNumberIndexes(tokens);
  const found: Array<{ site: Site; pd: number; bop: boolean }> = [];

  const push = (site: Site, pd: number, from: number) => {
    let bop = false;
    for (let look = from; look < Math.min(tokens.length, from + 5); look += 1) {
      if (explicitSite(tokens[look], side)) {
        break;
      }
      if (tokens[look] === "bleeding" && tokens[look - 1] !== "no") {
        bop = true;
        break;
      }
    }
    found.push({ site, pd, bop });
  };

  let i = 0;
  while (i < tokens.length) {
    if (tokens[i] === "recession" || tokens[i] === "margin" || tokens[i] === "mobility" || tokens[i] === "furcation") {
      i += 1;
      continue;
    }
    if (nearWord(tokens, i, "recession")) {
      i += 1;
      continue;
    }
    const siteHere = explicitSite(tokens[i], side);
    if (siteHere && tokens[i + 1] !== "margin") {
      const after = skipFiller(tokens, i + 1);
      const pd = tokenToNumber(tokens[after] ?? "");
      if (pd !== undefined && pd >= 1 && pd <= 12 && !reserved.has(after) && !looksLikeTripletAfter(tokens, after)) {
        push(siteHere, pd, after + 1);
        i = after + 1;
        continue;
      }
    }

    if (!reserved.has(i)) {
      const pd = tokenToNumber(tokens[i]);
      if (pd !== undefined && pd >= 1 && pd <= 12) {
        let j = skipFiller(tokens, i + 1);
        const siteAfter = explicitSite(tokens[j], side);
        if (siteAfter && tokens[j + 1] !== "margin" && (isAbbrevSite(tokens[j]) || !looksLikeTripletAfter(tokens, i))) {
          push(siteAfter, pd, j + 1);
          if (tokens[j + 1] === "and") {
            const extra = explicitSite(tokens[j + 2], side);
            if (extra) {
              push(extra, pd, j + 3);
            }
          }
          i = j + 1;
          continue;
        }
      }
    }
    i += 1;
  }

  if (phraseHas(tokens, ["no", "bleeding"])) {
    for (const item of found) {
      item.bop = false;
    }
  } else if (phraseHas(tokens, ["bleeding", "on", "probing"])) {
    for (const item of found) {
      item.bop = true;
    }
  }

  return found;
}

export function parseClinical(tokens: string[], currentTooth: number | undefined, side: Side, raw: string): ChartEvent[] | undefined {
  const rangeTeeth = throughRange(tokens);
  const listed = listedTeeth(tokens);
  const reserved = reservedNumberIndexes(tokens);
  const sideTriplets = extractSideTriplets(tokens, reserved);
  const siteReads = sideTriplets.length > 0 ? sideTriplets : extractSiteReadings(tokens, side);
  const rec = recessionFrom(tokens, side);
  const notes = collectNotes(tokens);
  const mobility = mobilityFrom(tokens);
  const furcation = furcationFrom(tokens);
  const throughout = probingRange(tokens);
  const generalizedBop = phraseHas(tokens, ["generalized", "bleeding"]);

  const teeth = [...rangeTeeth];
  for (const tooth of listed) {
    if (!teeth.includes(tooth)) {
      teeth.push(tooth);
    }
  }
  if (teeth.length === 0 && currentTooth) {
    teeth.push(currentTooth);
  }

  const rich =
    siteReads.length > 0 ||
    rangeTeeth.length > 0 ||
    listed.length > 0 ||
    notes.notes.length > 0 ||
    notes.examNotes.length > 0 ||
    throughout !== undefined ||
    (mobility !== undefined && tokens.includes("mobility")) ||
    (furcation !== undefined && tokens.includes("furcation"));

  if (!rich) {
    return undefined;
  }

  const events: ChartEvent[] = [];

  if (
    notes.examNotes.length > 0 &&
    listed.length === 0 &&
    rangeTeeth.length === 0 &&
    siteReads.length === 0 &&
    !throughout &&
    teeth.length === 0
  ) {
    events.push({
      kind: "flag",
      notes: notes.notes,
      examNotes: notes.examNotes,
      raw,
      confidence: "high",
    });
  }

  if (siteReads.length > 0 && teeth.length > 0) {
    const sites = siteReads.map((item) => item.site);
    const readings = siteReads.map((item) => item.pd);
    const bopSites = siteReads.filter((item) => item.bop).map((item) => item.site);
    const event: ChartEvent = {
      kind: "reading",
      tooth: teeth[0],
      teeth: teeth.length > 1 ? teeth : undefined,
      side,
      sites,
      readings,
      bopSites: bopSites.length > 0 ? bopSites : undefined,
      rec: rec?.rec,
      recSites: rec?.sites,
      mobility,
      furcation,
      notes: notes.notes,
      examNotes: notes.examNotes.length > 0 ? notes.examNotes : undefined,
      raw,
      confidence: "high",
    };
    events.push(event);
  } else if (throughout && teeth.length > 0) {
    const mid = throughout.min;
    const proximal = throughout.max;
    const sites = [...SITES];
    const readings = sites.map((site) => (site === "B" || site === "L" ? mid : proximal));
    const exception = lastNumberCue(tokens);
    const splitRec = Boolean(rec && rangeTeeth.length > 0 && exception && rangeTeeth.includes(exception));
    events.push({
      kind: "reading",
      tooth: teeth[0],
      teeth,
      sites,
      readings,
      bopSites: generalizedBop ? sites : undefined,
      rec: splitRec ? undefined : rec?.rec,
      recSites: splitRec ? undefined : rec?.sites,
      notes: notes.notes,
      examNotes: notes.examNotes.length > 0 ? notes.examNotes : undefined,
      raw,
      confidence: "high",
    });
    if (splitRec && rec && exception) {
      events.push({
        kind: "reading",
        tooth: exception,
        rec: rec.rec,
        recSites: rec.sites,
        raw,
        confidence: "high",
      });
    }
  } else if (listed.length > 0 && throughout) {
    const sites = [...SITES];
    const readings = sites.map(() => throughout.max);
    events.push({
      kind: "reading",
      tooth: listed[0],
      teeth: listed,
      sites,
      readings,
      bopSites: generalizedBop ? sites : undefined,
      notes: notes.notes,
      examNotes: notes.examNotes.length > 0 ? notes.examNotes : undefined,
      raw,
      confidence: "high",
    });
  } else if (listed.length > 0 && (throughout || tokens.includes("pockets"))) {
    const span = throughout ?? { min: 5, max: 6 };
    const sites = [...SITES];
    const readings = sites.map((site) => (site === "B" || site === "L" ? span.min : span.max));
    events.push({
      kind: "reading",
      tooth: listed[0],
      teeth: listed,
      sites,
      readings,
      bopSites: generalizedBop ? sites : undefined,
      notes: notes.notes,
      examNotes: notes.examNotes.length > 0 ? notes.examNotes : undefined,
      raw,
      confidence: "high",
    });
  } else if (teeth.length > 0 && (notes.notes.length > 0 || mobility !== undefined || furcation !== undefined || rec)) {
    events.push({
      kind: "reading",
      tooth: teeth[0],
      teeth: teeth.length > 1 ? teeth : undefined,
      rec: rec?.rec,
      recSites: rec?.sites,
      mobility,
      furcation,
      notes: notes.notes,
      examNotes: notes.examNotes.length > 0 ? notes.examNotes : undefined,
      raw,
      confidence: "high",
    });
  }

  if (tokens.includes("localized") && phraseHas(tokens, ["lower", "anterior"])) {
    events.push({
      kind: "flag",
      tooth: 24,
      teeth: LOWER_ANTERIOR,
      notes: ["heavy subgingival calculus lingual"],
      raw,
      confidence: "high",
    });
  }

  if (events.length === 0) {
    return undefined;
  }
  return events;
}
