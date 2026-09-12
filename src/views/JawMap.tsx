import { toothStatusColor } from "../domain/exam";
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

function ToothHighlight({
  spot,
  exam,
  active,
}: {
  spot: ArchHotspot;
  exam: Exam;
  active: boolean;
}) {
  const color = toothStatusColor(exam.teeth[spot.tooth]);
  const classes = ["jaw-hotspot", color];
  if (active) {
    classes.push("focus");
  }
  return (
    <span
      className={classes.join(" ")}
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        width: `${spot.w + (active ? 2.4 : 0.8)}%`,
        height: `${spot.h + (active ? 2.8 : 1)}%`,
      }}
      title={`${toothFullName(spot.tooth)} (#${spot.tooth})`}
    >
      {active ? <span className="jaw-hotspot-num">{spot.tooth}</span> : null}
    </span>
  );
}

function ArchPhoto({
  src,
  label,
  spots,
  exam,
  focusTeeth,
  mentionId,
}: {
  src: string;
  label: string;
  spots: ArchHotspot[];
  exam: Exam;
  focusTeeth: number[];
  mentionId?: number;
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
              active={active}
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
  activeTooth,
  focusTeeth,
  lastMention,
}: {
  exam: Exam;
  activeTooth?: number;
  focusTeeth?: number[];
  lastMention?: LastMention;
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
      : "Teeth light up as they are checked";

  return (
    <section className="jaw-map">
      <div className="arch-legend">
        <span className="arch-swatch grey" /> Not checked
        <span className="arch-swatch green" /> Healthy
        <span className="arch-swatch amber" /> Watch
        <span className="arch-swatch red" /> Needs care
      </div>
      <div className="jaw-arches">
        <ArchPhoto
          src={UPPER_ARCH_SRC}
          label="Upper jaw"
          spots={upperArchHotspots()}
          exam={exam}
          focusTeeth={lit}
          mentionId={lastMention?.id}
        />
        <ArchPhoto
          src={LOWER_ARCH_SRC}
          label="Lower jaw"
          spots={lowerArchHotspots()}
          exam={exam}
          focusTeeth={lit}
          mentionId={lastMention?.id}
        />
      </div>
      <p className="arch-focus-label">{headline}</p>
    </section>
  );
}
