import { statusColor } from "./exam";
import { patientMeaning, patientPocketMeaning, patientSitePhrase } from "./lexicon";
import { HERO_TOOTH, SITES } from "./types";
import type { Exam, Site, SiteReading, ToothState } from "./types";

export const SITE_ANCHORS: Record<Site, { x: number; y: number }> = {
  MB: { x: 27, y: 42 },
  B: { x: 49, y: 38.5 },
  DB: { x: 73, y: 43 },
  ML: { x: 28, y: 47.5 },
  L: { x: 50, y: 49 },
  DL: { x: 74, y: 47.5 },
};

export const FURCATION_ANCHOR = { x: 50, y: 59 };

function siteTitle(site: Site, tooth: number): string {
  return patientSitePhrase(site, tooth, false);
}

export interface HeroSiteView {
  site: Site;
  title: string;
  pd?: number;
  previousPd?: number;
  bop: boolean;
  rec?: number;
  tone: "grey" | "green" | "amber" | "red";
  x: number;
  y: number;
}

export interface HeroCallout {
  id: string;
  title: string;
  detail: string;
  tone: "amber" | "red";
}

export interface HeroToothView {
  sites: HeroSiteView[];
  callouts: HeroCallout[];
  watching: boolean;
  mobility: number;
  furcation: number;
  distalPd?: number;
  distalPrevious?: number;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function mixSite(previous: SiteReading | undefined, current: SiteReading | undefined, timeline: number): SiteReading {
  const previousPd = previous?.pd;
  const currentPd = current?.pd;
  let pd: number | undefined;
  if (previousPd !== undefined && currentPd !== undefined) {
    pd = lerp(previousPd, currentPd, timeline);
  } else {
    pd = currentPd ?? previousPd;
  }

  const recPrevious = previous?.rec;
  const recCurrent = current?.rec;
  let rec: number | undefined;
  if (recPrevious !== undefined && recCurrent !== undefined) {
    rec = lerp(recPrevious, recCurrent, timeline);
  } else {
    rec = recCurrent ?? recPrevious;
  }

  const bop = timeline >= 0.55 ? Boolean(current?.bop) : Boolean(previous?.bop);
  return { pd, rec, bop };
}

function hasWatch(tooth: ToothState | undefined): boolean {
  return Boolean(tooth?.notes.includes("watch"));
}

export function heroToothView(
  current: Exam,
  lastVisit: Exam,
  timeline: number,
  tooth: number = HERO_TOOTH,
): HeroToothView {
  const lastTooth = lastVisit.teeth[tooth];
  const nowTooth = current.teeth[tooth];
  const sites: HeroSiteView[] = SITES.map((site) => {
    const mixed = mixSite(lastTooth?.sites[site], nowTooth?.sites[site], timeline);
    const pd = mixed.pd === undefined ? undefined : Math.round(mixed.pd);
    const rec = mixed.rec === undefined ? undefined : Math.round(mixed.rec);
    const anchor = SITE_ANCHORS[site];
    return {
      site,
      title: siteTitle(site, tooth),
      pd,
      previousPd: lastTooth?.sites[site]?.pd,
      bop: Boolean(mixed.bop),
      rec,
      tone: statusColor(pd),
      x: anchor.x,
      y: anchor.y,
    };
  });

  const callouts: HeroCallout[] = [];
  for (const site of sites) {
    if (site.pd !== undefined && site.pd >= 5) {
      callouts.push({
        id: `${site.site}-pocket`,
        title: patientSitePhrase(site.site, tooth),
        detail: patientPocketMeaning(site.pd) ?? `${site.previousPd ?? site.pd} mm → ${site.pd} mm.`,
        tone: "red",
      });
    } else if (site.pd === 4) {
      callouts.push({
        id: `${site.site}-watch-depth`,
        title: patientSitePhrase(site.site, tooth),
        detail: patientPocketMeaning(4) ?? "4 mm — worth keeping an eye on.",
        tone: "amber",
      });
    }
    if (site.bop) {
      callouts.push({
        id: `${site.site}-bleed`,
        title: patientSitePhrase(site.site, tooth),
        detail: patientMeaning("bleeding_site") ?? "The gum bleeds at this measured spot.",
        tone: "red",
      });
    }
    if (site.rec !== undefined && site.rec > 0) {
      callouts.push({
        id: `${site.site}-rec`,
        title: patientSitePhrase(site.site, tooth),
        detail: patientMeaning("recession") ?? `The gum has pulled back ${site.rec} mm.`,
        tone: "amber",
      });
    }
  }

  const furcation = nowTooth?.furcation ?? lastTooth?.furcation ?? 0;
  if (furcation > 0) {
    callouts.push({
      id: "furcation",
      title: patientMeaning("furcation") ?? "Space between the roots",
      detail: `Furcation class ${furcation}.`,
      tone: furcation >= 2 ? "red" : "amber",
    });
  }

  const mobility = nowTooth?.mobility ?? lastTooth?.mobility ?? 0;
  if (mobility > 0) {
    callouts.push({
      id: "mobility",
      title:
        (mobility === 1
          ? patientMeaning("mobility_1")
          : mobility === 2
            ? patientMeaning("mobility_2")
            : patientMeaning("mobility_3")) ?? "This tooth is a little loose",
      detail: `Mobility ${mobility}.`,
      tone: mobility >= 2 ? "red" : "amber",
    });
  }

  const watching = hasWatch(nowTooth) || hasWatch(lastTooth);
  if (watching) {
    callouts.push({
      id: "watch",
      title: "Watching this spot",
      detail: "Nothing to fix today — we will recheck next visit.",
      tone: "amber",
    });
  }

  const distal = sites.find((site) => site.site === "DB");
  return {
    sites,
    callouts,
    watching,
    mobility,
    furcation,
    distalPd: distal?.pd,
    distalPrevious: distal?.previousPd,
  };
}
