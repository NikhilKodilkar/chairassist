import { Link } from "react-router-dom";
import { aboutPath, landingPath } from "../config/paths";
import { legalEntity, legalNav } from "../legal/legalConfig";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <p>
          © {year} {legalEntity()}. Chairside demo — not a live patient record.
        </p>
        <p>
          <Link to={landingPath}>Home</Link>
          <span aria-hidden="true"> · </span>
          <Link to={aboutPath}>About</Link>
        </p>
      </div>
      <nav className="site-footer-legal" aria-label="Legal">
        {legalNav.map((item) => (
          <Link key={item.id} to={item.path}>
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
