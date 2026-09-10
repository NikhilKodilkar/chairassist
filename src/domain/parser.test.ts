import { describe, expect, it } from "vitest";
import { createParserContext, parseUtterance } from "./parser";

function parseMany(lines: string[]) {
  let context = createParserContext();
  return lines.map((line) => {
    const result = parseUtterance(line, context);
    context = result.context;
    return result.event;
  });
}

describe("perio parser", () => {
  it("navigates to tooth fourteen from words and digits", () => {
    const [a, b] = parseMany(["tooth fourteen", "number 14"]);
    expect(a.kind).toBe("navigation");
    expect(a.tooth).toBe(14);
    expect(b.tooth).toBe(14);
  });

  it("accepts on fourteen and moving to three", () => {
    const [a, b] = parseMany(["on fourteen", "moving to three"]);
    expect(a.tooth).toBe(14);
    expect(b.tooth).toBe(3);
  });

  it("maps facial to buccal and palatal to lingual", () => {
    const [a, b] = parseMany(["tooth fourteen facial", "palatal"]);
    expect(a.side).toBe("buccal");
    expect(b.side).toBe("lingual");
  });

  it("assigns a buccal triplet", () => {
    const events = parseMany(["tooth fourteen", "buccal", "three two three"]);
    const event = events[events.length - 1];
    expect(event.kind).toBe("reading");
    expect(event.sites).toEqual(["MB", "B", "DB"]);
    expect(event.readings).toEqual([3, 2, 3]);
    expect(event.confidence).toBe("high");
  });

  it("assigns a digit triplet", () => {
    const events = parseMany(["tooth 14", "3 2 3"]);
    expect(events[1].readings).toEqual([3, 2, 3]);
  });

  it("assigns a lingual triplet", () => {
    const events = parseMany(["tooth fourteen", "lingual", "two two three"]);
    expect(events[2].sites).toEqual(["ML", "L", "DL"]);
    expect(events[2].readings).toEqual([2, 2, 3]);
  });

  it("reads a single distal site", () => {
    const events = parseMany(["tooth fourteen", "distal five"]);
    expect(events[1].sites).toEqual(["DB"]);
    expect(events[1].readings).toEqual([5]);
  });

  it("reads mesial four on lingual as ML", () => {
    const events = parseMany(["tooth fourteen", "lingual", "mesial four"]);
    expect(events[2].sites).toEqual(["ML"]);
    expect(events[2].readings).toEqual([4]);
  });

  it("marks bleeding on the last site", () => {
    const events = parseMany(["tooth fourteen", "distal five", "bleeding"]);
    expect(events[2].bopSites).toEqual(["DB"]);
  });

  it("marks bleeding on distal in one utterance", () => {
    const events = parseMany(["tooth fourteen", "distal five bleeding"]);
    expect(events[1].bopSites).toEqual(["DB"]);
  });

  it("records recession two", () => {
    const events = parseMany(["tooth fourteen", "recession two"]);
    expect(events[1].rec).toBe(2);
  });

  it("records mobility one", () => {
    const events = parseMany(["tooth fourteen", "mobility one"]);
    expect(events[1].mobility).toBe(1);
  });

  it("records class two furcation", () => {
    const events = parseMany(["tooth fourteen", "class two furcation"]);
    expect(events[1].furcation).toBe(2);
  });

  it("flags watch on the current tooth", () => {
    const events = parseMany(["tooth fourteen", "watch that"]);
    expect(events[1].kind).toBe("flag");
    expect(events[1].note).toBe("watch");
    expect(events[1].tooth).toBe(14);
  });

  it("corrects the last reading with make that five", () => {
    const events = parseMany(["tooth fourteen", "distal four", "make that five"]);
    expect(events[2].readings).toEqual([5]);
    expect(events[2].sites).toEqual(["DB"]);
  });

  it("accepts correction as a cue", () => {
    const events = parseMany(["tooth fourteen", "distal four", "correction make that five"]);
    expect(events[2].readings).toEqual([5]);
  });

  it("accepts scratch that then a new value", () => {
    const events = parseMany(["tooth fourteen", "distal four", "scratch that", "distal five"]);
    expect(events[3].readings).toEqual([5]);
  });

  it("fires a summary request", () => {
    const events = parseMany(["let's wrap up"]);
    expect(events[0].kind).toBe("summary_request");
  });

  it("fires generate summary", () => {
    const events = parseMany(["generate summary"]);
    expect(events[0].kind).toBe("summary_request");
  });

  it("treats whisper to as two inside a triplet", () => {
    const events = parseMany(["tooth fourteen", "three to three"]);
    expect(events[1].readings).toEqual([3, 2, 3]);
  });

  it("treats whisper for as four inside a triplet", () => {
    const events = parseMany(["tooth fourteen", "three for three"]);
    expect(events[1].readings).toEqual([3, 4, 3]);
  });

  it("does not write garbage for unparseable speech", () => {
    const events = parseMany(["how was your weekend"]);
    expect(events[0].confidence).toBe("low");
    expect(events[0].readings).toBeUndefined();
  });

  it("keeps tooth context across utterances", () => {
    const events = parseMany(["tooth fourteen", "buccal", "three two three", "distal five"]);
    expect(events[3].tooth).toBe(14);
    expect(events[3].readings).toEqual([5]);
  });

  it("accepts millimeters wording", () => {
    const events = parseMany(["tooth fourteen", "distal five millimeters"]);
    expect(events[1].readings).toEqual([5]);
  });

  it("handles the hero demo sequence", () => {
    const events = parseMany([
      "Let's look at tooth fourteen",
      "buccal",
      "three two three",
      "distal five",
      "bleeding",
      "correction, make that five",
      "watch that one",
      "let's wrap up",
    ]);
    expect(events[0].tooth).toBe(14);
    expect(events[2].readings).toEqual([3, 2, 3]);
    expect(events[3].readings).toEqual([5]);
    expect(events[4].bopSites).toEqual(["DB"]);
    expect(events[5].readings).toEqual([5]);
    expect(events[6].kind).toBe("flag");
    expect(events[7].kind).toBe("summary_request");
  });

  it("navigates with moving to nineteen", () => {
    const events = parseMany(["moving to nineteen"]);
    expect(events[0].tooth).toBe(19);
  });

  it("reads a single-site mesial on buccal", () => {
    const events = parseMany(["tooth 3", "mesial four"]);
    expect(events[1].sites).toEqual(["MB"]);
  });

  it("marks bleeding on distal as a combined phrase after a triplet", () => {
    const events = parseMany(["tooth fourteen", "three two three", "bleeding on distal"]);
    expect(events[2].bopSites).toBeTruthy();
  });

  it("accepts number fourteen", () => {
    const events = parseMany(["number fourteen"]);
    expect(events[0].tooth).toBe(14);
  });

  it("does not treat random large numbers as pocket depths", () => {
    const events = parseMany(["tooth fourteen", "call the front desk at extension"]);
    expect(events[1].kind).toBe("navigation");
    expect(events[1].readings).toBeUndefined();
  });

  it("requires a current tooth before writing a triplet", () => {
    const events = parseMany(["three two three"]);
    expect(events[0].confidence).toBe("low");
  });
});
