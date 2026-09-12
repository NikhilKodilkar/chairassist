import lexiconJson from "../../dental_lingo_patient_meanings.json" with { type: "json" };
import { tokenize } from "./numbers";
import { toothArch } from "./teeth";
import type { Site } from "./types";

export interface LingoEntry {
  id: string;
  term: string;
  aliases: string[];
  category: string;
  patient_meaning: string;
}

interface LingoFile {
  entries: LingoEntry[];
}

const lexicon = lexiconJson as LingoFile;

const entriesById = new Map<string, LingoEntry>();
const entriesByPhrase = new Map<string, LingoEntry>();

for (const entry of lexicon.entries) {
  entriesById.set(entry.id, entry);
  const phrases = [entry.term, ...entry.aliases];
  for (const phrase of phrases) {
    const key = tokenize(phrase).join(" ");
    if (key.length > 0) {
      entriesByPhrase.set(key, entry);
    }
  }
}

export function lingoEntry(id: string): LingoEntry | undefined {
  return entriesById.get(id);
}

export function patientMeaning(id: string): string | undefined {
  return entriesById.get(id)?.patient_meaning;
}

export function lookupLingoPhrase(text: string): LingoEntry | undefined {
  return entriesByPhrase.get(tokenize(text).join(" "));
}

function tokensEqualAt(tokens: string[], index: number, phrase: string[]): boolean {
  if (index + phrase.length > tokens.length) {
    return false;
  }
  for (let offset = 0; offset < phrase.length; offset += 1) {
    if (tokens[index + offset] !== phrase[offset]) {
      return false;
    }
  }
  return true;
}

const CLINICIAN_REWRITES: Array<{ from: string[]; to: string[] }> = [
  ...buildRewrites("maxillary", "upper"),
  ...buildRewrites("mandibular", "lower"),
  ...buildRewrites("labial", "facial"),
];

function buildRewrites(id: string, replacement: string): Array<{ from: string[]; to: string[] }> {
  const entry = entriesById.get(id);
  if (!entry) {
    return [];
  }
  const to = tokenize(replacement);
  const phrases = [entry.term, ...entry.aliases];
  const rewrites: Array<{ from: string[]; to: string[] }> = [];
  for (const phrase of phrases) {
    const from = tokenize(phrase);
    if (from.length === 0) {
      continue;
    }
    if (from.length === 1 && from[0].length === 1) {
      continue;
    }
    rewrites.push({ from, to });
  }
  return rewrites;
}

const SORTED_REWRITES = [...CLINICIAN_REWRITES].sort((left, right) => right.from.length - left.from.length);

export function rewriteClinicianPhrases(tokens: string[]): string[] {
  const next: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    let matched = false;
    for (const rewrite of SORTED_REWRITES) {
      if (tokensEqualAt(tokens, index, rewrite.from)) {
        next.push(...rewrite.to);
        index += rewrite.from.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      next.push(tokens[index]);
      index += 1;
    }
  }
  return next;
}

export function patientSitePhrase(site: Site, tooth: number, includeTooth = true): string {
  const inner = toothArch(tooth) === "upper" ? "palate" : "tongue";
  let place = "";
  if (site === "MB") {
    place = "Front cheek-side";
  } else if (site === "B") {
    place = "Middle cheek-side";
  } else if (site === "DB") {
    place = "Back cheek-side";
  } else if (site === "ML") {
    place = `Front ${inner}-side`;
  } else if (site === "L") {
    place = `Middle ${inner}-side`;
  } else {
    place = `Back ${inner}-side`;
  }
  if (!includeTooth) {
    return place;
  }
  return `${place} of tooth #${tooth}`;
}

export function patientPocketMeaning(mm: number): string | undefined {
  if (mm === 4) {
    return patientMeaning("four_mm_pocket");
  }
  if (mm === 5) {
    return patientMeaning("five_mm_pocket");
  }
  if (mm === 6) {
    return patientMeaning("six_mm_pocket");
  }
  if (mm === 7) {
    return patientMeaning("seven_mm_pocket");
  }
  if (mm >= 1 && mm <= 3) {
    return patientMeaning("healthy_sulcus");
  }
  return patientMeaning("pd");
}
