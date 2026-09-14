import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { aboutPath, clinicianPath, landingPath } from "../config/paths";
import { landingDemoLabel, landingNav, landingTagline } from "./landingCopy";

export function landingDemoHref(): string {
  const fromEnv = import.meta.env.VITE_LANDING_DEMO_HREF;
  if (typeof fromEnv === "string" && fromEnv.length > 0) {
    return fromEnv;
  }
  return clinicianPath;
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
}

function pathsMatch(pathname: string, target: string): boolean {
  if (pathname === target) {
    return true;
  }
  if (target !== "/" && pathname === `${target}/`) {
    return true;
  }
  return false;
}

export function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (isExternalHref(href)) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to={href}>
      {children}
    </Link>
  );
}

export function LandingLogo() {
  return (
    <Link className="landing-logo" to={landingPath} aria-label="MolarMind home">
      <img
        className="landing-mark"
        src={`${import.meta.env.BASE_URL}molarmind-favicon.png`}
        alt=""
      />
      <span className="landing-brand-text">
        <span className="landing-wordmark">
          MolarMind
          <sup>TM</sup>
        </span>
        <span className="landing-tagline">{landingTagline}</span>
      </span>
    </Link>
  );
}

export function LandingHeader() {
  const location = useLocation();
  const onLanding = pathsMatch(location.pathname, landingPath);
  const onAbout = pathsMatch(location.pathname, aboutPath);
  const demo = landingDemoHref();

  return (
    <header className="landing-nav">
      <LandingLogo />
      <nav className="landing-links" aria-label="Primary">
        {landingNav.map((item) => {
          if (item.id === "about") {
            return (
              <Link
                key={item.id}
                to={aboutPath}
                className={onAbout ? "is-active" : undefined}
                aria-current={onAbout ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          }
          if (onLanding) {
            return (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            );
          }
          return (
            <Link key={item.id} to={{ pathname: landingPath, hash: item.id }}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <ActionLink href={demo} className="landing-btn landing-btn-primary landing-nav-cta">
        {landingDemoLabel}
      </ActionLink>
    </header>
  );
}
