import { Navigate, Route, Routes } from "react-router-dom";
import { architecturePath, clinicianPath, patientPath } from "./config/paths";
import { ArchitectureView } from "./views/ArchitectureView";
import { ClinicianView } from "./views/ClinicianView";
import { PatientView } from "./views/PatientView";

export default function App() {
  return (
    <Routes>
      <Route path={clinicianPath} element={<ClinicianView />} />
      <Route path={patientPath} element={<PatientView />} />
      <Route path={architecturePath} element={<ArchitectureView />} />
      <Route path="/" element={<Navigate to={clinicianPath} replace />} />
    </Routes>
  );
}
