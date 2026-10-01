import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to default home based on actual user role
    if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Manager') {
      return <Navigate to="/admin" replace />;
    }
    if (currentUser.role === 'Employee') {
      return <Navigate to="/employee" replace />;
    }
    if (currentUser.role === 'Client') {
      return <Navigate to="/client" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
