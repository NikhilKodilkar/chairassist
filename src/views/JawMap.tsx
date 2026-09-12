import { displayRestoration, displayToothColor } from "../domain/exam";
import {
  LOWER_ARCH_SRC,
  UPPER_ARCH_SRC,
  lowerArchHotspots,
  upperArchHotspots,
} from "../domain/archHotspots";
import type { ArchHotspot } from "../domain/archHotspots";
import { toothEverydayName, toothFullName } from "../domain/teeth";
import type { Exam } from "../domain/types";
import type { LastMention } from "../store/examStore";
import { RestorationIcon } from "./RestorationIcon";

function ToothHighlight({
  spot,
  exam,
  lastVisit,
  active,
  onSelect,
}: {
  spot: ArchHotspot;
  exam: Exam;
  lastVisit: Exam;
  active: boolean;
  onSelect?: (tooth: number) => void;
}) {
  const { color, fromHistory } = displayToothColor(exam, lastVisit, spot.tooth);
  const restoration = displayRestoration(exam, lastVisit, spot.tooth);
  const classes = ["jaw-hotspot", color];
  if (active) {
    classes.push("focus");
  }
  if (fromHistory) {
    classes.push("history");
  }
  if (restoration) {
    classes.push(restoration);
  }
  const labelExtra =
    restoration === "crown" ? ", crown" : restoration === "filling" ? ", filled cavity" : "";
  return (
    <button
      type="button"
      className={classes.join(" ")}
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        width: `${spot.w + (active ? 2.4 : 0.8)}%`,
        height: `${spot.h + (active ? 2.8 : 1)}%`,
      }}
      title={`${toothFullName(spot.tooth)} (#${spot.tooth})`}
      aria-label={`Tooth ${spot.tooth}, ${toothEverydayName(spot.tooth)}${labelExtra}`}
      onClick={() => onSelect?.(spot.tooth)}
    >
      {restoration ? (
        <span className={`jaw-resto ${restoration}`} aria-hidden="true">
          <RestorationIcon kind={restoration} />
        </span>
      ) : null}
      <span className="jaw-hotspot-num">{spot.tooth}</span>
    </button>
  );
}

function ArchPhoto({
  src,
  label,
  spots,
  exam,
  lastVisit,
  focusTeeth,
  mentionId,
  onSelectTooth,
}: {
  src: string;
  label: string;
  spots: ArchHotspot[];
  exam: Exam;
  lastVisit: Exam;
  focusTeeth: number[];
  mentionId?: number;
  onSelectTooth?: (tooth: number) => void;
}) {
  return (
    <figure className="jaw-arch">
      <div className="jaw-arch-stage">
        <img src={src} alt={label} />
        {spots.map((spot) => {
          const active = focusTeeth.includes(spot.tooth);
          return (
            <ToothHighlight
              key={active ? `${spot.tooth}-${mentionId ?? "focus"}` : spot.tooth}
              spot={spot}
              exam={exam}
              lastVisit={lastVisit}
              active={active}
              onSelect={onSelectTooth}
            />
          );
        })}
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function JawMap({
  exam,
  lastVisit,
  activeTooth,
  focusTeeth,
  lastMention,
  onSelectTooth,
}: {
  exam: Exam;
  lastVisit: Exam;
  activeTooth?: number;
  focusTeeth?: number[];
  lastMention?: LastMention;
  onSelectTooth?: (tooth: number) => void;
}) {
  const lit =
    focusTeeth && focusTeeth.length > 0
      ? focusTeeth
      : lastMention?.teeth && lastMention.teeth.length > 0
        ? lastMention.teeth
        : activeTooth
          ? [activeTooth]
          : [];
  const headline = lit.length > 1
    ? `Looking at #${lit.join(", #")}`
    : lit.length === 1
      ? `Looking at #${lit[0]} · ${toothEverydayName(lit[0])}`
      : "Tap a tooth to see its March story";

  return (
    <section className="jaw-map">
      <div className="arch-legend">
        <span className="arch-swatch grey" /> March history
        <span className="arch-swatch green" /> Healthy
        <span className="arch-swatch amber" /> Watch
        <span className="arch-swatch red" /> Needs care
        <span className="arch-legend-item">
          <RestorationIcon kind="crown" className="arch-icon" />
          Crown
        </span>
        <span className="arch-legend-item">
          <RestorationIcon kind="filling" className="arch-icon" />
          Filled cavity
        </span>
      </div>
      <div className="jaw-arches">
        <ArchPhoto
          src={UPPER_ARCH_SRC}
          label="Upper jaw"
          spots={upperArchHotspots()}
          exam={exam}
          lastVisit={lastVisit}
          focusTeeth={lit}
          mentionId={lastMention?.id}
          onSelectTooth={onSelectTooth}
        />
        <ArchPhoto
          src={LOWER_ARCH_SRC}
          label="Lower jaw"
          spots={lowerArchHotspots()}
          exam={exam}
          lastVisit={lastVisit}
          focusTeeth={lit}
          mentionId={lastMention?.id}
          onSelectTooth={onSelectTooth}
        />
      </div>
      <p className="arch-focus-label">{headline}</p>
    </section>
  );
}
