import { Navigate, Route, Routes } from "react-router-dom";
import { ClinicianView } from "./views/ClinicianView";
import { PatientView } from "./views/PatientView";

const clinicianPath = import.meta.env.VITE_CLINICIAN_PATH || "/clinician";
const patientPath = import.meta.env.VITE_PATIENT_PATH || "/patient";

export default function App() {
  return (
    <Routes>
      <Route path={clinicianPath} element={<ClinicianView />} />
      <Route path={patientPath} element={<PatientView />} />
      <Route path="/" element={<Navigate to={clinicianPath} replace />} />
    </Routes>
  );
}
