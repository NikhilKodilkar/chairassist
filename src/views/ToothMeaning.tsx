import { displayRestoration, toothHasBleeding, toothStatusColor } from "../domain/exam";
import type { ToothRestoration } from "../domain/exam";
import { archHotspot, archImageForTooth } from "../domain/archHotspots";
import { toothEverydayName } from "../domain/teeth";
import { allToothHistories, toothHistory } from "../domain/translator";
import type { ToothHistory } from "../domain/translator";
import type { Exam } from "../domain/types";
import type { LastMention } from "../store/examStore";
import { RestorationIcon } from "./RestorationIcon";

function restorationCopy(kind: ToothRestoration): string {
  if (kind === "crown") {
    return "There's a crown on this one.";
  }
  return "We filled a cavity on this one last time.";
}

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
  return "March history";
}

function HistoryGroup({
  title,
  tone,
  rows,
  onSelectTooth,
}: {
  title: string;
  tone: "amber" | "red" | "crown" | "filling";
  rows: ToothHistory[];
  onSelectTooth?: (tooth: number) => void;
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className={`history-group ${tone}`}>
      <p className="eyebrow">
        {tone === "crown" || tone === "filling" ? (
          <RestorationIcon kind={tone} className="history-icon" />
        ) : null}
        {title} · {rows.length}
      </p>
      <ul className="tooth-history-roster">
        {rows.map((row) => (
          <li key={row.tooth}>
            <button type="button" onClick={() => onSelectTooth?.(row.tooth)}>
              <span className="tooth-history-num">#{row.tooth}</span>
              <span className="tooth-history-name">{toothEverydayName(row.tooth)}</span>
              <span className={`tooth-history-line ${row.trend}`}>
                {tone === "crown" || tone === "filling" ? restorationCopy(tone) : row.headline}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToothMeaning({
  exam,
  lastVisit,
  activeTooth,
  lastMention,
  caption,
  onSelectTooth,
  onShowAll,
}: {
  exam: Exam;
  lastVisit: Exam;
  activeTooth?: number;
  lastMention?: LastMention;
  caption?: string;
  onSelectTooth?: (tooth: number) => void;
  onShowAll?: () => void;
}) {
  const tooth = lastMention?.tooth ?? activeTooth;
  if (!tooth) {
    const roster = allToothHistories(exam, lastVisit);
    const needsCare = roster.filter((row) => toothStatusColor(lastVisit.teeth[row.tooth]) === "red");
    const watch = roster.filter((row) => toothStatusColor(lastVisit.teeth[row.tooth]) === "amber");
    const crowned = roster.filter((row) => displayRestoration(exam, lastVisit, row.tooth) === "crown");
    const filled = roster.filter((row) => displayRestoration(exam, lastVisit, row.tooth) === "filling");
    return (
      <aside className="tooth-meaning">
        <p className="eyebrow">Since March</p>
        <h2>Last visit for {exam.patientName}</h2>
        <p className="tooth-meaning-copy">
          Every tooth has a March reading. Tap one on the jaw, or wait as the hygienist checks it — we’ll say
          whether it moved in the right or wrong direction.
        </p>
        <HistoryGroup
          title="Needs care"
          tone="red"
          rows={needsCare}
          onSelectTooth={onSelectTooth}
        />
        <HistoryGroup
          title="Watch"
          tone="amber"
          rows={watch}
          onSelectTooth={onSelectTooth}
        />
        <HistoryGroup
          title="Crown"
          tone="crown"
          rows={crowned}
          onSelectTooth={onSelectTooth}
        />
        <HistoryGroup
          title="Filled cavities"
          tone="filling"
          rows={filled}
          onSelectTooth={onSelectTooth}
        />
      </aside>
    );
  }

  const hotspot = archHotspot(tooth);
  const src = archImageForTooth(tooth);
  const zoom = 7.2;
  const bleeding = toothHasBleeding(exam.teeth[tooth]);
  const todayColor = toothStatusColor(exam.teeth[tooth]);
  const shownColor = todayColor === "grey" ? toothStatusColor(lastVisit.teeth[tooth]) : todayColor;
  const history = toothHistory(exam, lastVisit, tooth);
  const restoration = displayRestoration(exam, lastVisit, tooth);

  return (
    <aside className="tooth-meaning">
      <p className="eyebrow">
        Tooth #{tooth}
        {onShowAll ? (
          <>
            {" · "}
            <button className="text-link" type="button" onClick={onShowAll}>
              All 32 teeth
            </button>
          </>
        ) : null}
      </p>
      <h2>{toothEverydayName(tooth)}</h2>
      <p className={`tooth-status ${shownColor}`}>{statusWord(shownColor, bleeding)}</p>
      {hotspot ? (
        <div className={`tooth-zoom ${shownColor}${restoration ? ` ${restoration}` : ""}`}>
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
          {restoration ? (
            <span className={`tooth-zoom-mark ${restoration}`} aria-hidden="true">
              <RestorationIcon kind={restoration} />
            </span>
          ) : null}
        </div>
      ) : null}
      {restoration ? (
        <p className={`tooth-resto-copy ${restoration}`}>
          <RestorationIcon kind={restoration} className="resto-inline-icon" />
          {restorationCopy(restoration)}
        </p>
      ) : null}
      <p className={`tooth-meaning-copy ${history.trend}`}>{history.headline}</p>
      {caption && caption !== history.headline ? <p className="tooth-meaning-live">{caption}</p> : null}
      <p className="eyebrow">Since March</p>
      <ul className="tooth-meaning-sites">
        {history.lines.map((line) => (
          <li key={line.site} className={line.tone}>
            {line.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
