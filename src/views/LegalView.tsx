import { useEffect } from "react";
import { Link } from "react-router-dom";
import { clearCookieConsent } from "../legal/cookieConsent";
import type { LegalPageId } from "../legal/legalConfig";
import { formatLegalDate, legalEffectiveIso, legalNav, privacyEmail } from "../legal/legalConfig";
import { legalDocument } from "../legal/legalDocuments";
import { LandingHeader } from "./LandingShell";
import { SiteFooter } from "./SiteFooter";

export function LegalView({ page }: { page: LegalPageId }) {
  const doc = legalDocument(page);
  const effective = formatLegalDate(legalEffectiveIso());
  const email = privacyEmail();

  useEffect(() => {
    const previous = document.title;
    document.title = `${doc.title} · MolarMind`;
    return () => {
      document.title = previous;
    };
  }, [doc.title]);

  return (
    <main id="main" className="screen landing landing-scroll">
      <LandingHeader />
      <article className="legal">
        <header className="legal-hero">
          <p className="landing-eyebrow">{doc.kicker}</p>
          <h1>{doc.title}</h1>
          <p className="legal-meta">Effective {effective} · Last updated {effective}</p>
          <p className="legal-intro">{doc.intro}</p>
        </header>

        {doc.sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {page === "cookies" ? (
          <p className="legal-actions">
            <button type="button" className="landing-btn landing-btn-ghost" onClick={() => clearCookieConsent()}>
              Change cookie preference
            </button>
          </p>
        ) : null}

        {email ? (
          <p className="legal-contact">
            Privacy officer:{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        ) : (
          <p className="legal-contact">
            A privacy-officer email is not published on this deployment. If a dental practice showed you this software,
            use that practice’s privacy contact. Operators should publish a mailbox before inviting the public.
          </p>
        )}

        <nav className="legal-index" aria-label="Other legal pages">
          {legalNav
            .filter((item) => item.id !== page)
            .map((item) => (
              <Link key={item.id} to={item.path}>
                {item.label}
              </Link>
            ))}
        </nav>
      </article>
      <SiteFooter />
    </main>
  );
}
