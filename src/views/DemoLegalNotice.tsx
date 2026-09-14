import { Link } from "react-router-dom";
import { disclaimerPath, nppPath, privacyPath, termsPath } from "../config/paths";

export function DemoLegalNotice({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <p className={`demo-legal-notice ${tone}`}>
      Demo only. Sample chart data stays in this browser session. Not a live patient record and not a substitute for
      dental care.{" "}
      <Link to={privacyPath}>Privacy</Link>
      <span aria-hidden="true"> · </span>
      <Link to={nppPath}>HIPAA Notice</Link>
      <span aria-hidden="true"> · </span>
      <Link to={termsPath}>Terms</Link>
      <span aria-hidden="true"> · </span>
      <Link to={disclaimerPath}>Disclaimer</Link>
    </p>
  );
}
