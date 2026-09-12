import { displayRestoration, statusColor, toothHasBleeding } from "../../domain/exam";
import { patientSitePhrase } from "../../domain/lexicon";
import { toothClinicalTitle } from "../../domain/teeth";
import { toothHistory } from "../../domain/translator";
import { SITES } from "../../domain/types";
import type { Exam, Site, ToothState } from "../../domain/types";

const PIN: Record<Site, { x: number; y: number }> = {
  MB: { x: 34, y: 28 },
  B: { x: 22, y: 50 },
  DB: { x: 34, y: 72 },
  ML: { x: 66, y: 28 },
  L: { x: 78, y: 50 },
  DL: { x: 66, y: 72 },
};

const LABEL: Record<Site, { x: number; y: number; side: "left" | "right" }> = {
  MB: { x: 2, y: 6, side: "left" },
  B: { x: 2, y: 42, side: "left" },
  DB: { x: 2, y: 78, side: "left" },
  ML: { x: 70, y: 6, side: "right" },
  L: { x: 70, y: 42, side: "right" },
  DL: { x: 70, y: 78, side: "right" },
};

function Finding({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <li>
      <span className="neo-find-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </li>
  );
}

function pocketSummary(state?: ToothState): string {
  if (!state) {
    return "Not charted yet";
  }
  const parts = SITES.filter((site) => state.sites[site]?.pd !== undefined).map(
    (site) => `${site} ${state.sites[site].pd} mm`,
  );
  return parts.length > 0 ? parts.join(", ") : "Not charted yet";
}

function bleedingSummary(state?: ToothState): string {
  if (!state || !toothHasBleeding(state)) {
    return "No";
  }
  const sites = SITES.filter((site) => state.sites[site]?.bop).join(", ");
  return sites ? `Yes (${sites})` : "Yes";
}

function recessionSummary(state?: ToothState): string {
  if (!state) {
    return "Not noted";
  }
  const parts = SITES.filter((site) => state.sites[site]?.rec !== undefined).map(
    (site) => `${site} ${state.sites[site].rec} mm`,
  );
  return parts.length > 0 ? parts.join(", ") : "Not noted";
}

function calculusSummary(state?: ToothState): string {
  if (!state || state.notes.length === 0) {
    return "Not noted";
  }
  const hit = state.notes.find((note) => note.toLowerCase().includes("calculus"));
  return hit ?? "Not noted";
}

export function NeoToothPanel({
  exam,
  lastVisit,
  tooth,
  caption,
  onSelectTooth,
}: {
  exam: Exam;
  lastVisit: Exam;
  tooth?: number;
  caption?: string;
  onSelectTooth: (tooth: number) => void;
}) {
  if (!tooth) {
    return (
      <aside className="neo-tooth-panel">
        <p className="neo-muted">Select a tooth or speak a number to see its diagram and findings.</p>
      </aside>
    );
  }

  const state = exam.teeth[tooth];
  const history = toothHistory(exam, lastVisit, tooth);
  const restoration = displayRestoration(exam, lastVisit, tooth);
  const prev = tooth === 1 ? 32 : tooth - 1;
  const next = tooth === 32 ? 1 : tooth + 1;
  const explanation = caption && caption.length > 0 ? caption : history.headline;

  return (
    <aside className="neo-tooth-panel">
      <header className="neo-tooth-head-row">
        <div>
          <p className="neo-kicker">Tooth #{tooth}</p>
          <h2>{toothClinicalTitle(tooth)}</h2>
        </div>
        <div className="neo-view-toggle">
          <span>3D View</span>
          <span className="on">Diagram</span>
        </div>
      </header>

      <div className="neo-diagram">
        <svg viewBox="0 0 100 100" className="neo-molar">
          <ellipse cx="50" cy="52" rx="34" ry="36" fill="#f3d4c8" />
          <ellipse cx="50" cy="50" rx="27" ry="29" fill="#fff7f0" stroke="#e8d2c4" strokeWidth="1" />
          <path
            d="M36 38c3-9 25-9 28 0 3 8 3 16 0 24-3 9-25 9-28 0-3-8-3-16 0-24Z"
            fill="#fff"
            stroke="#ead9cd"
            strokeWidth="0.8"
          />
          <path d="M38 42c4-6 8-7 12-1 4-6 8-5 12 1" fill="#f6ebe3" />
          <path d="M38 58c4 6 8 7 12 1 4 6 8 5 12-1" fill="#f6ebe3" />
          <path d="M42 50h16M50 40v20" stroke="#e4d0c3" strokeWidth="1.1" strokeLinecap="round" />
          {SITES.map((site) => {
            const reading = state?.sites[site];
            const pos = PIN[site];
            return (
              <circle
                key={site}
                cx={pos.x}
                cy={pos.y}
                r="2.6"
                className={`neo-pin ${statusColor(reading?.pd)}${reading?.bop ? " bleed" : ""}`}
              />
            );
          })}
        </svg>
        {SITES.map((site) => {
          const reading = state?.sites[site];
          const pos = LABEL[site];
          return (
            <div
              key={site}
              className={`neo-pin-label ${pos.side} ${statusColor(reading?.pd)}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <small>{site}</small>
              <strong>
                {reading?.pd !== undefined ? `${reading.pd} mm` : "–"}
                {reading?.bop ? " · BOP" : ""}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="neo-split">
        <section>
          <h3>Findings for tooth #{tooth}</h3>
          <ul className="neo-findings">
            <Finding icon="●" label="Pocket depth" value={pocketSummary(state)} />
            <Finding icon="💧" label="Bleeding on probing" value={bleedingSummary(state)} />
            <Finding icon="◇" label="Calculus" value={calculusSummary(state)} />
            <Finding icon="△" label="Recession" value={recessionSummary(state)} />
            <Finding
              icon="△"
              label="Mobility"
              value={state?.mobility !== undefined ? String(state.mobility) : "Not noted"}
            />
            <Finding
              icon="○"
              label="Furcation"
              value={state?.furcation !== undefined ? String(state.furcation) : "Not noted"}
            />
            <Finding
              icon="○"
              label="Restorations"
              value={
                restoration === "crown" ? "Crown" : restoration === "filling" ? "Filled cavity" : "None noted"
              }
            />
          </ul>
        </section>
        <section className="neo-explain">
          <h3>Patient-friendly explanation</h3>
          <p>{explanation}</p>
          {history.lines.length > 0 ? (
            <ul className="neo-explain-sites">
              {history.lines.map((line) => (
                <li key={line.site}>
                  {patientSitePhrase(line.site, tooth, false)} · {line.prev ?? "–"} → {line.now ?? "–"} mm
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <div className="neo-tooth-nav">
        <button type="button" onClick={() => onSelectTooth(prev)}>
          ← Tooth #{prev}
        </button>
        <button type="button" onClick={() => onSelectTooth(next)}>
          Tooth #{next} →
        </button>
      </div>
    </aside>
  );
}
