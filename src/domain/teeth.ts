export function toothArch(tooth: number): "upper" | "lower" {
  return tooth <= 16 ? "upper" : "lower";
}

export function toothSide(tooth: number): "right" | "left" {
  if (tooth <= 8 || tooth >= 25) {
    return "right";
  }
  return "left";
}

const ROLES_FROM_POSTERIOR = [
  "third molar",
  "second molar",
  "first molar",
  "second premolar",
  "first premolar",
  "canine",
  "lateral incisor",
  "central incisor",
] as const;

const SHORT_FROM_POSTERIOR = [
  "3rd mol",
  "2nd mol",
  "1st mol",
  "2nd pre",
  "1st pre",
  "canine",
  "lateral",
  "central",
] as const;

function roleIndex(tooth: number): number {
  if (tooth >= 1 && tooth <= 8) {
    return tooth - 1;
  }
  if (tooth >= 9 && tooth <= 16) {
    return 16 - tooth;
  }
  if (tooth >= 17 && tooth <= 24) {
    return tooth - 17;
  }
  return 32 - tooth;
}

export function toothRole(tooth: number): string {
  return ROLES_FROM_POSTERIOR[roleIndex(tooth)];
}

export function toothShortName(tooth: number): string {
  return SHORT_FROM_POSTERIOR[roleIndex(tooth)];
}

export function toothFullName(tooth: number): string {
  return `${toothArch(tooth)} ${toothSide(tooth)} ${toothRole(tooth)}`;
}

export function toothHeaderLabel(tooth: number): string {
  const side = toothSide(tooth) === "right" ? "R" : "L";
  const arch = toothArch(tooth) === "upper" ? "U" : "L";
  return `${arch}${side} ${toothShortName(tooth)}`;
}
