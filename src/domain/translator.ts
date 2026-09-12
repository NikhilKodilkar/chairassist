import { statusColor, worstPd } from "./exam";
import { patientMeaning, patientPocketMeaning, patientSitePhrase } from "./lexicon";
import { toothEverydayName } from "./teeth";
import { SITES } from "./types";
import type { ChartEvent, Exam, Site } from "./types";

const TEMPLATES = {
  healthy: "This one looks healthy — the gum is snug against the tooth.",
  warning: "This spot is a little deeper than we'd like. Worth keeping an eye on.",
  problem: "This spot has gotten deeper — a sign the gum is pulling away here.",
  bop: "The bleeding here means the gum is inflamed — it's the gum's way of asking for help.",
  watch: "Nothing to fix today — we're just going to watch this spot.",
};

export type HistoryTrend = "worse" | "better" | "same" | "pending";

export interface ToothHistoryLine {
  site: Site;
  place: string;
  prev?: number;
  now?: number;
  trend: HistoryTrend;
  text: string;
  tone: string;
}

export interface ToothHistory {
  tooth: number;
  headline: string;
  trend: HistoryTrend;
  lines: ToothHistoryLine[];
}

function previousPd(lastVisit: Exam, tooth: number, site: Site): number | undefined {
  return lastVisit.teeth[tooth]?.sites[site]?.pd;
}

export function compareTrend(prev: number | undefined, now: number | undefined): HistoryTrend {
  if (now === undefined) {
    return "pending";
  }
  if (prev === undefined) {
    return "same";
  }
  if (now > prev) {
    return "worse";
  }
  if (now < prev) {
    return "better";
  }
  return "same";
}

export function marchCompareSentence(prev: number, now: number): string {
  if (now > prev) {
    return `In March this was ${prev} mm. Today it's ${now} mm — it's moved in the wrong direction.`;
  }
  if (now < prev) {
    return `In March this was ${prev} mm. Today it's ${now} mm — it's moved in the right direction.`;
  }
  return `In March this was ${prev} mm. Today it's still ${now} mm.`;
}

function trendRank(trend: HistoryTrend): number {
  if (trend === "worse") {
    return 3;
  }
  if (trend === "better") {
    return 2;
  }
  if (trend === "same") {
    return 1;
  }
  return 0;
}

function pickLeadLine(lines: ToothHistoryLine[]): ToothHistoryLine | undefined {
  let lead = lines[0];
  for (const line of lines) {
    if (!lead) {
      lead = line;
      continue;
    }
    const rank = trendRank(line.trend) - trendRank(lead.trend);
    if (rank > 0) {
      lead = line;
      continue;
    }
    if (rank === 0 && line.trend === "worse") {
      const lineJump = (line.now ?? 0) - (line.prev ?? 0);
      const leadJump = (lead.now ?? 0) - (lead.prev ?? 0);
      if (lineJump > leadJump) {
        lead = line;
      }
    }
  }
  return lead;
}

function siteTone(now: number | undefined, prev: number | undefined, bleeding: boolean): string {
  if (bleeding) {
    return "red";
  }
  if (now !== undefined) {
    return statusColor(now);
  }
  if (prev !== undefined) {
    return statusColor(prev);
  }
  return "grey";
}

export function toothHistory(current: Exam, lastVisit: Exam, tooth: number): ToothHistory {
  const nowTooth = current.teeth[tooth];
  const prevTooth = lastVisit.teeth[tooth];
  const lines: ToothHistoryLine[] = [];

  for (const site of SITES) {
    const now = nowTooth?.sites[site]?.pd;
    const prev = prevTooth?.sites[site]?.pd;
    if (now === undefined && prev === undefined) {
      continue;
    }
    const trend = compareTrend(prev, now);
    const place = patientSitePhrase(site, tooth, false);
    const bleeding = nowTooth?.sites[site]?.bop === true;
    let text = "";
    if (now !== undefined && prev !== undefined) {
      text = `${place}: ${marchCompareSentence(prev, now)}`;
    } else if (prev !== undefined) {
      text = `${place}: In March this was ${prev} mm.`;
    } else if (now !== undefined) {
      text = `${place}: Today it's ${now} mm.`;
    }
    if (bleeding) {
      text = `${text} Bleeding today.`;
    }
    lines.push({
      site,
      place,
      prev,
      now,
      trend,
      text,
      tone: siteTone(now, prev, bleeding),
    });
  }

  const lead = pickLeadLine(lines);
  const marchWorst = prevTooth ? worstPd(prevTooth) : undefined;
  let headline = `In March we measured all six sides of your ${toothEverydayName(tooth)}.`;
  let trend: HistoryTrend = "pending";

  if (lead && lead.prev !== undefined && lead.now !== undefined) {
    headline = `${lead.place}. ${marchCompareSentence(lead.prev, lead.now)}`;
    trend = lead.trend;
  } else if (marchWorst !== undefined) {
    headline = `In March the deepest spot here was ${marchWorst} mm. We'll compare as soon as it's measured today.`;
  }

  return { tooth, headline, trend, lines };
}

export function allToothHistories(current: Exam, lastVisit: Exam): ToothHistory[] {
  const rows: ToothHistory[] = [];
  for (let tooth = 1; tooth <= 32; tooth += 1) {
    rows.push(toothHistory(current, lastVisit, tooth));
  }
  return rows;
}

export function captionForEvent(event: ChartEvent, lastVisit: Exam): string | undefined {
  if (event.confidence === "low") {
    return undefined;
  }

  if (event.kind === "flag") {
    return patientMeaning("watch_area") ?? TEMPLATES.watch;
  }

  if (event.kind === "navigation" && event.tooth) {
    const marchWorst = worstPd(lastVisit.teeth[event.tooth]);
    const march =
      marchWorst !== undefined ? ` In March the deepest spot here was ${marchWorst} mm.` : "";
    return `Now looking at your ${toothEverydayName(event.tooth)}.${march}`;
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

  const sites = event.sites ?? [];
  const readings = event.readings ?? [];
  if (readings.length === 0 || sites.length === 0) {
    if (event.bopSites && event.bopSites.length > 0) {
      return TEMPLATES.bop;
    }
    return undefined;
  }

  const compared: ToothHistoryLine[] = [];
  sites.forEach((site, index) => {
    const now = readings[index] ?? readings[readings.length - 1];
    if (now === undefined) {
      return;
    }
    const prev = previousPd(lastVisit, event.tooth!, site);
    const trend = compareTrend(prev, now);
    compared.push({
      site,
      place: patientSitePhrase(site, event.tooth!, false),
      prev,
      now,
      trend,
      text: prev !== undefined ? marchCompareSentence(prev, now) : "",
      tone: siteTone(now, prev, Boolean(event.bopSites?.includes(site))),
    });
  });

  const lead = pickLeadLine(compared);
  if (lead && lead.prev !== undefined && lead.now !== undefined) {
    const bleed =
      event.bopSites && event.bopSites.length > 0 ? ` ${patientMeaning("bleeding_site") ?? TEMPLATES.bop}` : "";
    return `${patientSitePhrase(lead.site, event.tooth)}. ${marchCompareSentence(lead.prev, lead.now)}${bleed}`;
  }

  const site = sites[0];
  const now = readings[readings.length - 1];
  if (now === undefined || !site) {
    return undefined;
  }
  const place = patientSitePhrase(site, event.tooth);
  const depth = patientPocketMeaning(now);
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
  const rows = allToothHistories(current, lastVisit);
  const worse = rows.filter((row) => row.trend === "worse");
  const better = rows.filter((row) => row.trend === "better");
  const sentences = [`${current.patientName}, we finished today's gum check.`];

  if (worse.length > 0) {
    const labels = worse.slice(0, 3).map((row) => `tooth ${row.tooth}`);
    sentences.push(`These spots moved in the wrong direction since March: ${labels.join(", ")}.`);
  }
  if (better.length > 0) {
    const labels = better.slice(0, 3).map((row) => `tooth ${row.tooth}`);
    sentences.push(`These spots improved since March: ${labels.join(", ")}.`);
  }
  if (worse.length === 0 && better.length === 0) {
    sentences.push("Most spots are holding where they were in March.");
  }
  sentences.push(
    worse.length > 0
      ? "A little extra time with the brush and floss around those spots will help."
      : "Keep doing what you are doing at home — it is working.",
  );
  sentences.push("We will look at these same spots again at your next visit.");
  return sentences;
}
