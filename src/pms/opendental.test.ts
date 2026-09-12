import { beforeEach, describe, expect, it } from "vitest";
import { applyEvent, emptyExam } from "../domain/exam";
import type { ChartEvent } from "../domain/types";
import { mockOpenDentalWritebacks, resetOpenDentalSession } from "./opendental";

function exam() {
  return emptyExam("andrew", "Andrew", "2026-09-09");
}

function reading(partial: Partial<ChartEvent>): ChartEvent {
  return {
    kind: "reading",
    tooth: 14,
    sites: ["DB"],
    readings: [5],
    raw: "distal five",
    confidence: "high",
    ...partial,
  };
}

describe("Open Dental mock write-backs", () => {
  beforeEach(() => {
    resetOpenDentalSession();
  });

  it("creates a perio exam then posts probing on the first reading", () => {
    const current = applyEvent(exam(), reading({}));
    const calls = mockOpenDentalWritebacks(reading({}), current);
    expect(calls).toHaveLength(2);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].path).toBe("/perioexams");
    expect(calls[0].requestBody?.PatNum).toBe(20);
    expect(calls[1].method).toBe("POST");
    expect(calls[1].path).toBe("/periomeasures");
    expect(calls[1].requestBody?.SequenceType).toBe("Probing");
    expect(calls[1].requestBody?.IntTooth).toBe(14);
    expect(calls[1].requestBody?.DBvalue).toBe(5);
    expect(calls[1].status).toBe(201);
  });

  it("updates the same probing measure on a later reading", () => {
    const first = applyEvent(exam(), reading({}));
    mockOpenDentalWritebacks(reading({}), first);
    const again = reading({ readings: [6], raw: "distal six" });
    const current = applyEvent(first, again);
    const calls = mockOpenDentalWritebacks(again, current);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/periomeasures/206");
    expect(calls[0].requestBody?.DBvalue).toBe(6);
    expect(calls[0].status).toBe(200);
  });

  it("posts bleeding, mobility, and furcation measures", () => {
    const event = reading({
      bopSites: ["DB"],
      mobility: 2,
      furcation: 1,
    });
    const current = applyEvent(exam(), event);
    const calls = mockOpenDentalWritebacks(event, current);
    const types = calls
      .filter((call) => call.path === "/periomeasures")
      .map((call) => call.requestBody?.SequenceType);
    expect(types).toEqual(["Probing", "BleedSupPlaqCalc", "Mobility", "Furcation"]);
    const bleed = calls.find((call) => call.requestBody?.SequenceType === "BleedSupPlaqCalc");
    expect(bleed?.requestBody?.DBvalue).toBe(1);
    const mobility = calls.find((call) => call.requestBody?.SequenceType === "Mobility");
    expect(mobility?.requestBody?.ToothValue).toBe(2);
  });

  it("writes exam notes with PUT /perioexams/{id}", () => {
    const seed = reading({});
    const afterReading = applyEvent(exam(), seed);
    mockOpenDentalWritebacks(seed, afterReading);
    const noteEvent: ChartEvent = {
      kind: "flag",
      examNotes: ["no bleeding"],
      raw: "no bleeding",
      confidence: "high",
    };
    const current = applyEvent(afterReading, noteEvent);
    const calls = mockOpenDentalWritebacks(noteEvent, current);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/perioexams/31");
    expect(calls[0].requestBody?.Note).toBe("no bleeding");
  });

  it("skips a tooth with SequenceType SkipTooth", () => {
    const event: ChartEvent = {
      kind: "reset_tooth",
      tooth: 14,
      raw: "reset tooth fourteen",
      confidence: "high",
    };
    const current = applyEvent(exam(), event);
    const calls = mockOpenDentalWritebacks(event, current);
    expect(calls[0].path).toBe("/perioexams");
    expect(calls[1].requestBody?.SequenceType).toBe("SkipTooth");
    expect(calls[1].requestBody?.IntTooth).toBe(14);
    expect(calls[1].requestBody?.ToothValue).toBe(1);
  });

  it("charts an existing crown on procedurelogs", () => {
    const event = reading({
      tooth: 30,
      notes: ["existing crown"],
    });
    const current = applyEvent(exam(), event);
    const calls = mockOpenDentalWritebacks(event, current);
    const proc = calls.find((call) => call.path === "/procedurelogs");
    expect(proc?.method).toBe("POST");
    expect(proc?.requestBody?.procCode).toBe("D2740");
    expect(proc?.requestBody?.ProcStatus).toBe("EC");
    expect(proc?.requestBody?.ToothNum).toBe("30");
  });

  it("does not write low-confidence events", () => {
    const event = reading({ confidence: "low" });
    expect(mockOpenDentalWritebacks(event, applyEvent(exam(), event))).toEqual([]);
  });
});
