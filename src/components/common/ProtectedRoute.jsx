import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { getDefaultRoleRoute } from '../../utils/permissions';
import toast from 'react-hot-toast';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Suspended User Check
  if (currentUser.status === 'SUSPENDED') {
    toast.error('Account SUSPENDED: Access restricted by Super Admin.');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role?.toUpperCase();
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRole);

    if (!isAllowed) {
      const fallbackRoute = getDefaultRoleRoute(userRole);
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
