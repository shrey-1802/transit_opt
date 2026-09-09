import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, RolePermission, ROLE_PERMISSIONS } from '../types/auth';
import { authService } from '../api/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  permissions: RolePermission;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  can: (action: keyof RolePermission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Provide default authenticated fleet manager for seamless demo/production test
          setUser(authService.getPresetUser('fleet_manager'));
        }
      } catch {
        setUser(authService.getPresetUser('fleet_manager'));
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const activeRole: UserRole = user?.role || 'fleet_manager';
  const permissions: RolePermission = ROLE_PERMISSIONS[activeRole];

  const login = async (email: string, password?: string, role: UserRole = 'fleet_manager') => {
    setIsLoading(true);
    try {
      const session = await authService.login(email, password, role);
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Instant role switching for verifying RBAC dynamically
  const switchRole = (newRole: UserRole) => {
    const preset = authService.getPresetUser(newRole);
    setUser(preset);
  };

  const can = (action: keyof RolePermission): boolean => {
    return !!permissions[action];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        permissions,
        login,
        logout,
        switchRole,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
