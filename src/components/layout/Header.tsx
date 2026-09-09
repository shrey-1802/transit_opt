import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Bell, User, LogOut, Activity, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api/apiClient';
import { UserRole, ROLE_LABELS } from '../../types/auth';

export const Header: React.FC = () => {
  const { user, activeRole, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isFallback = apiClient.getIsFallbackActive();

  const roles: UserRole[] = ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'];

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left side: System status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isFallback ? 'var(--status-warning-bg)' : 'var(--status-available-bg)',
            color: isFallback ? 'var(--status-warning-text)' : 'var(--status-available-text)',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: `1px solid ${isFallback ? 'var(--status-warning-border)' : 'var(--status-available-border)'}`,
          }}
          title={isFallback ? 'Operating with resilient autonomous data store (Backend API connecting/standby)' : 'Connected to live production API'}
        >
          <Activity size={13} />
          <span>{isFallback ? 'Resilient Standalone Mode' : 'Production API Online'}</span>
        </div>
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Quick RBAC Role Previewer */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(prev => !prev)}
            className="btn btn-secondary"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              gap: '0.4rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Role:</span>
            <span style={{ fontWeight: 700 }}>{ROLE_LABELS[activeRole]}</span>
            <ChevronDown size={14} />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.4rem',
                minWidth: '210px',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Preview As Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: activeRole === r ? 'var(--color-olive-100)' : 'transparent',
                    color: activeRole === r ? 'var(--color-olive-900)' : 'var(--text-primary)',
                    fontWeight: activeRole === r ? 700 : 500,
                    display: 'block',
                  }}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Alerts Center Quick Link */}
        <NavLink
          to="/alerts"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          title="Mission Control Alerts"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#C93B2B',
              border: '1px solid var(--bg-surface)',
            }}
          />
        </NavLink>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.25rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-olive-200)',
              color: 'var(--color-olive-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {user?.name ? user.name[0] : <User size={16} />}
          </div>
          <div style={{ display: 'none', minWidth: 0 }} className="desktop-user-info">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name || 'Operator'}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '0.4rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Sign Out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
