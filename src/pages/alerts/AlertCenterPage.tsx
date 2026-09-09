import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';
import { alertsService } from '../../api/alertsService';
import { Alert, AlertSeverity } from '../../types/alert';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const AlertCenterPage: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await alertsService.getAlerts();
      setAlerts(data);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsService.markAsRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesUnread = !unreadOnly || !a.isRead;
    return matchesSeverity && matchesUnread;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Mission Control Alert Center</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Centralized notification feed for license expirations, vehicle service milestones, and policy security triggers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-control"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as any)}
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={e => setUnreadOnly(e.target.checked)}
            />
            <span>Unread Only</span>
          </label>
        </div>
      </div>

      {/* Alert Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Polling Mission Control Feed...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            All systems nominal. Zero active alerts match your filter.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="card"
              style={{
                padding: '1.15rem 1.5rem',
                borderLeft: `4px solid ${
                  alert.severity === 'critical'
                    ? '#C93B2B'
                    : alert.severity === 'warning'
                    ? '#C47828'
                    : 'var(--color-olive-600)'
                }`,
                backgroundColor: alert.isRead ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: alert.severity === 'critical' ? 'var(--status-critical-bg)' : alert.severity === 'warning' ? 'var(--status-warning-bg)' : 'var(--color-olive-100)',
                    color: alert.severity === 'critical' ? 'var(--status-critical-text)' : alert.severity === 'warning' ? 'var(--status-warning-text)' : 'var(--color-olive-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {alert.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {alert.title}
                    </span>
                    <Badge variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'olive'} size="sm">
                      {alert.severity}
                    </Badge>
                    {!alert.isRead && (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C93B2B' }} />
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '800px' }}>
                    {alert.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {alert.timestamp.replace('T', ' ').substring(0, 16)} UTC
                    </span>
                    {alert.relatedEntityType && (
                      <span>Domain: {alert.relatedEntityType.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {alert.actionUrl && (
                  <NavLink to={alert.actionUrl} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', gap: '0.3rem' }}>
                    {alert.actionLabel || 'Investigate'} <ExternalLink size={13} />
                  </NavLink>
                )}

                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="btn btn-ghost"
                    style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
                    title="Mark Read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
