import { Navigate } from "react-router-dom";
import { useTeacherSpace } from "../services/TeacherSpaceProvider.tsx";

/** Legacy deep-link — always lands inside Teacher Space; respects admin toggle. */
export function GradeCalculatorPage() {
  const { gradeCalculatorActive } = useTeacherSpace();
  if (!gradeCalculatorActive) {
    return <Navigate to="/teacher-space?section=timetable" replace />;
  }
  return <Navigate to="/teacher-space?section=calculator" replace />;
}
