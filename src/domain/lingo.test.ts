import { describe, expect, it } from "vitest";
import { interpretLingo } from "./lingo";
import { patientSitePhrase } from "./lexicon";
import { createParserContext, parseUtterance } from "./parser";

describe("dental lingo layer", () => {
  it("expands a collapsed 363 triplet", () => {
    const lingo = interpretLingo("363.");
    expect(lingo.text).toBe("3 6 3");
    expect(lingo.rewrote).toBe(true);
  });

  it("expands facial 222", () => {
    expect(interpretLingo("facial 222").text).toBe("facial 2 2 2");
  });

  it("expands three hundred sixty three", () => {
    expect(interpretLingo("three hundred sixty three").text).toBe("3 6 3");
  });

  it("does not split tooth twenty six", () => {
    expect(interpretLingo("tooth twenty six").text).toBe("tooth twenty six");
  });

  it("charts 363 on the current tooth", () => {
    const lingo = interpretLingo("363");
    const first = parseUtterance("lower 24", createParserContext());
    const reading = parseUtterance(lingo.text, first.context);
    expect(reading.event.kind).toBe("reading");
    expect(reading.event.tooth).toBe(24);
    expect(reading.event.readings).toEqual([3, 6, 3]);
  });

  it("leaves spaced pocket numbers alone", () => {
    expect(interpretLingo("3 6 3 2 2 2").rewrote).toBe(false);
    expect(interpretLingo("3 6 3 2 2 2").text).toBe("3 6 3 2 2 2");
  });

  it("expands a glued six-number column", () => {
    expect(interpretLingo("363222").text).toBe("3 6 3 2 2 2");
  });

  it("charts six numbers top to bottom", () => {
    const first = parseUtterance("upper 4", createParserContext());
    const reading = parseUtterance("3 6 3 2 2 2", first.context);
    expect(reading.event.sites).toEqual(["MB", "B", "DB", "ML", "L", "DL"]);
    expect(reading.event.readings).toEqual([3, 6, 3, 2, 2, 2]);
  });

  it("names the back tongue-side for patients", () => {
    expect(patientSitePhrase("DL", 3)).toBe("Back palate-side of tooth #3");
    expect(patientSitePhrase("DL", 24)).toBe("Back tongue-side of tooth #24");
  });

  it("treats reset as clear current tooth", () => {
    expect(interpretLingo("reset").command).toBe("reset_tooth");
  });

  it("reads Name Andrew as a patient greeting", () => {
    const lingo = interpretLingo("Name Andrew");
    expect(lingo.command).toBe("set_name");
    expect(lingo.name).toBe("Andrew");
    expect(lingo.heard).toBe("Hello Andrew");
  });

  it("reads Whisper-glued nameAndrew as Andrew", () => {
    const lingo = interpretLingo("nameAndrew.");
    expect(lingo.command).toBe("set_name");
    expect(lingo.name).toBe("Andrew");
    expect(lingo.heard).toBe("Hello Andrew");
  });

  it("reads the name is Maya as a patient greeting", () => {
    expect(interpretLingo("the name is Maya").name).toBe("Maya");
  });

  it("treats cancel that as clear current tooth", () => {
    expect(interpretLingo("cancel that").command).toBe("reset_tooth");
    expect(interpretLingo("cancel that").heard).toBe("reset current tooth");
    expect(interpretLingo("cancelled that").command).toBe("reset_tooth");
    expect(interpretLingo("cancel it").command).toBe("reset_tooth");
  });

  it("rewrites maxillary to upper", () => {
    expect(interpretLingo("maxillary 14").text).toBe("upper 14");
  });

  it("rewrites mandibular jaw to lower", () => {
    expect(interpretLingo("lower jaw 26").text).toBe("lower 26");
  });

  it("treats reset all as a confirm command", () => {
    expect(interpretLingo("reset all").command).toBe("reset_all");
    expect(interpretLingo("clear the chart").command).toBe("reset_all");
  });

  it("passes hygienist tooth-two speech through to a six-site chart", () => {
    const lingo = interpretLingo("Tooth two. Facial two one two. Palatal two two two. No bleeding.");
    const parsed = parseUtterance(lingo.text, createParserContext());
    expect(parsed.event.tooth).toBe(2);
    expect(parsed.event.sites).toEqual(["MB", "B", "DB", "ML", "L", "DL"]);
    expect(parsed.event.readings).toEqual([2, 1, 2, 2, 2, 2]);
    expect(parsed.event.bopSites).toBeUndefined();
    expect(parsed.event.examNotes).toEqual(expect.arrayContaining(["no bleeding"]));
  });
});
