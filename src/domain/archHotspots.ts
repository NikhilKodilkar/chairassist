export interface ArchHotspot {
  tooth: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const UPPER_ARCH_SRC = "/arch-upper.png";
export const LOWER_ARCH_SRC = "/arch-lower.png";

const UPPER_TEETH: ArchHotspot[] = [
  { tooth: 8, x: 45.0, y: 8.2, w: 7.2, h: 7.2 },
  { tooth: 9, x: 55.0, y: 8.2, w: 7.2, h: 7.2 },
  { tooth: 7, x: 35.5, y: 13.9, w: 6.4, h: 8.4 },
  { tooth: 10, x: 64.5, y: 13.9, w: 6.4, h: 8.4 },
  { tooth: 6, x: 28.0, y: 23.7, w: 5.6, h: 9.3 },
  { tooth: 11, x: 72.0, y: 23.7, w: 5.6, h: 9.3 },
  { tooth: 5, x: 23.5, y: 35.5, w: 5.2, h: 8.4 },
  { tooth: 12, x: 76.5, y: 35.5, w: 5.2, h: 8.4 },
  { tooth: 4, x: 21.0, y: 46.8, w: 5.0, h: 8.2 },
  { tooth: 13, x: 79.0, y: 46.8, w: 5.0, h: 8.2 },
  { tooth: 3, x: 18.5, y: 58.2, w: 6.6, h: 10.3 },
  { tooth: 14, x: 81.5, y: 58.2, w: 6.6, h: 10.3 },
  { tooth: 2, x: 17.5, y: 70.5, w: 6.2, h: 10.3 },
  { tooth: 15, x: 82.5, y: 70.5, w: 6.2, h: 10.3 },
  { tooth: 1, x: 17.0, y: 82.8, w: 6.4, h: 9.5 },
  { tooth: 16, x: 83.0, y: 82.8, w: 6.4, h: 9.5 },
];

const LOWER_TEETH: ArchHotspot[] = [
  { tooth: 32, x: 17.5, y: 13.9, w: 7.4, h: 10.3 },
  { tooth: 17, x: 82.5, y: 13.9, w: 7.4, h: 10.3 },
  { tooth: 31, x: 17.5, y: 26.8, w: 6.4, h: 10.3 },
  { tooth: 18, x: 82.5, y: 26.8, w: 6.4, h: 10.3 },
  { tooth: 30, x: 19.0, y: 40.7, w: 6.6, h: 10.5 },
  { tooth: 19, x: 81.0, y: 40.7, w: 6.6, h: 10.5 },
  { tooth: 29, x: 22.0, y: 52.0, w: 5.4, h: 8.6 },
  { tooth: 20, x: 78.0, y: 52.0, w: 5.4, h: 8.6 },
  { tooth: 28, x: 25.5, y: 61.2, w: 5.2, h: 8.2 },
  { tooth: 21, x: 74.5, y: 61.2, w: 5.2, h: 8.2 },
  { tooth: 27, x: 30.5, y: 71.0, w: 5.4, h: 8.8 },
  { tooth: 22, x: 69.5, y: 71.0, w: 5.4, h: 8.8 },
  { tooth: 26, x: 37.5, y: 79.3, w: 6.0, h: 7.4 },
  { tooth: 23, x: 62.5, y: 79.3, w: 6.0, h: 7.4 },
  { tooth: 25, x: 45.0, y: 82.3, w: 6.6, h: 7.2 },
  { tooth: 24, x: 55.0, y: 82.3, w: 6.6, h: 7.2 },
];

const BY_TOOTH = new Map<number, ArchHotspot>();
for (const spot of UPPER_TEETH) {
  BY_TOOTH.set(spot.tooth, spot);
}
for (const spot of LOWER_TEETH) {
  BY_TOOTH.set(spot.tooth, spot);
}

export function upperArchHotspots(): ArchHotspot[] {
  return UPPER_TEETH;
}

export function lowerArchHotspots(): ArchHotspot[] {
  return LOWER_TEETH;
}

export function archHotspot(tooth: number): ArchHotspot | undefined {
  return BY_TOOTH.get(tooth);
}

export function archImageForTooth(tooth: number): string {
  return tooth <= 16 ? UPPER_ARCH_SRC : LOWER_ARCH_SRC;
}
