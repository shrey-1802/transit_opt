import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, ROLE_LABELS } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@transitops.internal');
  const [password, setPassword] = useState('Admin@Transit2026!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('fleet_manager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Corporate email is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, selectedRole);
      showToast({
        type: 'success',
        title: 'Authentication Verified',
        message: `Welcome to TransitOps Operations Center as ${ROLE_LABELS[selectedRole]}.`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Invalid credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetRoles: { role: UserRole; title: string; email: string; desc: string }[] = [
    {
      role: 'fleet_manager',
      title: 'Fleet Manager (Admin)',
      email: 'admin@transitops.internal',
      desc: 'Full system access: vehicles, dispatch, drivers, maintenance, fuel, reports & analytics',
    },
    {
      role: 'dispatcher',
      title: 'Dispatcher',
      email: 'carlos.mendez@transitops.internal',
      desc: 'Trip state machine, driver/asset assignment, smart dispatch validation',
    },
    {
      role: 'safety_officer',
      title: 'Safety Officer',
      email: 'raymond.holt@transitops.internal',
      desc: 'Driver compliance, license audits, incident investigation, suspensions',
    },
    {
      role: 'financial_analyst',
      title: 'Financial Analyst',
      email: 'siddharth.n@transitops.internal',
      desc: 'Fuel accounting, toll expenses, asset ROI calculations, financial export',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
      }}
    >
      {/* Theme Toggle Floating button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Brand Logo & Title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-olive-700)',
              color: 'var(--color-beige-100)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.6rem',
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            T<span style={{ color: 'var(--color-beige-300)' }}>O</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Transit<span style={{ color: 'var(--color-olive-600)' }}>Ops</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Smart Transport Operations Platform & Mission Control
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} color="var(--color-olive-600)" /> Work Email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@transitops.internal"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={15} color="var(--color-olive-600)" /> Security Token / Password
              </label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} color="var(--color-olive-600)" /> Select Operational RBAC Role
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                {presetRoles.map(item => (
                  <div
                    key={item.role}
                    onClick={() => {
                      setSelectedRole(item.role);
                      setEmail(item.email);
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${selectedRole === item.role ? 'var(--color-olive-600)' : 'var(--border-subtle)'}`,
                      backgroundColor: selectedRole === item.role ? 'var(--color-olive-100)' : 'var(--bg-surface-hover)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedRole === item.role ? 'var(--color-olive-900)' : 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      {selectedRole === item.role && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-olive-700)' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Access Mission Control'}
              <ArrowRight size={17} />
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Authoritative role enforcement. Tokens encrypted with TLS 1.3 in transit.
        </div>
      </div>
    </div>
  );
};
