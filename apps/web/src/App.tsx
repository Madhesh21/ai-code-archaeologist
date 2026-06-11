import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import RepositoryUpload from '@/pages/RepositoryUpload';
import RepositoryOverview from '@/pages/RepositoryOverview';
import Chat from '@/pages/Chat';
import GraphExplorer from '@/pages/GraphExplorer';
import FlowExplorer from '@/pages/FlowExplorer';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<RepositoryUpload />} />
        <Route path="/repositories/:id" element={<RepositoryOverview />} />
        <Route path="/repositories/:id/chat" element={<Chat />} />
        <Route path="/repositories/:id/graph" element={<GraphExplorer />} />
        <Route path="/repositories/:id/flow" element={<FlowExplorer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
