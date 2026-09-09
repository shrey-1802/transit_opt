import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RolePermission } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredPermission?: keyof RolePermission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, can } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
        }}
      >
        Authenticating Operator Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
