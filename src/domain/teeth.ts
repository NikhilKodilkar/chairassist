import { numberToSpoken } from "./numbers";

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

export function roleIndex(tooth: number): number {
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

export function toothScreenSlot(tooth: number): { row: "upper" | "lower"; column: number } {
  if (tooth <= 16) {
    return { row: "upper", column: tooth - 1 };
  }
  return { row: "lower", column: 32 - tooth };
}

export function toothFocusPose(tooth?: number): { x: number; y: number; yaw: number } {
  if (!tooth) {
    return { x: 0, y: 0, yaw: -16 };
  }
  const slot = toothScreenSlot(tooth);
  const x = (slot.column / 15 - 0.5) * 320;
  const y = slot.row === "upper" ? -28 : 42;
  const yaw = toothSide(tooth) === "right" ? 20 : -24;
  return { x, y, yaw };
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

export function toothEverydayName(tooth: number): string {
  const role = toothRole(tooth);
  const pretty = role === "third molar" ? "wisdom tooth" : role;
  return `${toothArch(tooth)} ${toothSide(tooth)} ${pretty}`;
}

function titleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => (word.length === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`))
    .join(" ");
}

export function toothClinicalTitle(tooth: number): string {
  return titleCase(toothEverydayName(tooth));
}

export function toothHeaderLabel(tooth: number): string {
  const side = toothSide(tooth) === "right" ? "R" : "L";
  const arch = toothArch(tooth) === "upper" ? "U" : "L";
  return `${arch}${side} ${toothShortName(tooth)}`;
}

export function toothSpeakCue(tooth: number): string {
  return `${toothArch(tooth)} ${tooth}`;
}

export function toothSpeakPhrase(tooth: number): string {
  return `tooth ${numberToSpoken(tooth)}`;
}
