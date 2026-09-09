import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { ForbiddenPage } from './pages/auth/ForbiddenPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { VehicleRegistryPage } from './pages/vehicles/VehicleRegistryPage';
import { VehicleTwinPage } from './pages/vehicles/VehicleTwinPage';
import { DriverDirectoryPage } from './pages/drivers/DriverDirectoryPage';
import { SmartDispatchPage } from './pages/dispatch/SmartDispatchPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { FuelExpensesPage } from './pages/fuel/FuelExpensesPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AlertCenterPage } from './pages/alerts/AlertCenterPage';
import { CopilotPage } from './pages/copilot/CopilotPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/403" element={<ForbiddenPage />} />

              {/* Protected Operations Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vehicles" element={<VehicleRegistryPage />} />
                <Route path="/vehicles/:id" element={<VehicleTwinPage />} />
                <Route path="/drivers" element={<DriverDirectoryPage />} />
                <Route path="/dispatch" element={<SmartDispatchPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/fuel" element={<FuelExpensesPage />} />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute requiredPermission="canViewReports">
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/alerts" element={<AlertCenterPage />} />
                <Route path="/copilot" element={<CopilotPage />} />
              </Route>

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  );
};
