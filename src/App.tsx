import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout.tsx";
import { ContactPage } from "./pages/ContactPage.tsx";
import { GradeWorkspacePage } from "./pages/GradeWorkspacePage.tsx";
import { GradesPage } from "./pages/GradesPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { LibraryPage } from "./pages/LibraryPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { PlaylistsPage } from "./pages/PlaylistsPage.tsx";
import { TeacherLibraryPage } from "./pages/TeacherLibraryPage.tsx";
import { TeacherPlaylistsPage } from "./pages/TeacherPlaylistsPage.tsx";
import { TeacherSpacePage } from "./pages/TeacherSpacePage.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="grades/:gradeId" element={<GradeWorkspacePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="teacher-space" element={<TeacherSpacePage />} />
          <Route path="teacher-space/library" element={<TeacherLibraryPage />} />
          <Route path="teacher-space/playlists" element={<TeacherPlaylistsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="subjects/:gradeId" element={<Navigate to="/grades" replace />} />
          <Route path="study/:subjectId" element={<Navigate to="/library" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
