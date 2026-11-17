import { Navigate } from "react-router-dom";

/** Grade calculator lives inside the unified Teacher Space. */
export function GradeCalculatorPage() {
  return <Navigate to="/teacher-space?section=calculator" replace />;
}
