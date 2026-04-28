import { Navigate, Route, Routes } from 'react-router-dom';
import { EditorPage } from './pages/EditorPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { TaskPage } from './pages/TaskPage';
import { TermPage } from './pages/TermPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/projects" element={<ProjectListPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
      <Route path="/projects/:projectId/editor" element={<EditorPage />} />
      <Route path="/projects/:projectId/terms" element={<TermPage />} />
      <Route path="/projects/:projectId/tasks" element={<TaskPage />} />
    </Routes>
  );
}
