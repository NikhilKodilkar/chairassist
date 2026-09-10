import { BUCCAL_SITES, LINGUAL_SITES } from "./types";
import type { ChartEvent, Side, Site } from "./types";
import { indexOfPhrase, numberAt, phraseHas, tokenize, tokenToNumber } from "./numbers";

export interface ParserContext {
  tooth?: number;
  side?: Side;
  lastSites: Site[];
  lastEvent?: ChartEvent;
}

export interface ParseResult {
  event: ChartEvent;
  context: ParserContext;
}

const TOOTH_CUES = [
  "tooth",
  "number",
  "on",
  "to",
  "canine",
  "molar",
  "wisdom",
  "premolar",
  "incisor",
  "upper",
  "lower",
];

const SKIP_BEFORE_TOOTH = ["the", "left", "right", "upper", "lower"];

function skipArchWords(tokens: string[], start: number): number {
  let index = start;
  while (index < tokens.length && SKIP_BEFORE_TOOTH.includes(tokens[index])) {
    index += 1;
  }
  return index;
}

function toothFromCue(tokens: string[], index: number): { value: number; numberIndex: number; width: number } | undefined {
  const token = tokens[index];
  const next = tokens[index + 1];
  if (TOOTH_CUES.includes(token) && next) {
    if (token === "to") {
      const previous = index > 0 ? tokenToNumber(tokens[index - 1]) : undefined;
      if (previous !== undefined) {
        return undefined;
      }
    }
    const numberIndex = skipArchWords(tokens, index + 1);
    const parsed = numberAt(tokens, numberIndex);
    if (parsed && parsed.value >= 1 && parsed.value <= 32) {
      return { value: parsed.value, numberIndex, width: parsed.width };
    }
  }
  if (token === "moving" && next === "to") {
    const numberIndex = skipArchWords(tokens, index + 2);
    const parsed = numberAt(tokens, numberIndex);
    if (parsed && parsed.value >= 1 && parsed.value <= 32) {
      return { value: parsed.value, numberIndex, width: parsed.width };
    }
  }
  return undefined;
}

function sitesForSide(side: Side): Site[] {
  return side === "lingual" ? LINGUAL_SITES : BUCCAL_SITES;
}

function namedSite(token: string, side: Side): Site | undefined {
  if (token === "mesial" || token === "mesiobuccal" || token === "mb") {
    return side === "lingual" ? "ML" : "MB";
  }
  if (token === "distal" || token === "distobuccal" || token === "db") {
    return side === "lingual" ? "DL" : "DB";
  }
  if (token === "buccal" || token === "facial" || token === "mid") {
    return "B";
  }
  if (token === "lingual" || token === "palatal") {
    return "L";
  }
  return undefined;
}

function detectSide(tokens: string[]): Side | undefined {
  if (tokens.includes("lingual") || tokens.includes("palatal")) {
    return "lingual";
  }
  if (tokens.includes("buccal") || tokens.includes("facial")) {
    return "buccal";
  }
  return undefined;
}

function detectTooth(tokens: string[]): number | undefined {
  for (let i = 0; i < tokens.length; i += 1) {
    const found = toothFromCue(tokens, i);
    if (found) {
      return found.value;
    }
  }
  for (let i = 0; i < tokens.length; i += 1) {
    const parsed = numberAt(tokens, i);
    if (parsed && parsed.value >= 13 && parsed.value <= 32) {
      return parsed.value;
    }
  }
  return undefined;
}

function toothNumberIndexes(tokens: string[]): Set<number> {
  const skipped = new Set<number>();
  for (let i = 0; i < tokens.length; i += 1) {
    const found = toothFromCue(tokens, i);
    if (!found) {
      continue;
    }
    skipped.add(found.numberIndex);
    if (found.width === 2) {
      skipped.add(found.numberIndex + 1);
    }
  }
  return skipped;
}

function collectSmallInts(tokens: string[]): number[] {
  const skipped = toothNumberIndexes(tokens);
  const values: number[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (skipped.has(i)) {
      continue;
    }
    const value = tokenToNumber(tokens[i]);
    if (value !== undefined && value >= 1 && value <= 12) {
      values.push(value);
    }
  }
  return values;
}

function isSummary(tokens: string[]): boolean {
  return (
    phraseHas(tokens, ["wrap", "up"]) ||
    phraseHas(tokens, ["generate", "summary"]) ||
    phraseHas(tokens, ["lets", "wrap"])
  );
}

function isCorrection(tokens: string[]): boolean {
  return (
    tokens.includes("correction") ||
    phraseHas(tokens, ["scratch", "that"]) ||
    phraseHas(tokens, ["make", "that"])
  );
}

function lowEvent(raw: string, context: ParserContext): ParseResult {
  return {
    event: {
      kind: "navigation",
      tooth: context.tooth,
      side: context.side,
      raw,
      confidence: "low",
    },
    context,
  };
}

export function createParserContext(): ParserContext {
  return { lastSites: [] };
}

export function parseUtterance(raw: string, incoming: ParserContext): ParseResult {
  const tokens = tokenize(raw);
  const context: ParserContext = {
    tooth: incoming.tooth,
    side: incoming.side,
    lastSites: [...incoming.lastSites],
    lastEvent: incoming.lastEvent,
  };

  if (tokens.length === 0) {
    return lowEvent(raw, context);
  }

  const side = detectSide(tokens);
  if (side) {
    context.side = side;
  }

  const tooth = detectTooth(tokens);
  if (tooth !== undefined) {
    context.tooth = tooth;
  }

  const activeSide = context.side ?? "buccal";

  if (isSummary(tokens)) {
    const event: ChartEvent = {
      kind: "summary_request",
      tooth: context.tooth,
      raw,
      confidence: "high",
    };
    context.lastEvent = event;
    return { event, context };
  }

  if (isCorrection(tokens)) {
    const numbers = collectSmallInts(tokens);
    const previous = incoming.lastEvent;
    if (previous && numbers.length === 1) {
      const event: ChartEvent = {
        kind: "reading",
        tooth: previous.tooth ?? context.tooth,
        side: previous.side ?? context.side,
        sites: previous.sites,
        readings: [numbers[0]],
        raw,
        confidence: "high",
      };
      context.lastSites = event.sites ?? context.lastSites;
      context.lastEvent = event;
      return { event, context };
    }
    if (previous) {
      const event: ChartEvent = {
        ...previous,
        raw,
        note: "correction",
        confidence: "high",
      };
      context.lastEvent = event;
      return { event, context };
    }
    return lowEvent(raw, context);
  }

  if (tokens.includes("watch")) {
    const event: ChartEvent = {
      kind: "flag",
      tooth: context.tooth,
      sites: context.lastSites.length > 0 ? context.lastSites : undefined,
      note: "watch",
      raw,
      confidence: context.tooth ? "high" : "low",
    };
    context.lastEvent = event;
    return { event, context };
  }

  const recIndex = tokens.indexOf("recession");
  if (recIndex >= 0) {
    const rec = tokenToNumber(tokens[recIndex + 1] ?? "");
    if (rec !== undefined) {
      const event: ChartEvent = {
        kind: "reading",
        tooth: context.tooth,
        side: activeSide,
        sites: context.lastSites.length > 0 ? context.lastSites : sitesForSide(activeSide),
        rec,
        raw,
        confidence: context.tooth ? "high" : "low",
      };
      context.lastEvent = event;
      return { event, context };
    }
  }

  const mobilityIndex = tokens.indexOf("mobility");
  if (mobilityIndex >= 0) {
    const mobility = tokenToNumber(tokens[mobilityIndex + 1] ?? "");
    if (mobility !== undefined && mobility >= 0 && mobility <= 3) {
      const event: ChartEvent = {
        kind: "reading",
        tooth: context.tooth,
        mobility: mobility as 0 | 1 | 2 | 3,
        raw,
        confidence: context.tooth ? "high" : "low",
      };
      context.lastEvent = event;
      return { event, context };
    }
  }

  const furcationAt = indexOfPhrase(tokens, ["class"]);
  if (furcationAt >= 0 && tokens.includes("furcation")) {
    const furcation = tokenToNumber(tokens[furcationAt + 1] ?? "");
    if (furcation !== undefined && furcation >= 0 && furcation <= 3) {
      const event: ChartEvent = {
        kind: "reading",
        tooth: context.tooth,
        furcation: furcation as 0 | 1 | 2 | 3,
        raw,
        confidence: context.tooth ? "high" : "low",
      };
      context.lastEvent = event;
      return { event, context };
    }
  }

  const singleNames = ["distal", "mesial"];
  for (const name of singleNames) {
    const idx = tokens.indexOf(name);
    if (idx >= 0) {
      const maybeNumber = tokenToNumber(tokens[idx + 1] ?? "");
      if (maybeNumber !== undefined && maybeNumber >= 1 && maybeNumber <= 12) {
        const site = namedSite(name, activeSide);
        if (site) {
          const event: ChartEvent = {
            kind: "reading",
            tooth: context.tooth,
            side: activeSide,
            sites: [site],
            readings: [maybeNumber],
            bopSites: tokens.includes("bleeding") ? [site] : undefined,
            raw,
            confidence: context.tooth ? "high" : "low",
          };
          context.lastSites = [site];
          context.lastEvent = event;
          return { event, context };
        }
      }
    }
  }

  const numbers = collectSmallInts(tokens);
  if (numbers.length === 3 && context.tooth) {
    const sites = sitesForSide(activeSide);
    const event: ChartEvent = {
      kind: "reading",
      tooth: context.tooth,
      side: activeSide,
      sites,
      readings: numbers,
      bopSites: tokens.includes("bleeding") ? sites : undefined,
      raw,
      confidence: "high",
    };
    context.lastSites = sites;
    context.lastEvent = event;
    return { event, context };
  }

  if (tokens.includes("bleeding") && context.tooth && context.lastSites.length > 0) {
    const event: ChartEvent = {
      kind: "reading",
      tooth: context.tooth,
      side: context.side,
      sites: context.lastSites,
      bopSites: context.lastSites,
      raw,
      confidence: "high",
    };
    context.lastEvent = event;
    return { event, context };
  }

  if (tooth !== undefined || side) {
    const event: ChartEvent = {
      kind: "navigation",
      tooth: context.tooth,
      side: context.side,
      raw,
      confidence: "high",
    };
    context.lastEvent = event;
    return { event, context };
  }

  return lowEvent(raw, context);
}
