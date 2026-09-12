import { describe, expect, it } from "vitest";
import { applyEvent } from "./exam";
import { ANDREW_MARCH_POCKETS, createMarchExam, createPatientFile, createTodayExam } from "./seed";
import { captionForEvent, marchCompareSentence, toothHistory } from "./translator";

describe("Andrew March history", () => {
  it("seeds six pocket depths on every tooth", () => {
    const march = createMarchExam();
    expect(march.patientName).toBe("Andrew");
    for (let tooth = 1; tooth <= 32; tooth += 1) {
      const pockets = ANDREW_MARCH_POCKETS[tooth];
      expect(pockets.length).toBe(6);
      expect(march.teeth[tooth].sites.MB.pd).toBe(pockets[0]);
      expect(march.teeth[tooth].sites.DB.pd).toBe(pockets[2]);
      expect(march.teeth[tooth].sites.DL.pd).toBe(pockets[5]);
    }
  });

  it("keeps the demo watch spots on 3, 14, and 19", () => {
    const march = createMarchExam();
    expect(march.teeth[14].sites.DB.pd).toBe(3);
    expect(march.teeth[19].sites.MB.pd).toBe(4);
    expect(march.teeth[19].sites.DB.pd).toBe(4);
    expect(march.teeth[3].notes).toContain("watch");
  });

  it("says a site moved the wrong way when it gets deeper", () => {
    expect(marchCompareSentence(3, 5)).toBe(
      "In March this was 3 mm. Today it's 5 mm — it's moved in the wrong direction.",
    );
  });

  it("summarizes every site on a tooth against March", () => {
    const patient = createPatientFile();
    let today = createTodayExam(patient);
    today = applyEvent(today, {
      kind: "reading",
      tooth: 14,
      sites: ["DB"],
      readings: [5],
      bopSites: ["DB"],
      raw: "distal five bleeding",
      confidence: "high",
    });
    const history = toothHistory(today, patient.lastVisit, 14);
    expect(history.lines.length).toBe(6);
    expect(history.trend).toBe("worse");
    expect(history.headline).toContain("wrong direction");
    expect(history.headline).toContain("5 mm");
  });

  it("uses the March compare line as the live caption", () => {
    const march = createMarchExam();
    const caption = captionForEvent(
      {
        kind: "reading",
        tooth: 14,
        sites: ["DB"],
        readings: [5],
        raw: "distal five",
        confidence: "high",
      },
      march,
    );
    expect(caption).toContain("In March this was 3 mm");
    expect(caption).toContain("wrong direction");
  });
});
