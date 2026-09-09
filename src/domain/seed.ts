import { emptyExam, emptySites } from "./exam";
import type { Exam, PatientFile, SiteReading, ToothState } from "./types";

function fillHealthy(pd: number): Record<keyof ToothState["sites"], SiteReading> {
  const sites = emptySites();
  sites.MB = { pd };
  sites.B = { pd };
  sites.DB = { pd };
  sites.ML = { pd };
  sites.L = { pd };
  sites.DL = { pd };
  return sites;
}

function marchTooth(tooth: number): ToothState {
  if (tooth === 14) {
    return {
      tooth,
      sites: {
        MB: { pd: 3 },
        B: { pd: 2 },
        DB: { pd: 3 },
        ML: { pd: 3 },
        L: { pd: 2 },
        DL: { pd: 3 },
      },
      notes: ["watch"],
    };
  }

  if (tooth === 19) {
    return {
      tooth,
      sites: {
        MB: { pd: 4 },
        B: { pd: 3 },
        DB: { pd: 4 },
        ML: { pd: 3 },
        L: { pd: 3 },
        DL: { pd: 4 },
      },
      notes: [],
    };
  }

  const baseline = tooth >= 1 && tooth <= 16 ? 2 : 3;
  return {
    tooth,
    sites: fillHealthy(baseline),
    notes: [],
  };
}

export function createMarchExam(): Exam {
  const exam = emptyExam("rita_shah", "Rita Shah", "2026-03-12");
  for (let tooth = 1; tooth <= 32; tooth += 1) {
    exam.teeth[tooth] = marchTooth(tooth);
  }
  return exam;
}

export function createPatientFile(): PatientFile {
  return {
    patientId: "rita_shah",
    patientName: "Rita Shah",
    lastVisit: createMarchExam(),
  };
}

export function createTodayExam(patient: PatientFile): Exam {
  return emptyExam(patient.patientId, patient.patientName, "2026-09-09");
}
