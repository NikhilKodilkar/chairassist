import { pdDelta, statusColor } from "../domain/exam";
import { toothFullName, toothHeaderLabel, toothSpeakCue, toothSpeakPhrase } from "../domain/teeth";
import { SITES } from "../domain/types";
import type { Exam, Site } from "../domain/types";

const UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const LOWER = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

function cellClass(pd?: number): string {
  return `cell ${statusColor(pd)}`;
}

function SiteRow({
  exam,
  lastVisit,
  teeth,
  site,
  activeTooth,
}: {
  exam: Exam;
  lastVisit: Exam;
  teeth: number[];
  site: Site;
  activeTooth?: number;
}) {
  return (
    <tr>
      <th>{site}</th>
      {teeth.map((tooth) => {
        const reading = exam.teeth[tooth]?.sites[site];
        const prev = lastVisit.teeth[tooth]?.sites[site];
        const delta = reading && prev ? pdDelta(reading, prev) : undefined;
        return (
          <td key={`${tooth}-${site}`} className={activeTooth === tooth ? "active" : undefined}>
            <div className={cellClass(reading?.pd)}>
              {reading?.pd ?? "·"}
              {reading?.bop ? <span className="bop">•</span> : null}
            </div>
            {delta && delta > 0 ? <div className="low">↑{delta}</div> : null}
          </td>
        );
      })}
    </tr>
  );
}

function ArchTable({
  label,
  teeth,
  exam,
  lastVisit,
  activeTooth,
}: {
  label: string;
  teeth: number[];
  exam: Exam;
  lastVisit: Exam;
  activeTooth?: number;
}) {
  return (
    <table className="perio-grid">
      <thead>
        <tr>
          <th>{label}</th>
          {teeth.map((tooth) => (
            <th
              key={tooth}
              className={activeTooth === tooth ? "active" : undefined}
              title={`${toothFullName(tooth)} · say ${toothSpeakPhrase(tooth)} or ${toothSpeakCue(tooth)}`}
            >
              <div className="tooth-num">#{tooth}</div>
              <div className="tooth-name">{toothHeaderLabel(tooth)}</div>
              <div className="tooth-say">{toothSpeakCue(tooth)}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SITES.map((site) => (
          <SiteRow
            key={site}
            exam={exam}
            lastVisit={lastVisit}
            teeth={teeth}
            site={site}
            activeTooth={activeTooth}
          />
        ))}
      </tbody>
    </table>
  );
}

export function PerioGrid({
  exam,
  lastVisit,
  activeTooth,
}: {
  exam: Exam;
  lastVisit: Exam;
  activeTooth?: number;
}) {
  return (
    <div className="grid-wrap">
      <ArchTable label="Upper" teeth={UPPER} exam={exam} lastVisit={lastVisit} activeTooth={activeTooth} />
      <ArchTable label="Lower" teeth={LOWER} exam={exam} lastVisit={lastVisit} activeTooth={activeTooth} />
    </div>
  );
}
