import { Route, Routes } from "react-router-dom";
import {
  aboutPath,
  accessibilityPath,
  architecturePath,
  clinicianNeoPath,
  clinicianPath,
  cookiesPath,
  disclaimerPath,
  hipaaPath,
  landingPath,
  nppPath,
  patientPath,
  privacyChoicesPath,
  privacyPath,
  termsPath,
} from "./config/paths";
import { AboutView } from "./views/AboutView";
import { ArchitectureView } from "./views/ArchitectureView";
import { ClinicianNeoView } from "./views/ClinicianNeoView";
import { ClinicianView } from "./views/ClinicianView";
import { CookieBanner } from "./views/CookieBanner";
import { LandingView } from "./views/LandingView";
import { LegalView } from "./views/LegalView";
import { PatientView } from "./views/PatientView";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Routes>
        <Route path={landingPath} element={<LandingView />} />
        <Route path={aboutPath} element={<AboutView />} />
        <Route path={privacyPath} element={<LegalView page="privacy" />} />
        <Route path={nppPath} element={<LegalView page="npp" />} />
        <Route path={termsPath} element={<LegalView page="terms" />} />
        <Route path={cookiesPath} element={<LegalView page="cookies" />} />
        <Route path={accessibilityPath} element={<LegalView page="accessibility" />} />
        <Route path={disclaimerPath} element={<LegalView page="disclaimer" />} />
        <Route path={hipaaPath} element={<LegalView page="hipaa" />} />
        <Route path={privacyChoicesPath} element={<LegalView page="choices" />} />
        <Route path={clinicianPath} element={<ClinicianView />} />
        <Route path={clinicianNeoPath} element={<ClinicianNeoView />} />
        <Route path={patientPath} element={<PatientView />} />
        <Route path={architecturePath} element={<ArchitectureView />} />
      </Routes>
      <CookieBanner />
    </>
  );
}
