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
  CheckCircle2,
  Cpu,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, ROLE_LABELS } from '../../types/auth';

interface RolePreset {
  role: UserRole;
  title: string;
  subtitle: string;
  email: string;
  icon: React.ElementType;
  badgeColor: string;
  capabilities: string[];
}

const ROLE_PRESETS: RolePreset[] = [
  {
    role: 'fleet_manager',
    title: 'Fleet Manager',
    subtitle: 'Asset Lifecycle & Telemetry',
    email: 'eleanor.vance@transitops.internal',
    icon: Truck,
    badgeColor: '#4A6B3B',
    capabilities: [
      'Fleet Asset Registry & Digital Twins',
      'Preventive Maintenance Scheduling',
      'Real-time Vehicle GPS & Fuel Metrics'
    ]
  },
  {
    role: 'dispatcher',
    title: 'Smart Dispatcher',
    subtitle: 'ACID Transaction Engine',
    email: 'carlos.mendez@transitops.internal',
    icon: Send,
    badgeColor: '#C88D27',
    capabilities: [
      'Atomic Concurrency-Safe Trip Dispatch',
      'Payload Limit & Overload Protection',
      'Driver Allocation & Route Optimization'
    ]
  },
  {
    role: 'safety_officer',
    title: 'Safety & Compliance Officer',
    subtitle: 'Regulatory CDL Audits',
    email: 'raymond.holt@transitops.internal',
    icon: ShieldCheck,
    badgeColor: '#2B6CB0',
    capabilities: [
      'Automated Commercial License Expiration Checks',
      'Safety Score Indexing & Incident Logs',
      'Disciplinary Actions & Suspensions'
    ]
  },
  {
    role: 'financial_analyst',
    title: 'Financial & ROI Analyst',
    subtitle: 'Cost Accounting & Fleet ROI',
    email: 'siddharth.n@transitops.internal',
    icon: DollarSign,
    badgeColor: '#319795',
    capabilities: [
      'Fuel Log Auditing & Cost Per Mile',
      'Toll & Maintenance Expenditure Analytics',
      'Enterprise Financial Reports Export'
    ]
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>('fleet_manager');
  const [email, setEmail] = useState('eleanor.vance@transitops.internal');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If already authenticated and visiting landing, allow direct pass to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Particle & Route Constellation Canvas Animation
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

    // Generate Transit Hub Nodes
    const nodeCount = Math.min(Math.floor((width * height) / 22000), 55);
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isHub: boolean;
      pulse: number;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() > 0.85 ? 3.5 : 2,
        isHub: Math.random() > 0.8,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';
      const nodeColor = isDark ? 'rgba(163, 177, 138, ' : 'rgba(74, 107, 59, ';
      const lineColor = isDark ? 'rgba(163, 177, 138, ' : 'rgba(92, 114, 80, ';

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        // Draw node pulse if hub
        if (node.isHub) {
          const pulseRadius = node.radius + Math.sin(node.pulse) * 4 + 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(pulseRadius, 1), 0, Math.PI * 2);
          ctx.fillStyle = `${nodeColor}${0.12 + Math.sin(node.pulse) * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}${node.isHub ? '0.8)' : '0.45)'}`;
        ctx.fill();

        // Connect nearby nodes (route paths)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isDark ? 0.22 : 0.14);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = dist < 70 ? 1.2 : 0.6;
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

  const handleRoleSelect = (preset: RolePreset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword('password123');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ type: 'error', title: 'Validation Required', message: 'Corporate email is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, selectedRole);
      showToast({
        type: 'success',
        title: 'Clearance Approved',
        message: `Authenticated as ${ROLE_LABELS[selectedRole]}. Welcome to Mission Control.`
      });
      navigate('/dashboard');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Authentication Denied',
        message: err.message || 'Invalid credentials or role authorization.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePreset = ROLE_PRESETS.find(p => p.role === selectedRole) || ROLE_PRESETS[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden'
      }}
    >
      {/* Animated Route Particle Field Canvas */}
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
          opacity: 0.85
        }}
      />

      {/* Top Glass Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)'
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
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            T<span style={{ color: 'var(--color-beige-300)' }}>O</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Transit<span style={{ color: 'var(--color-olive-600)' }}>Ops</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transport Intelligence Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid var(--status-available-border)'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#38A169',
                boxShadow: '0 0 8px #38A169'
              }}
            />
            <span>Mission Control Live</span>
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
              cursor: 'pointer'
            }}
            title="Toggle theme mode"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </div>
      </header>

      {/* Main Landing & Authentication Gateway */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2.5rem 1.5rem 3.5rem'
        }}
      >
        <div style={{ maxWidth: '1100px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Animated Hero Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-olive-100)',
                color: 'var(--color-olive-800)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid var(--color-olive-300)'
              }}
            >
              <Cpu size={14} /> Production Fleet Operations & Telemetry Gateway
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.9rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                maxWidth: '850px',
                color: 'var(--text-primary)'
              }}
            >
              Autonomous Fleet Intelligence & <span style={{ color: 'var(--color-olive-600)' }}>Role-Based Mission Control</span>
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                maxWidth: '680px',
                lineHeight: 1.55
              }}
            >
              Select your authorized operational clearance below to enter the TransitOps enterprise control center.
              To switch roles at any time, log out of your session to return to this authorization gateway.
            </p>
          </div>

          {/* Role Selection & Login Gateway Split */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              alignItems: 'stretch'
            }}
          >
            {/* Left Column: 4 RBAC Role Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  1. Select Operational Role
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-600)', fontWeight: 700 }}>
                  4 Authorized Tiers
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ROLE_PRESETS.map(preset => {
                  const Icon = preset.icon;
                  const isSelected = selectedRole === preset.role;

                  return (
                    <div
                      key={preset.role}
                      onClick={() => handleRoleSelect(preset)}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-hover)',
                        border: `2px solid ${isSelected ? 'var(--color-olive-600)' : 'var(--border-subtle)'}`,
                        boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-normal)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: isSelected ? 'var(--color-olive-600)' : 'var(--color-olive-100)',
                              color: isSelected ? 'var(--color-beige-100)' : 'var(--color-olive-800)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {preset.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {preset.subtitle}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-olive-600)',
                              color: '#fff',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={12} /> Ready
                          </div>
                        )}
                      </div>

                      {/* Capabilities pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
                        {preset.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isSelected ? 'var(--color-olive-100)' : 'var(--bg-surface)',
                              color: isSelected ? 'var(--color-olive-900)' : 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Authentication Form Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  2. Operator Verification
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  TLS 1.3 Encrypted
                </span>
              </div>

              <div
                className="card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.4rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-medium)',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Active Selected Role Preview Banner */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-olive-100)',
                      border: '1px solid var(--color-olive-300)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <KeyRound size={20} color="var(--color-olive-800)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-olive-800)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Authenticating Profile
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-olive-900)' }}>
                        {activePreset.title}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Lock size={15} color="var(--color-olive-600)" /> Security Key / Password
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

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{
                        padding: '0.85rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginTop: '0.5rem',
                        gap: '0.6rem',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Activity size={18} className="animate-spin" /> Verifying Clearance...
                        </>
                      ) : (
                        <>
                          Authorize & Enter Mission Control <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Role Switcher Instruction Notice */}
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-hover)',
                    border: '1px dashed var(--border-medium)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.45,
                    textAlign: 'center'
                  }}
                >
                  🔒 <strong>Single Active Role Policy:</strong> Once inside, all modules are scoped strictly to your selected clearance. To change role, click <em>"Log Out / Switch Role"</em> inside the navigation bar to return here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Minimal Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-footer)'
        }}
      >
        <div>
          TransitOps Smart Logistics &copy; {new Date().getFullYear()} &bull; Production Release v2.4
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>ACID Dispatch Engine</span>
          <span>Prisma ORM</span>
          <span>RBAC Enforcement</span>
        </div>
      </footer>
    </div>
  );
};
