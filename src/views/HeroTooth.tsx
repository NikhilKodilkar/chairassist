import { useEffect, useRef, useState } from "react";
import { FURCATION_ANCHOR, heroToothView, SITE_ANCHORS } from "../domain/heroIssues";
import { toothFocusPose, toothFullName, toothHeaderLabel } from "../domain/teeth";
import { HERO_TOOTH } from "../domain/types";
import type { Exam, Site } from "../domain/types";
import type { LastMention } from "../store/examStore";

function mentionYaw(sites: Site[]): number {
  if (sites.length === 0) {
    return 0;
  }
  let total = 0;
  for (const site of sites) {
    if (site === "DB" || site === "DL") {
      total += 16;
    } else if (site === "MB" || site === "ML") {
      total -= 16;
    }
  }
  return total / sites.length;
}

function siteIsMentioned(mention: LastMention | undefined, site: Site): boolean {
  if (!mention) {
    return false;
  }
  if (mention.sites.includes(site)) {
    return true;
  }
  return Boolean(mention.bopSites?.includes(site));
}

function issueCaption(mention: LastMention, site: Site, pd?: number, previousPd?: number): string {
  if (mention.bopSites?.includes(site)) {
    return pd ? `${pd} mm · bleeding` : "Bleeding";
  }
  if (pd !== undefined && previousPd !== undefined && pd !== previousPd) {
    return `${previousPd} mm → ${pd} mm`;
  }
  if (pd !== undefined && pd >= 5) {
    return `${pd} mm`;
  }
  if (pd === 4) {
    return "4 mm · watch";
  }
  if (pd !== undefined) {
    return `${pd} mm`;
  }
  if (mention.note === "watch") {
    return "Watch";
  }
  return "";
}

export function HeroTooth({
  current,
  lastVisit,
  timeline,
  activeTooth,
  lastMention,
}: {
  current: Exam;
  lastVisit: Exam;
  timeline: number;
  activeTooth?: number;
  lastMention?: LastMention;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const molarRef = useRef<HTMLDivElement>(null);
  const mobilityRef = useRef(0);
  const poseRef = useRef(toothFocusPose(activeTooth));
  const [issueTime, setIssueTime] = useState(1);
  const tooth = lastMention?.tooth ?? activeTooth ?? HERO_TOOTH;
  const view = heroToothView(current, lastVisit, lastMention ? issueTime : timeline, tooth);
  mobilityRef.current = view.mobility;
  const basePose = toothFocusPose(lastMention?.tooth ?? activeTooth);
  poseRef.current = {
    x: basePose.x,
    y: basePose.y,
    yaw: basePose.yaw + mentionYaw(lastMention?.sites ?? []),
  };

  useEffect(() => {
    if (!lastMention) {
      setIssueTime(1);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, (now - started) / 1200);
      setIssueTime(next);
      if (next < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    setIssueTime(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [lastMention?.id]);

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
    let slideX = poseRef.current.x;
    let slideY = poseRef.current.y;
    let slideYaw = poseRef.current.yaw;

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
      const pose = poseRef.current;
      slideX += (pose.x - slideX) * 0.08;
      slideY += (pose.y - slideY) * 0.08;
      slideYaw += (pose.yaw - slideYaw) * 0.08;
      pointerX += (targetX - pointerX) * 0.08;
      pointerY += (targetY - pointerY) * 0.08;
      const wobble = mobilityRef.current * 3.5;
      const yaw = slideYaw + Math.sin(seconds * 0.32) * 8 + pointerX * 14 + Math.sin(seconds * 6) * wobble;
      const pitch = 10 + Math.sin(seconds * 0.2) * 4 - pointerY * 8;
      const lift = Math.sin(seconds * 0.7) * 8 + slideY;
      molar.style.transform = `translate(${slideX}px, ${lift}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
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

  const mentionedSites = lastMention?.sites.length
    ? lastMention.sites
    : lastMention?.bopSites ?? [];

  return (
    <div className="hero-stage" ref={stageRef}>
      <div className="hero-molar" ref={molarRef}>
        <img src="/hero-tooth.png?v=2" alt={toothFullName(tooth)} />
        {activeTooth
          ? view.sites.map((site) => {
              if (site.pd === undefined || site.pd < 4) {
                return null;
              }
              const size = 70 + (site.pd - 3) * 28;
              const mentioned = siteIsMentioned(lastMention, site.site);
              return (
                <span
                  key={`${site.site}-flare`}
                  className={`hero-flare ${site.tone}${mentioned ? " live" : ""}`}
                  style={{
                    left: `${site.x}%`,
                    top: `${site.y}%`,
                    width: size,
                    height: size,
                    opacity: mentioned ? 1 : site.bop ? 0.9 : 0.45,
                  }}
                />
              );
            })
          : null}
        {activeTooth && view.furcation > 0 ? (
          <span
            className={`hero-furcation ${view.furcation >= 2 ? "red" : "amber"}`}
            style={{ left: `${FURCATION_ANCHOR.x}%`, top: `${FURCATION_ANCHOR.y}%` }}
          />
        ) : null}
        {lastMention
          ? mentionedSites.map((site) => {
              const viewSite = view.sites.find((item) => item.site === site);
              const anchor = SITE_ANCHORS[site];
              const caption = issueCaption(lastMention, site, viewSite?.pd, viewSite?.previousPd);
              const tone = viewSite?.tone ?? "amber";
              return (
                <span key={`${lastMention.id}-${site}-issue`} className="hero-issue" style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}>
                  <span className={`hero-issue-burst ${tone}`} />
                  {caption ? <span className={`hero-issue-label ${tone}`}>{caption}</span> : null}
                </span>
              );
            })
          : null}
        {activeTooth
          ? view.sites.map((site) => (
              <span
                key={`${site.site}-${lastMention?.id ?? "idle"}`}
                className={`hero-pin ${site.tone}${site.bop ? " bleed" : ""}${site.rec ? " receded" : ""}${
                  siteIsMentioned(lastMention, site.site) ? " issue" : ""
                }`}
                style={{ left: `${site.x}%`, top: `${site.y}%` }}
                title={`${site.title}${site.pd !== undefined ? ` ${site.pd} mm` : ""}`}
              >
                {site.pd ?? "·"}
              </span>
            ))
          : null}
      </div>
      <aside className="hero-findings">
        <p className="eyebrow">
          {activeTooth ? `Tooth ${tooth} · ${toothHeaderLabel(tooth)}` : "Waiting for the next tooth"}
        </p>
        {activeTooth && view.distalPd !== undefined ? (
          <div className="hero-reading-line">
            Distal {view.distalPrevious ?? view.distalPd} mm → {view.distalPd} mm
          </div>
        ) : null}
        {!activeTooth || view.callouts.length === 0 ? (
          <p className="hero-finding-empty">
            {activeTooth ? "This one looks calm so far." : "As each tooth is checked, we will look at it here."}
          </p>
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
