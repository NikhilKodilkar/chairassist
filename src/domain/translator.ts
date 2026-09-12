import { patientMeaning, patientPocketMeaning, patientSitePhrase } from "./lexicon";
import { toothEverydayName } from "./teeth";
import { SITES } from "./types";
import type { ChartEvent, Exam, Site } from "./types";

const TEMPLATES = {
  healthy: "This one looks healthy — the gum is snug against the tooth.",
  warning: "This spot is a little deeper than we'd like. Worth keeping an eye on.",
  problem: "This spot has gotten deeper — a sign the gum is pulling away here.",
  worse: "In March this was {prev} mm. Today it's {now} mm — it's moved in the wrong direction.",
  better: "Good news — this spot improved since your last visit. Whatever you're doing, keep doing it.",
  bop: "The bleeding here means the gum is inflamed — it's the gum's way of asking for help.",
  watch: "Nothing to fix today — we're just going to watch this spot.",
};

function previousPd(lastVisit: Exam, tooth: number, site: Site): number | undefined {
  return lastVisit.teeth[tooth]?.sites[site]?.pd;
}

export function captionForEvent(event: ChartEvent, lastVisit: Exam): string | undefined {
  if (event.confidence === "low") {
    return undefined;
  }

  if (event.kind === "flag") {
    return patientMeaning("watch_area") ?? TEMPLATES.watch;
  }

  if (event.kind === "navigation" && event.tooth) {
    return `Now looking at your ${toothEverydayName(event.tooth)}.`;
  }

  if (event.kind === "reset_tooth" && event.tooth) {
    return `Starting over on your ${toothEverydayName(event.tooth)}.`;
  }

  if (event.kind !== "reading" || !event.tooth) {
    return undefined;
  }

  if (event.bopSites && event.bopSites.length > 0 && !event.readings) {
    return TEMPLATES.bop;
  }

  const site = event.sites?.[0];
  const now = event.readings?.[event.readings.length - 1];
  if (now === undefined || !site) {
    if (event.bopSites && event.bopSites.length > 0) {
      return TEMPLATES.bop;
    }
    return undefined;
  }

  const place = patientSitePhrase(site, event.tooth);
  const depth = patientPocketMeaning(now);
  const prev = previousPd(lastVisit, event.tooth, site);
  if (prev !== undefined && now > prev) {
    return `${place}. ${TEMPLATES.worse.replace("{prev}", String(prev)).replace("{now}", String(now))}`;
  }
  if (prev !== undefined && now < prev) {
    return `${place}. ${TEMPLATES.better}`;
  }
  if (event.bopSites && event.bopSites.length > 0 && now >= 4) {
    return `${place}. ${patientMeaning("bleeding_site") ?? TEMPLATES.bop}`;
  }
  if (now >= 5) {
    return `${place}. ${depth ?? TEMPLATES.problem}`;
  }
  if (now === 4) {
    return `${place}. ${depth ?? TEMPLATES.warning}`;
  }
  return `${place}. ${depth ?? TEMPLATES.healthy}`;
}

export function summarySentences(current: Exam, lastVisit: Exam): string[] {
  const trouble: string[] = [];
  for (let tooth = 1; tooth <= 32; tooth += 1) {
    const nowTooth = current.teeth[tooth];
    if (!nowTooth) {
      continue;
    }
    for (const site of SITES) {
      const pd = nowTooth.sites[site].pd;
      const prev = lastVisit.teeth[tooth]?.sites[site]?.pd;
      if (pd !== undefined && (pd >= 4 || (prev !== undefined && pd > prev))) {
        const label = `tooth ${tooth}`;
        if (!trouble.includes(label)) {
          trouble.push(label);
        }
      }
    }
  }

  const spots =
    trouble.length === 0
      ? "Most spots look calm today."
      : `The spots that need attention are ${trouble.slice(0, 2).join(" and ")}.`;

  return [
    `${current.patientName}, we finished today's gum check.`,
    spots,
    trouble.length > 0
      ? "A little extra time with the brush and floss around those spots will help."
      : "Keep doing what you are doing at home — it is working.",
    "We will look at these same spots again at your next visit.",
  ];
}
