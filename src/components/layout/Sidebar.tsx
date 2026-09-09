import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Send,
  Wrench,
  Fuel,
  BarChart3,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types/auth';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { activeRole, can } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
      badge: null,
    },
    {
      to: '/vehicles',
      label: 'Vehicle Twin',
      icon: Truck,
      show: true,
      badge: '6 Units',
    },
    {
      to: '/drivers',
      label: 'Driver Intel',
      icon: Users,
      show: true,
      badge: activeRole === 'safety_officer' ? 'Audit' : null,
    },
    {
      to: '/dispatch',
      label: 'Smart Dispatch',
      icon: Send,
      show: true,
      badge: 'Engine',
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      show: true,
      badge: 'Shop Active',
    },
    {
      to: '/fuel',
      label: 'Fuel & Expenses',
      icon: Fuel,
      show: true,
      badge: null,
    },
    {
      to: '/reports',
      label: 'Financial ROI',
      icon: BarChart3,
      show: can('canViewReports'),
      badge: 'Reports',
    },
    {
      to: '/alerts',
      label: 'Alert Center',
      icon: Bell,
      show: true,
      badge: '4 New',
    },
    {
      to: '/copilot',
      label: 'AI Copilot',
      icon: Sparkles,
      show: true,
      badge: 'Secured',
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        position: 'relative',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-olive-700)',
              color: 'var(--color-beige-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.03em',
              boxShadow: '0 2px 6px rgba(47, 66, 42, 0.3)',
              flexShrink: 0,
            }}
          >
            T<span style={{ color: 'var(--color-beige-300)' }}>O</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Transit<span style={{ color: 'var(--color-olive-600)' }}>Ops</span>
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Fleet Intelligence
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Role Indicator Banner */}
      {!collapsed && (
        <div
          style={{
            margin: '0.85rem 1rem 0.25rem 1rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={16} color="var(--color-olive-600)" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Active RBAC Role
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {ROLE_LABELS[activeRole]}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0.75rem 0.65rem', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.filter(item => item.show).map(item => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: collapsed ? '0.65rem 0' : '0.65rem 0.85rem',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--color-olive-900)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--color-olive-200)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  })}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={19} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-beige-300)',
                        color: 'var(--color-olive-950)',
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Toggle when collapsed */}
      {collapsed && (
        <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onToggle}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};
