import { statusColor, worstPd } from "../domain/exam";
import { HERO_TOOTH } from "../domain/types";
import type { Exam } from "../domain/types";

const UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const LOWER = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

function Row({ teeth, exam, lower }: { teeth: number[]; exam: Exam; lower?: boolean }) {
  return (
    <div className="arch">
      {teeth.map((tooth) => {
        const color = statusColor(worstPd(exam.teeth[tooth]));
        const classes = ["arch-tooth", color];
        if (lower) {
          classes.push("lower");
        }
        if (tooth === HERO_TOOTH) {
          classes.push("hero");
        }
        return <div key={tooth} className={classes.join(" ")} title={`Tooth ${tooth}`} />;
      })}
    </div>
  );
}

export function ArchStrip({ exam }: { exam: Exam }) {
  return (
    <div>
      <Row teeth={UPPER} exam={exam} />
      <div className="arch" style={{ bottom: "4%" }}>
        {LOWER.map((tooth) => {
          const color = statusColor(worstPd(exam.teeth[tooth]));
          const classes = ["arch-tooth", "lower", color];
          return <div key={tooth} className={classes.join(" ")} title={`Tooth ${tooth}`} />;
        })}
      </div>
    </div>
  );
}
