import { createParserContext, parseUtterance } from "./parser";
import type { ChartEvent } from "./types";

export interface ParserCase {
  name: string;
  lines: string[];
  check: (events: ChartEvent[]) => string | undefined;
}

export interface ParserCaseResult {
  name: string;
  lines: string[];
  events: ChartEvent[];
  passed: boolean;
  detail: string;
}

function parseMany(lines: string[]): ChartEvent[] {
  let context = createParserContext();
  return lines.map((line) => {
    const result = parseUtterance(line, context);
    context = result.context;
    return result.event;
  });
}

function samePrimitive(actual: unknown, expected: unknown): boolean {
  return actual === expected;
}

function sameList(actual: unknown[] | undefined, expected: unknown[]): boolean {
  if (!actual || actual.length !== expected.length) {
    return false;
  }
  return actual.every((value, index) => value === expected[index]);
}

function expectEqual(actual: unknown, expected: unknown, label: string): string | undefined {
  if (samePrimitive(actual, expected)) {
    return undefined;
  }
  return `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

function expectList(actual: unknown[] | undefined, expected: unknown[], label: string): string | undefined {
  if (sameList(actual, expected)) {
    return undefined;
  }
  return `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

function firstFailure(checks: Array<string | undefined>): string | undefined {
  return checks.find((item) => item !== undefined);
}

export const PARSER_CASES: ParserCase[] = [
  {
    name: "navigates to tooth fourteen from words and digits",
    lines: ["tooth fourteen", "number 14"],
    check: (events) =>
      firstFailure([
        expectEqual(events[0].kind, "navigation", "kind"),
        expectEqual(events[0].tooth, 14, "first tooth"),
        expectEqual(events[1].tooth, 14, "second tooth"),
      ]),
  },
  {
    name: "accepts on fourteen and moving to three",
    lines: ["on fourteen", "moving to three"],
    check: (events) => firstFailure([expectEqual(events[0].tooth, 14, "first tooth"), expectEqual(events[1].tooth, 3, "second tooth")]),
  },
  {
    name: "maps facial to buccal and palatal to lingual",
    lines: ["tooth fourteen facial", "palatal"],
    check: (events) => firstFailure([expectEqual(events[0].side, "buccal", "facial"), expectEqual(events[1].side, "lingual", "palatal")]),
  },
  {
    name: "assigns a buccal triplet",
    lines: ["tooth fourteen", "buccal", "three two three"],
    check: (events) => {
      const event = events[events.length - 1];
      return firstFailure([
        expectEqual(event.kind, "reading", "kind"),
        expectList(event.sites, ["MB", "B", "DB"], "sites"),
        expectList(event.readings, [3, 2, 3], "readings"),
        expectEqual(event.confidence, "high", "confidence"),
      ]);
    },
  },
  {
    name: "assigns a digit triplet",
    lines: ["tooth 14", "3 2 3"],
    check: (events) => expectList(events[1].readings, [3, 2, 3], "readings"),
  },
  {
    name: "assigns a lingual triplet",
    lines: ["tooth fourteen", "lingual", "two two three"],
    check: (events) =>
      firstFailure([expectList(events[2].sites, ["ML", "L", "DL"], "sites"), expectList(events[2].readings, [2, 2, 3], "readings")]),
  },
  {
    name: "reads a single distal site",
    lines: ["tooth fourteen", "distal five"],
    check: (events) => firstFailure([expectList(events[1].sites, ["DB"], "sites"), expectList(events[1].readings, [5], "readings")]),
  },
  {
    name: "reads mesial four on lingual as ML",
    lines: ["tooth fourteen", "lingual", "mesial four"],
    check: (events) => firstFailure([expectList(events[2].sites, ["ML"], "sites"), expectList(events[2].readings, [4], "readings")]),
  },
  {
    name: "marks bleeding on the last site",
    lines: ["tooth fourteen", "distal five", "bleeding"],
    check: (events) => expectList(events[2].bopSites, ["DB"], "bopSites"),
  },
  {
    name: "marks bleeding on distal in one utterance",
    lines: ["tooth fourteen", "distal five bleeding"],
    check: (events) => expectList(events[1].bopSites, ["DB"], "bopSites"),
  },
  {
    name: "records recession two",
    lines: ["tooth fourteen", "recession two"],
    check: (events) => expectEqual(events[1].rec, 2, "rec"),
  },
  {
    name: "records mobility one",
    lines: ["tooth fourteen", "mobility one"],
    check: (events) => expectEqual(events[1].mobility, 1, "mobility"),
  },
  {
    name: "records class two furcation",
    lines: ["tooth fourteen", "class two furcation"],
    check: (events) => expectEqual(events[1].furcation, 2, "furcation"),
  },
  {
    name: "flags watch on the current tooth",
    lines: ["tooth fourteen", "watch that"],
    check: (events) =>
      firstFailure([
        expectEqual(events[1].kind, "flag", "kind"),
        expectEqual(events[1].note, "watch", "note"),
        expectEqual(events[1].tooth, 14, "tooth"),
      ]),
  },
  {
    name: "corrects the last reading with make that five",
    lines: ["tooth fourteen", "distal four", "make that five"],
    check: (events) => firstFailure([expectList(events[2].readings, [5], "readings"), expectList(events[2].sites, ["DB"], "sites")]),
  },
  {
    name: "accepts correction as a cue",
    lines: ["tooth fourteen", "distal four", "correction make that five"],
    check: (events) => expectList(events[2].readings, [5], "readings"),
  },
  {
    name: "accepts scratch that then a new value",
    lines: ["tooth fourteen", "distal four", "scratch that", "distal five"],
    check: (events) => expectList(events[3].readings, [5], "readings"),
  },
  {
    name: "fires a summary request",
    lines: ["let's wrap up"],
    check: (events) => expectEqual(events[0].kind, "summary_request", "kind"),
  },
  {
    name: "fires generate summary",
    lines: ["generate summary"],
    check: (events) => expectEqual(events[0].kind, "summary_request", "kind"),
  },
  {
    name: "treats whisper to as two inside a triplet",
    lines: ["tooth fourteen", "three to three"],
    check: (events) => expectList(events[1].readings, [3, 2, 3], "readings"),
  },
  {
    name: "treats whisper for as four inside a triplet",
    lines: ["tooth fourteen", "three for three"],
    check: (events) => expectList(events[1].readings, [3, 4, 3], "readings"),
  },
  {
    name: "does not write garbage for unparseable speech",
    lines: ["how was your weekend"],
    check: (events) => firstFailure([expectEqual(events[0].confidence, "low", "confidence"), expectEqual(events[0].readings, undefined, "readings")]),
  },
  {
    name: "keeps tooth context across utterances",
    lines: ["tooth fourteen", "buccal", "three two three", "distal five"],
    check: (events) => firstFailure([expectEqual(events[3].tooth, 14, "tooth"), expectList(events[3].readings, [5], "readings")]),
  },
  {
    name: "accepts millimeters wording",
    lines: ["tooth fourteen", "distal five millimeters"],
    check: (events) => expectList(events[1].readings, [5], "readings"),
  },
  {
    name: "handles the hero demo sequence",
    lines: [
      "Let's look at tooth fourteen",
      "buccal",
      "three two three",
      "distal five",
      "bleeding",
      "correction, make that five",
      "watch that one",
      "let's wrap up",
    ],
    check: (events) =>
      firstFailure([
        expectEqual(events[0].tooth, 14, "tooth"),
        expectList(events[2].readings, [3, 2, 3], "buccal triplet"),
        expectList(events[3].readings, [5], "distal"),
        expectList(events[4].bopSites, ["DB"], "bleeding"),
        expectList(events[5].readings, [5], "correction"),
        expectEqual(events[6].kind, "flag", "watch"),
        expectEqual(events[7].kind, "summary_request", "summary"),
      ]),
  },
  {
    name: "navigates with moving to nineteen",
    lines: ["moving to nineteen"],
    check: (events) => expectEqual(events[0].tooth, 19, "tooth"),
  },
  {
    name: "reads a single-site mesial on buccal",
    lines: ["tooth 3", "mesial four"],
    check: (events) => expectList(events[1].sites, ["MB"], "sites"),
  },
  {
    name: "marks bleeding on distal as a combined phrase after a triplet",
    lines: ["tooth fourteen", "three two three", "bleeding on distal"],
    check: (events) => {
      if (events[2].bopSites && events[2].bopSites.length > 0) {
        return undefined;
      }
      return `bopSites: expected a non-empty list, got ${JSON.stringify(events[2].bopSites)}`;
    },
  },
  {
    name: "accepts number fourteen",
    lines: ["number fourteen"],
    check: (events) => expectEqual(events[0].tooth, 14, "tooth"),
  },
  {
    name: "does not treat random large numbers as pocket depths",
    lines: ["tooth fourteen", "call the front desk at extension"],
    check: (events) => firstFailure([expectEqual(events[1].kind, "navigation", "kind"), expectEqual(events[1].readings, undefined, "readings")]),
  },
  {
    name: "requires a current tooth before writing a triplet",
    lines: ["three two three"],
    check: (events) => expectEqual(events[0].confidence, "low", "confidence"),
  },
  {
    name: "reads canine 27 with a facial triplet",
    lines: ["canine 27, facial 2 2 2"],
    check: (events) =>
      firstFailure([
        expectEqual(events[0].kind, "reading", "kind"),
        expectEqual(events[0].tooth, 27, "tooth"),
        expectEqual(events[0].side, "buccal", "side"),
        expectList(events[0].sites, ["MB", "B", "DB"], "sites"),
        expectList(events[0].readings, [2, 2, 2], "readings"),
      ]),
  },
  {
    name: "reads tooth twenty seven as 27",
    lines: ["tooth twenty seven", "facial two two two"],
    check: (events) => firstFailure([expectEqual(events[0].tooth, 27, "tooth"), expectList(events[1].readings, [2, 2, 2], "readings")]),
  },
  {
    name: "keeps facial plus three numbers as a triplet",
    lines: ["tooth fourteen", "facial 3 2 3"],
    check: (events) => firstFailure([expectList(events[1].sites, ["MB", "B", "DB"], "sites"), expectList(events[1].readings, [3, 2, 3], "readings")]),
  },
  {
    name: "reads palatal on one with a 2 2 2 triplet",
    lines: ["palatal on one - 2, 2, 2"],
    check: (events) =>
      firstFailure([
        expectEqual(events[0].kind, "reading", "kind"),
        expectEqual(events[0].tooth, 1, "tooth"),
        expectEqual(events[0].side, "lingual", "side"),
        expectList(events[0].sites, ["ML", "L", "DL"], "sites"),
        expectList(events[0].readings, [2, 2, 2], "readings"),
      ]),
  },
  {
    name: "reads palatal on one then the triplet on a second line",
    lines: ["palatal on one", "two two two"],
    check: (events) =>
      firstFailure([
        expectEqual(events[0].tooth, 1, "tooth"),
        expectEqual(events[0].side, "lingual", "side"),
        expectList(events[1].readings, [2, 2, 2], "readings"),
        expectList(events[1].sites, ["ML", "L", "DL"], "sites"),
      ]),
  },
  {
    name: "reads lower 26 as tooth 26",
    lines: ["lower 26"],
    check: (events) => firstFailure([expectEqual(events[0].kind, "navigation", "kind"), expectEqual(events[0].tooth, 26, "tooth")]),
  },
  {
    name: "reads lower twenty six as tooth 26",
    lines: ["lower twenty six"],
    check: (events) => expectEqual(events[0].tooth, 26, "tooth"),
  },
  {
    name: "reads lower left 26 as tooth 26",
    lines: ["lower left 26"],
    check: (events) => expectEqual(events[0].tooth, 26, "tooth"),
  },
  {
    name: "reads upper 14 as tooth 14",
    lines: ["upper 14", "facial three two three"],
    check: (events) => firstFailure([expectEqual(events[0].tooth, 14, "tooth"), expectList(events[1].readings, [3, 2, 3], "readings")]),
  },
];

export function runParserCase(parserCase: ParserCase): ParserCaseResult {
  const events = parseMany(parserCase.lines);
  const detail = parserCase.check(events);
  return {
    name: parserCase.name,
    lines: parserCase.lines,
    events,
    passed: detail === undefined,
    detail: detail ?? "passed",
  };
}

export function runAllParserCases(): ParserCaseResult[] {
  return PARSER_CASES.map(runParserCase);
}

export function formatEvent(event: ChartEvent): string {
  const parts = [`${event.kind}`, event.confidence];
  if (event.tooth !== undefined) {
    parts.push(`tooth ${event.tooth}`);
  }
  if (event.side) {
    parts.push(event.side);
  }
  if (event.sites && event.sites.length > 0) {
    parts.push(event.sites.join("/"));
  }
  if (event.readings && event.readings.length > 0) {
    parts.push(`${event.readings.join("-")} mm`);
  }
  if (event.bopSites && event.bopSites.length > 0) {
    parts.push(`BOP ${event.bopSites.join("/")}`);
  }
  if (event.rec !== undefined) {
    parts.push(`REC ${event.rec}`);
  }
  if (event.mobility !== undefined) {
    parts.push(`mobility ${event.mobility}`);
  }
  if (event.furcation !== undefined) {
    parts.push(`furcation ${event.furcation}`);
  }
  if (event.note) {
    parts.push(event.note);
  }
  return parts.join(" · ");
}
