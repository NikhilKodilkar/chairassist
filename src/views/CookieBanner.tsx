import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cookiesPath, privacyPath } from "../config/paths";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "../legal/cookieConsent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOpen(!readCookieConsent());
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-copy">
      <div className="cookie-banner-copy">
        <p id="cookie-banner-title">Cookies and privacy</p>
        <p id="cookie-banner-copy">
          We use necessary browser storage to remember this choice. We do not sell your information. The chairside
          demo keeps sample chart data in memory for the session only.{" "}
          <Link to={privacyPath}>Privacy Policy</Link>
          <span aria-hidden="true"> · </span>
          <Link to={cookiesPath}>Cookie Policy</Link>
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button type="button" onClick={() => writeCookieConsent(false)}>
          Necessary only
        </button>
        <button type="button" className="cookie-accept" onClick={() => writeCookieConsent(true)}>
          Accept all
        </button>
      </div>
    </div>
  );
}
