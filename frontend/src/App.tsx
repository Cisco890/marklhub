import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AppLayout } from './components/AppLayout';
import { PasswordGate } from './components/PasswordGate';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { FilesPage } from './pages/FilesPage';
import { FoldersPage } from './pages/FoldersPage';
import { LoginPage } from './pages/LoginPage';
import { MarkdownEditPage } from './pages/MarkdownEditPage';
import { MarkdownViewPage } from './pages/MarkdownViewPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TeamsPage } from './pages/admin/TeamsPage';
import { UsersPage } from './pages/admin/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={<PasswordGate />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/teams" element={<TeamsPage />} />
              </Route>
              <Route path="/teams/:teamId/projects" element={<ProjectsPage />} />
              <Route path="/projects/:projectId/folders" element={<FoldersPage />} />
              <Route path="/folders/:folderId/files" element={<FilesPage />} />
              <Route path="/files/:fileId/edit" element={<MarkdownEditPage />} />
              <Route path="/files/:fileId/view" element={<MarkdownViewPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
