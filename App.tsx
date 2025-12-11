import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DocumentList } from './pages/DocumentList';
import { DocumentForm } from './pages/DocumentForm';
import { DocumentView } from './pages/DocumentView';
import { Locations } from './pages/Locations';
import { Reports } from './pages/Reports';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-x-hidden print:ml-0 print:p-0">
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="documents" element={<DocumentList />} />
            <Route path="documents/:id" element={<DocumentForm />} />
            <Route path="documents/view/:id" element={<DocumentView />} />
            <Route path="locations" element={<Locations />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
