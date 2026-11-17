import { Navigate } from "react-router-dom";

/** Schedules live inside the unified Teacher Space. */
export function SchedulesPage() {
  return <Navigate to="/teacher-space?section=schedules" replace />;
}
