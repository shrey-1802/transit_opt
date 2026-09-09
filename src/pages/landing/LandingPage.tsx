import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sun, Moon, Activity, Eye, EyeOff, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types/auth';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('eleanor.vance@transitops.internal');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Animated particle constellation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const N = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 70);
    type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number; hub: boolean };
    const nodes: Node[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() > 0.82 ? 3.5 : 2,
      pulse: Math.random() * Math.PI * 2,
      hub: Math.random() > 0.78,
    }));

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const isDark = theme === 'dark';
      const nc = isDark ? 'rgba(163,177,138,' : 'rgba(74,107,59,';
      const lc = isDark ? 'rgba(163,177,138,' : 'rgba(92,114,80,';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x = (n.x + n.vx + W) % W;
        n.y = (n.y + n.vy + H) % H;
        n.pulse += 0.035;

        if (n.hub) {
          const pr = n.r + Math.sin(n.pulse) * 4 + 5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
          ctx.fillStyle = `${nc}${0.12 + Math.abs(Math.sin(n.pulse)) * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${nc}${n.hub ? '0.9)' : '0.5)'}`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 125) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `${lc}${(1 - d / 125) * (isDark ? 0.25 : 0.16)})`;
            ctx.lineWidth = d < 60 ? 1.3 : 0.7;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast({ type: 'error', title: 'Required', message: 'Email and password are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password, undefined as unknown as UserRole);
      showToast({ type: 'success', title: 'Access Granted', message: 'Welcome to TransitOps Mission Control.' });
      navigate('/dashboard');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Login Failed', message: err.message || 'Please check your credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* Live animated telemetry field */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.75,
        }}
      />

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-olive-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.1rem',
              color: 'var(--color-beige-100)',
              letterSpacing: '-0.04em',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            TO
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Transit<span style={{ color: 'var(--color-olive-600)' }}>Ops</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Smart Transport Platform
            </div>
          </div>
        </div>

        {/* Live status + theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid var(--status-available-border)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#38A169',
                boxShadow: '0 0 8px #38A169',
                display: 'inline-block',
              }}
            />
            Mission Control Active
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Centered login section */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* Hero logo + headline */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-olive-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 8px 32px rgba(74,107,59,0.35)',
              }}
            >
              <Truck size={32} color="var(--color-beige-100)" />
            </div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
              }}
            >
              Welcome to <span style={{ color: 'var(--color-olive-600)' }}>TransitOps</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Sign in to access your fleet operations dashboard
            </p>
          </div>

          {/* Login Card */}
          <div
            className="card"
            style={{
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            {/* Credentials hint box */}
            <div
              style={{
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-olive-100)',
                border: '1px solid var(--color-olive-300)',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: 'var(--color-olive-900)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>🔑 Demo Login Credentials</div>
              <div><strong>Email:</strong> eleanor.vance@transitops.internal</div>
              <div><strong>Password:</strong> password123</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Email field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={15} color="var(--color-olive-600)" /> Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@transitops.internal"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={15} color="var(--color-olive-600)" /> Password
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                id="login-submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  padding: '0.85rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Activity size={18} /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Mission Control <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Role switch notice */}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            🔒 To switch roles, sign out from the dashboard header and log in again with a different account.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-subtle)',
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-footer)',
        }}
      >
        <span>TransitOps &copy; {new Date().getFullYear()} &bull; Production v2.4</span>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>ACID Dispatch</span>
          <span>Prisma ORM</span>
          <span>JWT RBAC</span>
        </div>
      </footer>
    </div>
  );
};
