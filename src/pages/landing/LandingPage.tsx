import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Send,
  ShieldCheck,
  DollarSign,
  Lock,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  Activity,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Zap,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, ROLE_LABELS } from '../../types/auth';

interface RoleCredential {
  role: UserRole;
  name: string;
  title: string;
  email: string;
  pass: string;
  icon: React.ElementType;
  themeColor: string;
}

const CREDENTIALS: RoleCredential[] = [
  {
    role: 'fleet_manager',
    name: 'Eleanor Vance',
    title: 'Fleet Manager',
    email: 'eleanor.vance@transitops.internal',
    pass: 'password123',
    icon: Truck,
    themeColor: 'var(--color-olive-600)',
  },
  {
    role: 'dispatcher',
    name: 'Carlos Mendez',
    title: 'Smart Dispatcher',
    email: 'carlos.mendez@transitops.internal',
    pass: 'password123',
    icon: Send,
    themeColor: '#D97706',
  },
  {
    role: 'safety_officer',
    name: 'Raymond Holt',
    title: 'Safety Officer',
    email: 'raymond.holt@transitops.internal',
    pass: 'password123',
    icon: ShieldCheck,
    themeColor: '#2563EB',
  },
  {
    role: 'financial_analyst',
    name: 'Siddharth Nair',
    title: 'Financial Analyst',
    email: 'siddharth.n@transitops.internal',
    pass: 'password123',
    icon: DollarSign,
    themeColor: '#0D9488',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>('fleet_manager');
  const [email, setEmail] = useState('eleanor.vance@transitops.internal');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // High performance route & telemetry constellation particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(Math.floor((width * height) / 20000), 60);
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isHub: boolean;
      pulse: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() > 0.85 ? 3.2 : 1.8,
        isHub: Math.random() > 0.8,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';
      const nodeColor = isDark ? 'rgba(163, 177, 138, ' : 'rgba(74, 107, 59, ';
      const lineColor = isDark ? 'rgba(163, 177, 138, ' : 'rgba(92, 114, 80, ';

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.035;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        if (node.isHub) {
          const pulseRadius = node.radius + Math.sin(node.pulse) * 4 + 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(pulseRadius, 1), 0, Math.PI * 2);
          ctx.fillStyle = `${nodeColor}${0.14 + Math.sin(node.pulse) * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}${node.isHub ? '0.85)' : '0.5)'}`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isDark ? 0.22 : 0.15);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = dist < 65 ? 1.2 : 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const selectCredential = (item: RoleCredential) => {
    setSelectedRole(item.role);
    setEmail(item.email);
    setPassword(item.pass);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    showToast({ type: 'info', title: 'Copied to Clipboard', message: text });
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const executeLogin = async (targetEmail: string, targetPass: string, targetRole: UserRole) => {
    setIsSubmitting(true);
    try {
      await login(targetEmail, targetPass, targetRole);
      showToast({
        type: 'success',
        title: 'Access Granted',
        message: `Authenticated as ${ROLE_LABELS[targetRole]}. Entering Mission Control...`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Authentication Error',
        message: err.message || 'Invalid credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password, selectedRole);
  };

  const activeCred = CREDENTIALS.find(c => c.role === selectedRole) || CREDENTIALS[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowX: 'hidden',
      }}
    >
      {/* Animated Route Particle Field */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      />

      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-olive-700)',
              color: 'var(--color-beige-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            T<span style={{ color: 'var(--color-beige-300)' }}>O</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Transit<span style={{ color: 'var(--color-olive-600)' }}>Ops</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Transport Intelligence Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: '1px solid var(--status-available-border)',
            }}
          >
            <Radio size={14} className="animate-pulse" />
            <span>Mission Control Active</span>
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

      {/* Main Authentication & Login Hero Section */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1080px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Hero Title */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: 'clamp(1.9rem, 3.8vw, 2.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
              }}
            >
              TransitOps <span style={{ color: 'var(--color-olive-600)' }}>Mission Control Gateway</span>
            </h1>
            <p
              style={{
                fontSize: '0.98rem',
                color: 'var(--text-secondary)',
                marginTop: '0.4rem',
              }}
            >
              Select an authorized operator account below or log in with your credentials.
            </p>
          </div>

          {/* 2-Column Grid: Left (4 Clickable Role Credentials) & Right (Active Login Form) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              alignItems: 'stretch',
            }}
          >
            {/* Left Column: Direct Role Credentials Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Authorized Role Credentials
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-600)', fontWeight: 700 }}>
                  Click to Select or 1-Click Login
                </span>
              </div>

              {CREDENTIALS.map(item => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;

                return (
                  <div
                    key={item.role}
                    onClick={() => selectCredential(item)}
                    style={{
                      padding: '1rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-hover)',
                      border: `2px solid ${isSelected ? 'var(--color-olive-600)' : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-normal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-olive-600)' : 'var(--color-olive-100)',
                          color: isSelected ? 'var(--color-beige-100)' : 'var(--color-olive-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({item.name})
                          </span>
                        </div>

                        {/* Email & Pass Credentials */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <Mail size={12} color="var(--text-muted)" />
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.email}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(item.email);
                              }}
                              style={{ padding: '2px', color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}
                              title="Copy Email"
                            >
                              {copiedEmail === item.email ? <Check size={12} color="#38A169" /> : <Copy size={12} />}
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <Key size={12} color="var(--text-muted)" />
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>Password: {item.pass}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 1-Click Instant Login Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCredential(item);
                        executeLogin(item.email, item.pass, item.role);
                      }}
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        gap: '0.35rem',
                        flexShrink: 0,
                        borderRadius: 'var(--radius-md)',
                      }}
                      title={`Instant 1-Click Login as ${item.title}`}
                    >
                      <Zap size={13} />
                      <span>Login</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Login Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Sign In Terminal
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Role-Enforced Authentication
                </span>
              </div>

              <div
                className="card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-medium)',
                  height: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Selected Role Indicator */}
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-olive-100)',
                      border: '1px solid var(--color-olive-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <activeCred.icon size={20} color="var(--color-olive-800)" />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-olive-800)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Target Clearance
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-olive-900)' }}>
                          {activeCred.title} ({activeCred.name})
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={15} color="var(--color-olive-600)" /> Corporate Account Email
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
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Lock size={15} color="var(--color-olive-600)" /> Security Password
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{
                        padding: '0.85rem',
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        marginTop: '0.4rem',
                        gap: '0.5rem',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Activity size={18} className="animate-spin" /> Authorizing...
                        </>
                      ) : (
                        <>
                          Sign In as {activeCred.title} <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-hover)',
                    border: '1px dashed var(--border-medium)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  💡 <strong>To Switch Role:</strong> Click <em>"Switch Role / Sign Out"</em> in the dashboard header to return here anytime.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 20,
          borderTop: '1px solid var(--border-subtle)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-footer)',
        }}
      >
        <div>TransitOps &copy; {new Date().getFullYear()} &bull; Production Release</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Prisma ORM</span>
          <span>ACID Dispatch</span>
          <span>JWT RBAC</span>
        </div>
      </footer>
    </div>
  );
};
