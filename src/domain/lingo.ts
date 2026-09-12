import { rewriteClinicianPhrases } from "./lexicon";
import { numberAt, phraseHas, tokenize, tokenToNumber } from "./numbers";

export type LingoCommand = "reset_tooth" | "reset_all" | "set_name";

export interface LingoResult {
  raw: string;
  text: string;
  command?: LingoCommand;
  name?: string;
  heard: string;
  rewrote: boolean;
}

const RESET_ALL_WORDS = ["all", "everything", "patient", "chart", "exam"];

const POCKET_TENS: Record<string, number> = {
  forty: 4,
  fifty: 5,
  sixty: 6,
  seventy: 7,
  eighty: 8,
  ninety: 9,
};

function isPocketDigit(value: number | undefined): value is number {
  return value !== undefined && value >= 1 && value <= 9;
}

function expandDigitRun(token: string): string[] | undefined {
  if (token.length !== 3 && token.length !== 6) {
    return undefined;
  }
  const digits: string[] = [];
  for (const ch of token) {
    if (ch < "1" || ch > "9") {
      return undefined;
    }
    digits.push(ch);
  }
  return digits;
}

function consumeHundredTriplet(tokens: string[], index: number): { parts: string[]; width: number } | undefined {
  const hundreds = tokenToNumber(tokens[index]);
  if (!isPocketDigit(hundreds) || tokens[index + 1] !== "hundred") {
    return undefined;
  }
  let cursor = index + 2;
  if (tokens[cursor] === "and") {
    cursor += 1;
  }
  const tensWord = tokens[cursor];
  const tensFromWord = tensWord ? POCKET_TENS[tensWord] : undefined;
  if (tensFromWord !== undefined) {
    const ones = tokenToNumber(tokens[cursor + 1] ?? "");
    if (isPocketDigit(ones)) {
      return { parts: [String(hundreds), String(tensFromWord), String(ones)], width: cursor + 2 - index };
    }
  }
  const rest = numberAt(tokens, cursor);
  if (!rest || rest.value < 11 || rest.value > 99) {
    return undefined;
  }
  const tens = Math.floor(rest.value / 10);
  const ones = rest.value % 10;
  if (!isPocketDigit(tens) || !isPocketDigit(ones)) {
    return undefined;
  }
  return { parts: [String(hundreds), String(tens), String(ones)], width: cursor + rest.width - index };
}

function consumePocketTens(tokens: string[], index: number): { parts: string[]; width: number } | undefined {
  const tens = POCKET_TENS[tokens[index] ?? ""];
  if (tens === undefined) {
    return undefined;
  }
  const ones = tokenToNumber(tokens[index + 1] ?? "");
  if (!isPocketDigit(ones)) {
    return undefined;
  }
  return { parts: [String(tens), String(ones)], width: 2 };
}

function rewriteTokens(tokens: string[]): string[] {
  const next: string[] = [];
  let index = 0;
  const source = rewriteClinicianPhrases(tokens);
  while (index < source.length) {
    const hundred = consumeHundredTriplet(source, index);
    if (hundred) {
      next.push(...hundred.parts);
      index += hundred.width;
      continue;
    }
    const tens = consumePocketTens(source, index);
    if (tens) {
      next.push(...tens.parts);
      index += tens.width;
      continue;
    }
    const collapsed = expandDigitRun(source[index]);
    if (collapsed) {
      next.push(...collapsed);
      index += 1;
      continue;
    }
    next.push(source[index]);
    index += 1;
  }
  return next;
}

const NOT_A_NAME = [
  "tooth",
  "number",
  "facial",
  "palatal",
  "buccal",
  "lingual",
  "mesial",
  "distal",
  "bleeding",
  "pocket",
  "pockets",
  "millimeter",
  "millimeters",
  "reset",
  "cancel",
  "upper",
  "lower",
  "class",
  "mobility",
  "furcation",
  "that",
  "this",
  "it",
  "is",
  "the",
  "a",
  "an",
  "of",
  "and",
];

function titleCase(word: string): string {
  if (word.length === 0) {
    return word;
  }
  return word[0].toUpperCase() + word.slice(1);
}

function looksLikeName(token: string): boolean {
  if (NOT_A_NAME.includes(token)) {
    return false;
  }
  if (tokenToNumber(token) !== undefined) {
    return false;
  }
  for (const ch of token) {
    if (ch < "a" || ch > "z") {
      return false;
    }
  }
  return token.length > 1;
}

function nameAfterPrefix(token: string, prefix: string): string | undefined {
  if (token.length <= prefix.length) {
    return undefined;
  }
  if (!token.startsWith(prefix)) {
    return undefined;
  }
  const rest = token.slice(prefix.length);
  if (!looksLikeName(rest)) {
    return undefined;
  }
  return titleCase(rest);
}

function nameAfterCue(tokens: string[], cueAt: number): string | undefined {
  let index = cueAt + 1;
  while (index < tokens.length && (tokens[index] === "is" || tokens[index] === "the" || tokens[index] === "a")) {
    index += 1;
  }
  const parts: string[] = [];
  while (index < tokens.length && parts.length < 2 && looksLikeName(tokens[index])) {
    parts.push(titleCase(tokens[index]));
    index += 1;
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(" ");
}

function extractSpokenName(tokens: string[]): string | undefined {
  for (let i = 0; i < tokens.length; i += 1) {
    const gluedNamed = nameAfterPrefix(tokens[i], "named");
    if (gluedNamed) {
      return gluedNamed;
    }
    const gluedName = nameAfterPrefix(tokens[i], "name");
    if (gluedName) {
      return gluedName;
    }
    if (tokens[i] === "name" || tokens[i] === "named") {
      const spoken = nameAfterCue(tokens, i);
      if (spoken) {
        return spoken;
      }
    }
  }
  return undefined;
}

function isCancelTooth(tokens: string[]): boolean {
  if (tokens.includes("all") || tokens.includes("everything") || tokens.includes("chart") || tokens.includes("exam")) {
    return false;
  }
  return (
    phraseHas(tokens, ["cancel", "that"]) ||
    phraseHas(tokens, ["cancel", "it"]) ||
    phraseHas(tokens, ["cancelled", "that"]) ||
    phraseHas(tokens, ["canceled", "that"]) ||
    phraseHas(tokens, ["undo", "that"]) ||
    tokens.includes("cancel") ||
    tokens.includes("cancelled") ||
    tokens.includes("canceled")
  );
}

function detectCommand(tokens: string[]): LingoCommand | undefined {
  if (isCancelTooth(tokens)) {
    return "reset_tooth";
  }
  const hasReset = tokens.includes("reset") || tokens.includes("clear");
  if (!hasReset) {
    return undefined;
  }
  for (const word of RESET_ALL_WORDS) {
    if (tokens.includes(word)) {
      return "reset_all";
    }
  }
  return "reset_tooth";
}

export function interpretLingo(raw: string): LingoResult {
  const tokens = tokenize(raw);
  const spokenName = extractSpokenName(tokens);
  if (spokenName) {
    return {
      raw,
      text: raw,
      command: "set_name",
      name: spokenName,
      heard: `Hello ${spokenName}`,
      rewrote: true,
    };
  }
  const command = detectCommand(tokens);
  if (command === "reset_all") {
    return {
      raw,
      text: raw,
      command,
      heard: "reset all — confirm on screen",
      rewrote: false,
    };
  }
  if (command === "reset_tooth") {
    return {
      raw,
      text: raw,
      command,
      heard: "reset current tooth",
      rewrote: false,
    };
  }

  const rewritten = rewriteTokens(tokens);
  const text = rewritten.join(" ");
  const original = tokens.join(" ");
  const rewrote = text !== original;
  return {
    raw,
    text,
    heard: rewrote ? `${raw.trim()} → ${text}` : raw.trim(),
    rewrote,
  };
}
