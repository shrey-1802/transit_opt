import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '128px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
            }}
          >
            {title}
          </span>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '0.35rem',
              fontFeatureSettings: '"tnum"',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-olive-100)',
            color: 'var(--color-olive-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.85rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
        }}
      >
        {trend ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600,
              color: trend.isPositive ? 'var(--color-olive-600)' : 'var(--status-critical-text)',
            }}
          >
            {trend.value}
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>{subtitle || 'Real-time telemetry'}</span>
        )}

        {badge && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-hover)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
