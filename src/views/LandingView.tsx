import {
  landingDemoLabel,
  landingEyebrow,
  landingFeatures,
  landingHeroAccent,
  landingHeroEnd,
  landingHeroLead,
  landingProof,
  landingSubtext,
  landingVideoLabel,
} from "./landingCopy";
import { ActionLink, LandingHeader, landingDemoHref } from "./LandingShell";
import { SiteFooter } from "./SiteFooter";

function videoHref(): string {
  const fromEnv = import.meta.env.VITE_LANDING_VIDEO_HREF;
  if (typeof fromEnv === "string" && fromEnv.length > 0) {
    return fromEnv;
  }
  return "#how-it-works";
}

function FeatureIcon({ title }: { title: string }) {
  if (title === "Ambient AI") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z"
        />
      </svg>
    );
  }
  if (title === "Structured Charting") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2zm2 5v2h6V8H9zm0 4v2h6v-2H9z"
        />
      </svg>
    );
  }
  if (title === "Visual Patient Education") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-6l-3 3-3-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm2 3v6h12V8H6z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21s-7.2-4.6-9.3-8.2C1.3 10.4 2.2 7 5.2 6c1.8-.6 3.6.1 4.8 1.5C11.2 6.1 13 5.4 14.8 6c3 .9 3.9 4.4 2.5 6.8C19.2 16.4 12 21 12 21z"
      />
    </svg>
  );
}

export function LandingView() {
  const demo = landingDemoHref();
  const video = videoHref();

  return (
    <main id="main" className="screen landing">
      <LandingHeader />

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow">{landingEyebrow}</p>
          <h1 className="landing-hero-title">
            <span className="landing-hero-line">{landingHeroLead}</span>
            <span className="landing-hero-line">
              {landingHeroEnd} <span>{landingHeroAccent}</span>
            </span>
          </h1>
          <p className="landing-sub">{landingSubtext}</p>
          <div className="landing-actions">
            <ActionLink href={demo} className="landing-btn landing-btn-primary">
              {landingDemoLabel}
              <span aria-hidden="true"> →</span>
            </ActionLink>
            <ActionLink href={video} className="landing-btn landing-btn-ghost">
              <span className="landing-play" aria-hidden="true">
                ▶
              </span>
              {landingVideoLabel}
            </ActionLink>
          </div>
          <ul className="landing-proof">
            {landingProof.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="landing-visual">
          <img
            src={`${import.meta.env.BASE_URL}landing/hero.png`}
            alt="Hygienist and patient reviewing a tooth chart together in the operatory"
          />
        </div>
      </section>

      <section className="landing-features" aria-label="How MolarMind helps">
        {landingFeatures.map((feature) => (
          <article className="landing-feature" id={feature.id} key={feature.id}>
            <div className="landing-feature-icon">
              <FeatureIcon title={feature.title} />
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
