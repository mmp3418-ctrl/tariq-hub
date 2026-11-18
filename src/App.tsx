import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout.tsx";
import { ContactPage } from "./pages/ContactPage.tsx";
import { GradeCalculatorPage } from "./pages/GradeCalculatorPage.tsx";
import { GradeWorkspacePage } from "./pages/GradeWorkspacePage.tsx";
import { GradesPage } from "./pages/GradesPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { LibraryPage } from "./pages/LibraryPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { PlaylistsPage } from "./pages/PlaylistsPage.tsx";
import { SchedulesPage } from "./pages/SchedulesPage.tsx";
import { TeacherLibraryPage } from "./pages/TeacherLibraryPage.tsx";
import { TeacherPlaylistsPage } from "./pages/TeacherPlaylistsPage.tsx";
import { TeacherSpacePage } from "./pages/TeacherSpacePage.tsx";

/** Restores deep links when a host served `404.html` then bounced to `/`. */
function SpaPathRestorer() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("tariq-spa-path");
      if (!saved || saved === "/") return;
      sessionStorage.removeItem("tariq-spa-path");
      navigate(saved, { replace: true });
    } catch {
      /* ignore */
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SpaPathRestorer />
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="grades/:gradeId" element={<GradeWorkspacePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          <Route path="grade-calculator" element={<GradeCalculatorPage />} />
          <Route path="teacher-space" element={<TeacherSpacePage />} />
          <Route path="teacher-space/library" element={<TeacherLibraryPage />} />
          <Route path="teacher-space/playlists" element={<TeacherPlaylistsPage />} />
          <Route path="teacher" element={<Navigate to="/teacher-space" replace />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="subjects/:gradeId" element={<Navigate to="/grades" replace />} />
          <Route path="study/:subjectId" element={<Navigate to="/library" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
