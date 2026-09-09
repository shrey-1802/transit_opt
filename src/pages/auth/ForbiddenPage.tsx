import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types/auth';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, switchRole } = useAuth();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--status-critical-bg)',
          color: 'var(--status-critical-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <ShieldAlert size={34} />
      </div>

      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--status-critical-text)',
          marginBottom: '0.35rem',
        }}
      >
        HTTP 403 Forbidden
      </div>

      <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
        Access Restricted by Policy
      </h1>

      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          maxWidth: '520px',
          marginBottom: '1.75rem',
          lineHeight: 1.6,
        }}
      >
        Your current session role is <strong>{ROLE_LABELS[activeRole]}</strong>. This operational route requires elevated or different RBAC domain permissions.
      </p>

      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '1.25rem',
          marginBottom: '2rem',
          textAlign: 'left',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          RBAC Policy Matrix Guidance:
        </div>
        <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong>Fleet Manager:</strong> Vehicle Registry & Digital Twin, Maintenance schedules, Operational Analytics.</li>
          <li><strong>Dispatcher:</strong> Dispatch engine, Trip state machine, Driver-Asset assignments.</li>
          <li><strong>Safety Officer:</strong> Driver directory, Safety scores, License expiry compliance, Disciplinary suspension.</li>
          <li><strong>Financial Analyst:</strong> Fuel logging, Toll accounting, Asset ROI analysis, Reports export.</li>
        </ul>

        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Test role switch:</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => switchRole('fleet_manager')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              Fleet Mgr
            </button>
            <button
              onClick={() => switchRole('dispatcher')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              Dispatcher
            </button>
            <button
              onClick={() => switchRole('financial_analyst')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              Financial
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          <ArrowLeft size={16} /> Go Back
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          <Home size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
