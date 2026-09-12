import { toothStatusColor } from "../domain/exam";
import { toothFullName, toothHeaderLabel } from "../domain/teeth";
import type { Exam } from "../domain/types";

const UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const LOWER = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

function ToothMark({
  tooth,
  exam,
  lower,
  active,
}: {
  tooth: number;
  exam: Exam;
  lower?: boolean;
  active: boolean;
}) {
  const color = toothStatusColor(exam.teeth[tooth]);
  const classes = ["arch-tooth", color];
  if (lower) {
    classes.push("lower");
  }
  if (active) {
    classes.push("focus");
  }
  return (
    <div className={classes.join(" ")} title={`${toothFullName(tooth)} (#${tooth})`}>
      <span className="arch-num">{tooth}</span>
    </div>
  );
}

export function ArchStrip({ exam, activeTooth }: { exam: Exam; activeTooth?: number }) {
  return (
    <div className="arch-wrap">
      <div className="arch-legend">
        <span className="arch-swatch grey" /> Not checked
        <span className="arch-swatch green" /> Healthy
        <span className="arch-swatch amber" /> Watch
        <span className="arch-swatch red" /> Needs care
      </div>
      <div className="arch-rows">
        <div className="arch-row">
          {UPPER.map((tooth) => (
            <ToothMark key={tooth} tooth={tooth} exam={exam} active={activeTooth === tooth} />
          ))}
        </div>
        <p className="arch-focus-label">
          {activeTooth
            ? `Looking at #${activeTooth} · ${toothHeaderLabel(activeTooth)}`
            : "Teeth light up as they are checked"}
        </p>
        <div className="arch-row">
          {LOWER.map((tooth) => (
            <ToothMark key={tooth} tooth={tooth} exam={exam} lower active={activeTooth === tooth} />
          ))}
        </div>
      </div>
    </div>
  );
}
