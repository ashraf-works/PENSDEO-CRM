import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import ClientLayout from './layouts/ClientLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminClients from './pages/admin/AdminClients';
import AdminProjects from './pages/admin/AdminProjects';
import AdminTeams from './pages/admin/AdminTeams';
import AdminTasks from './pages/admin/AdminTasks';
import AdminDepartments from './pages/admin/AdminDepartments';

// Employee Pages
import EmployeeMyTasks from './pages/employee/EmployeeMyTasks';
import EmployeeDailyWork from './pages/employee/EmployeeDailyWork';
import EmployeeProjects from './pages/employee/EmployeeProjects';

// Client Pages
import ClientOverview from './pages/client/ClientOverview';
import ClientDailyUpdates from './pages/client/ClientDailyUpdates';
import ClientTasks from './pages/client/ClientTasks';
import ClientDeliverables from './pages/client/ClientDeliverables';

function SmartRootRedirect() {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Manager') return <Navigate to="/admin" replace />;
  if (currentUser.role === 'Employee') return <Navigate to="/employee" replace />;
  if (currentUser.role === 'Client') return <Navigate to="/client" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 1. Admin & Manager Protected Portal */}
        <Route element={<ProtectedRoute allowedRoles={['SuperAdmin', 'Manager']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="departments" element={<AdminDepartments />} />
          </Route>
        </Route>

        {/* 2. Employee Protected Workspace */}
        <Route element={<ProtectedRoute allowedRoles={['Employee', 'SuperAdmin', 'Manager']} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeMyTasks />} />
            <Route path="work-logs" element={<EmployeeDailyWork />} />
            <Route path="projects" element={<EmployeeProjects />} />
          </Route>
        </Route>

        {/* 3. Client Protected Portal */}
        <Route element={<ProtectedRoute allowedRoles={['Client', 'SuperAdmin', 'Manager']} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientOverview />} />
            <Route path="updates" element={<ClientDailyUpdates />} />
            <Route path="tasks" element={<ClientTasks />} />
            <Route path="deliverables" element={<ClientDeliverables />} />
          </Route>
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<SmartRootRedirect />} />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<SmartRootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
