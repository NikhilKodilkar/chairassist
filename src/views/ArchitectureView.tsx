import { Link } from "react-router-dom";
import { clinicianPath, patientPath } from "../config/paths";
import { AppLogo } from "./AppLogo";
import { DemoLegalNotice } from "./DemoLegalNotice";

export function ArchitectureView() {
  return (
    <main id="main" className="screen architecture">
      <header className="topbar">
        <AppLogo compact />
        <div>
          <p className="eyebrow">System design</p>
          <h1>Architecture</h1>
        </div>
        <div className="header-tools">
          <Link className="header-link" to={clinicianPath}>
            Clinician
          </Link>
          <Link className="header-link" to={patientPath}>
            Patient
          </Link>
        </div>
      </header>
      <DemoLegalNotice tone="dark" />
      <section className="panel architecture-panel">
        <img
          className="architecture-diagram"
          src={`${import.meta.env.BASE_URL}architecture.svg`}
          alt="Chairside Agent architecture: hygienist speech through on-device Whisper, lingo and parser, then clinician chart, patient captions, and Open Dental write-back"
        />
        <p className="hint">
          Speech stays in the operatory. Whisper runs in the clinician browser. Chart events fan out to the
          clinician grid, the detailed report, the patient screen, and a mock Open Dental write-back.
        </p>
      </section>
    </main>
  );
}
