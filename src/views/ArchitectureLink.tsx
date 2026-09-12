import { Link } from "react-router-dom";
import { architecturePath } from "../config/paths";

export function ArchitectureLink() {
  return (
    <Link className="header-link" to={architecturePath}>
      Architecture
    </Link>
  );
}
