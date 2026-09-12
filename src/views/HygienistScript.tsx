import { useEffect, useRef, useState } from "react";
import { HYGIENIST_CLEANING } from "../rehearsal/hygienistCleaning";
import { JUDGE_LINES } from "../rehearsal/judgeLines";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function HygienistScript({
  onUtterance,
  onNarration,
  onReset,
}: {
  onUtterance: (raw: string) => void;
  onNarration: (text: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const activeRef = useRef<HTMLLIElement | null>(null);
  const onUtteranceRef = useRef(onUtterance);
  const onNarrationRef = useRef(onNarration);
  onUtteranceRef.current = onUtterance;
  onNarrationRef.current = onNarration;

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [beatIndex]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    let cancelled = false;
    const beat = HYGIENIST_CLEANING[beatIndex];
    if (!beat) {
      setPlaying(false);
      return;
    }

    const run = async () => {
      onNarrationRef.current(beat.said);
      for (const utterance of beat.utterances) {
        await wait(320);
        if (cancelled) {
          return;
        }
        onUtteranceRef.current(utterance);
      }
      const pause = beat.utterances.length === 0 ? 2400 : 1700;
      await wait(pause);
      if (cancelled) {
        return;
      }
      setBeatIndex((current) => current + 1);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [playing, beatIndex]);

  const play = () => {
    if (beatIndex >= HYGIENIST_CLEANING.length) {
      onReset();
      setBeatIndex(0);
    } else if (beatIndex === 0) {
      onReset();
    }
    setPlaying(true);
  };

  const reset = () => {
    setPlaying(false);
    setBeatIndex(0);
    onReset();
  };

  const next = async () => {
    setPlaying(false);
    const beat = HYGIENIST_CLEANING[beatIndex];
    if (!beat) {
      return;
    }
    onNarration(beat.said);
    for (const utterance of beat.utterances) {
      onUtterance(utterance);
    }
    setBeatIndex((current) => current + 1);
  };

  const current = HYGIENIST_CLEANING[Math.min(beatIndex, HYGIENIST_CLEANING.length - 1)];
  const done = beatIndex >= HYGIENIST_CLEANING.length;

  return (
    <section className={open ? "script-panel" : "script-panel collapsed"}>
      <div className="script-head">
        <button type="button" className="script-toggle" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide script" : "Show script"}
        </button>
        <strong>Cleaning visit — what she says</strong>
        <span className="hint">
          {done ? "Done" : `Line ${beatIndex + 1} of ${HYGIENIST_CLEANING.length}`}
        </span>
        <div className="controls">
          {playing ? (
            <button type="button" onClick={() => setPlaying(false)}>
              Pause
            </button>
          ) : (
            <button className="primary" type="button" onClick={play}>
              Play
            </button>
          )}
          <button type="button" onClick={() => void next()} disabled={done}>
            Next line
          </button>
          <button type="button" onClick={reset}>
            Reset chart
          </button>
        </div>
      </div>

      {open ? (
        <>
          <p className="script-now">{done ? "Exam complete." : current?.said}</p>
          <div className="judge-lines">
            <span className="hint">Speak-test lines</span>
            {JUDGE_LINES.map((line) => (
              <button key={line.label} type="button" onClick={() => onUtterance(line.said)}>
                {line.label}
              </button>
            ))}
          </div>
          <ol className="script-list">
            {HYGIENIST_CLEANING.map((beat, index) => (
              <li
                key={beat.said}
                ref={index === beatIndex ? activeRef : undefined}
                className={index === beatIndex && !done ? "active" : index < beatIndex ? "done" : undefined}
              >
                <span className="script-index">{index + 1}</span>
                <span>{beat.said}</span>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
}
