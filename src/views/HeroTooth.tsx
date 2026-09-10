import { useEffect, useRef } from "react";
import { FURCATION_ANCHOR, heroToothView } from "../domain/heroIssues";
import type { Exam } from "../domain/types";

export function HeroTooth({
  current,
  lastVisit,
  timeline,
}: {
  current: Exam;
  lastVisit: Exam;
  timeline: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const molarRef = useRef<HTMLDivElement>(null);
  const mobilityRef = useRef(0);
  const view = heroToothView(current, lastVisit, timeline);
  mobilityRef.current = view.mobility;

  useEffect(() => {
    const stage = stageRef.current;
    const molar = molarRef.current;
    if (!stage || !molar) {
      return;
    }

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      targetX = (event.clientX - box.left) / box.width - 0.5;
      targetY = (event.clientY - box.top) / box.height - 0.5;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const tick = (now: number) => {
      const seconds = now / 1000;
      pointerX += (targetX - pointerX) * 0.08;
      pointerY += (targetY - pointerY) * 0.08;
      const wobble = mobilityRef.current * 3.5;
      const yaw = Math.sin(seconds * 0.32) * 22 + pointerX * 14 + Math.sin(seconds * 6) * wobble;
      const pitch = 10 + Math.sin(seconds * 0.2) * 4 - pointerY * 8;
      const lift = Math.sin(seconds * 0.7) * 8;
      molar.style.transform = `translateY(${lift}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
      frame = requestAnimationFrame(tick);
    };

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="hero-stage" ref={stageRef}>
      <div className="hero-molar" ref={molarRef}>
        <img src="/hero-tooth.png?v=2" alt="Upper left first molar, tooth 14" />
        {view.sites.map((site) => {
          if (site.pd === undefined || site.pd < 4) {
            return null;
          }
          const size = 70 + (site.pd - 3) * 28;
          return (
            <span
              key={`${site.site}-flare`}
              className={`hero-flare ${site.tone}`}
              style={{
                left: `${site.x}%`,
                top: `${site.y}%`,
                width: size,
                height: size,
                opacity: site.bop ? 0.9 : 0.55,
              }}
            />
          );
        })}
        {view.furcation > 0 ? (
          <span
            className={`hero-furcation ${view.furcation >= 2 ? "red" : "amber"}`}
            style={{ left: `${FURCATION_ANCHOR.x}%`, top: `${FURCATION_ANCHOR.y}%` }}
          />
        ) : null}
        {view.sites.map((site) => (
          <span
            key={site.site}
            className={`hero-pin ${site.tone}${site.bop ? " bleed" : ""}${site.rec ? " receded" : ""}`}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
            title={`${site.title}${site.pd !== undefined ? ` ${site.pd} mm` : ""}`}
          >
            {site.pd ?? "·"}
          </span>
        ))}
      </div>
      <aside className="hero-findings">
        <p className="eyebrow">Tooth 14 · upper left molar</p>
        {view.distalPd !== undefined ? (
          <div className="hero-reading-line">
            Distal {view.distalPrevious ?? view.distalPd} mm → {view.distalPd} mm
          </div>
        ) : null}
        {view.callouts.length === 0 ? (
          <p className="hero-finding-empty">No trouble spots on this tooth yet.</p>
        ) : (
          <ul>
            {view.callouts.map((callout) => (
              <li key={callout.id} className={callout.tone}>
                <strong>{callout.title}</strong>
                <span>{callout.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
