import { statusColor, toothHasTodayReading } from "../../domain/exam";
import { roleIndex, toothClinicalTitle } from "../../domain/teeth";
import { SITES } from "../../domain/types";
import type { Exam, Site } from "../../domain/types";

const UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const LOWER = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];
const ROLE_LABELS = ["3rd M", "2nd M", "1st M", "2nd P", "1st P", "Canine", "Lateral", "Central"];

function neoRoleLabel(tooth: number): string {
  return ROLE_LABELS[roleIndex(tooth)];
}

function SiteRow({
  exam,
  teeth,
  site,
  activeTooth,
  onSelectTooth,
}: {
  exam: Exam;
  teeth: number[];
  site: Site;
  activeTooth?: number;
  onSelectTooth: (tooth: number) => void;
}) {
  return (
    <tr>
      <th>{site}</th>
      {teeth.map((tooth) => {
        const reading = exam.teeth[tooth]?.sites[site];
        const tone = statusColor(reading?.pd);
        return (
          <td key={`${tooth}-${site}`} className={activeTooth === tooth ? "is-active" : undefined}>
            <button type="button" className={`neo-cell ${tone}`} onClick={() => onSelectTooth(tooth)}>
              {reading?.pd ?? "–"}
              {reading?.bop ? <i className="neo-bop" /> : null}
              {reading?.rec ? <i className="neo-rec" /> : null}
            </button>
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
  activeTooth,
  onSelectTooth,
}: {
  label: string;
  teeth: number[];
  exam: Exam;
  activeTooth?: number;
  onSelectTooth: (tooth: number) => void;
}) {
  return (
    <table className="neo-grid">
      <thead>
        <tr>
          <th>{label}</th>
          {teeth.map((tooth) => {
            const charted = toothHasTodayReading(exam.teeth[tooth]);
            return (
              <th key={tooth} className={activeTooth === tooth ? "is-active" : undefined}>
                <button
                  type="button"
                  className={`neo-tooth-head${charted ? " charted" : ""}`}
                  title={toothClinicalTitle(tooth)}
                  onClick={() => onSelectTooth(tooth)}
                >
                  <span className="neo-tooth-glyph" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M7.2 4.8c0-2.2 2.4-2.8 2.8-1 .5-2 1.9-2.2 2.4-.2.4-2 1.9-1.8 2.4.3.5-1.8 2.8-1.1 2.8 1.1 0 3.2-.9 7.2-5.2 8.6S7.2 15.6 7.2 10.2Z"
                      />
                    </svg>
                  </span>
                  <span>#{tooth}</span>
                  <small>{neoRoleLabel(tooth)}</small>
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {SITES.map((site) => (
          <SiteRow
            key={site}
            exam={exam}
            teeth={teeth}
            site={site}
            activeTooth={activeTooth}
            onSelectTooth={onSelectTooth}
          />
        ))}
      </tbody>
    </table>
  );
}

export function NeoPerioGrid({
  exam,
  activeTooth,
  onSelectTooth,
}: {
  exam: Exam;
  activeTooth?: number;
  onSelectTooth: (tooth: number) => void;
}) {
  return (
    <div className="neo-grids">
      <ArchTable label="Upper" teeth={UPPER} exam={exam} activeTooth={activeTooth} onSelectTooth={onSelectTooth} />
      <ArchTable label="Lower" teeth={LOWER} exam={exam} activeTooth={activeTooth} onSelectTooth={onSelectTooth} />
    </div>
  );
}
