import { archHotspot, archImageForTooth } from "../domain/archHotspots";
import { statusColor, toothHasBleeding, toothStatusColor } from "../domain/exam";
import { patientSitePhrase } from "../domain/lexicon";
import { toothEverydayName } from "../domain/teeth";
import { SITES } from "../domain/types";
import type { Exam, Site } from "../domain/types";
import type { LastMention } from "../store/examStore";

function statusWord(color: "grey" | "green" | "amber" | "red", bleeding: boolean): string {
  if (bleeding) {
    return "Bleeding — needs extra care";
  }
  if (color === "green") {
    return "Looks healthy";
  }
  if (color === "amber") {
    return "Worth watching";
  }
  if (color === "red") {
    return "Needs extra care";
  }
  return "Not checked yet";
}

function siteLine(exam: Exam, tooth: number, site: Site): { id: string; text: string; tone: string } | undefined {
  const reading = exam.teeth[tooth]?.sites[site];
  if (!reading || reading.pd === undefined) {
    return undefined;
  }
  const tone = reading.bop ? "red" : statusColor(reading.pd);
  const place = patientSitePhrase(site, tooth, false);
  const bleed = reading.bop ? " · bleeding" : "";
  return {
    id: site,
    text: `${place}: ${reading.pd} mm${bleed}`,
    tone,
  };
}

export function ToothMeaning({
  exam,
  activeTooth,
  lastMention,
  caption,
}: {
  exam: Exam;
  activeTooth?: number;
  lastMention?: LastMention;
  caption?: string;
}) {
  const tooth = lastMention?.tooth ?? activeTooth;
  if (!tooth) {
    return (
      <aside className="tooth-meaning">
        <p className="eyebrow">What this means</p>
        <h2>Waiting for the next tooth</h2>
        <p className="tooth-meaning-copy">
          As the hygienist checks each tooth, it will light up on the left and we will explain it here in plain language.
        </p>
      </aside>
    );
  }

  const hotspot = archHotspot(tooth);
  const src = archImageForTooth(tooth);
  const zoom = 7.2;
  const bleeding = toothHasBleeding(exam.teeth[tooth]);
  const color = toothStatusColor(exam.teeth[tooth]);
  const lines = SITES.map((site) => siteLine(exam, tooth, site)).filter(
    (line): line is { id: string; text: string; tone: string } => Boolean(line),
  );

  return (
    <aside className="tooth-meaning">
      <p className="eyebrow">Tooth #{tooth}</p>
      <h2>{toothEverydayName(tooth)}</h2>
      <p className={`tooth-status ${color}`}>{statusWord(color, bleeding)}</p>
      {hotspot ? (
        <div className={`tooth-zoom ${color}`}>
          <img
            src={src}
            alt={toothEverydayName(tooth)}
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              left: `${50 - hotspot.x * zoom}%`,
              top: `${50 - hotspot.y * zoom}%`,
            }}
          />
        </div>
      ) : null}
      <p className="tooth-meaning-copy">
        {caption ?? "This tooth is on the chart now. Measurements will appear as they are called out."}
      </p>
      {lines.length > 0 ? (
        <ul className="tooth-meaning-sites">
          {lines.map((line) => (
            <li key={line.id} className={line.tone}>
              {line.text}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
