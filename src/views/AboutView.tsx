import { useEffect } from "react";
import { Link } from "react-router-dom";
import { clinicianNeoPath, clinicianPath, patientPath } from "../config/paths";
import {
  aboutCloseBody,
  aboutCloseTitle,
  aboutEyebrow,
  aboutHeroAccent,
  aboutHeroLead,
  aboutLede,
  aboutPatientLabel,
  aboutQuote,
  aboutRoles,
  aboutRolesTitle,
  aboutSignoff,
  aboutWhy,
  aboutWhyTitle,
} from "./aboutCopy";
import { landingDemoLabel } from "./landingCopy";
import { ActionLink, LandingHeader, landingDemoHref } from "./LandingShell";
import { SiteFooter } from "./SiteFooter";

function RoleIcon({ id }: { id: string }) {
  if (id === "hygienist") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z"
        />
      </svg>
    );
  }
  if (id === "doctor") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2zm2 5v2h6V8H9zm0 4v2h6v-2H9z"
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

function roleHref(id: string): string {
  if (id === "hygienist") {
    return clinicianPath;
  }
  if (id === "doctor") {
    return clinicianNeoPath;
  }
  return patientPath;
}

function roleCta(id: string): string {
  if (id === "hygienist") {
    return "Open the hygienist view";
  }
  if (id === "doctor") {
    return "Open the doctor-style chart";
  }
  return aboutPatientLabel;
}

export function AboutView() {
  const demo = landingDemoHref();

  useEffect(() => {
    const previous = document.title;
    document.title = "About · MolarMind";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <main id="main" className="screen landing landing-scroll">
      <LandingHeader />
      <article className="about">
        <header className="about-hero">
          <p className="landing-eyebrow">{aboutEyebrow}</p>
          <h1 className="about-title">
            <span className="about-title-line">{aboutHeroLead}</span>
            <span className="about-title-line about-title-accent">{aboutHeroAccent}</span>
          </h1>
          <p className="about-lede">{aboutLede}</p>
        </header>

        <section className="about-why" aria-labelledby="about-why-title">
          <div className="about-why-copy">
            <h2 id="about-why-title">{aboutWhyTitle}</h2>
            {aboutWhy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="about-signoff">{aboutSignoff}</p>
          </div>
          <blockquote className="about-quote">
            <p>{aboutQuote}</p>
          </blockquote>
        </section>

        <section className="about-roles" aria-labelledby="about-roles-title">
          <h2 id="about-roles-title">{aboutRolesTitle}</h2>
          <div className="about-role-grid">
            {aboutRoles.map((role) => (
              <article className="about-role" id={role.id} key={role.id}>
                <div className="landing-feature-icon">
                  <RoleIcon id={role.id} />
                </div>
                <p className="about-role-label">{role.role}</p>
                <h3>{role.title}</h3>
                <p className="about-role-body">{role.body}</p>
                <ul>
                  {role.uses.map((use) => (
                    <li key={use}>{use}</li>
                  ))}
                </ul>
                <Link className="about-role-link" to={roleHref(role.id)}>
                  {roleCta(role.id)}
                  <span aria-hidden="true"> →</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="about-close">
          <h2>{aboutCloseTitle}</h2>
          <p>{aboutCloseBody}</p>
          <ActionLink href={demo} className="landing-btn landing-btn-primary">
            {landingDemoLabel}
            <span aria-hidden="true"> →</span>
          </ActionLink>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
