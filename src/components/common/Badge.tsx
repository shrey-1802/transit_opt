import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'available' | 'ontrip' | 'inshop' | 'retired' | 'critical' | 'warning' | 'neutral' | 'olive';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'available':
        return {
          bg: 'var(--status-available-bg)',
          text: 'var(--status-available-text)',
          border: 'var(--status-available-border)',
          dotColor: 'var(--color-olive-500)',
        };
      case 'ontrip':
        return {
          bg: 'var(--status-ontrip-bg)',
          text: 'var(--status-ontrip-text)',
          border: 'var(--status-ontrip-border)',
          dotColor: 'var(--color-beige-600)',
        };
      case 'inshop':
        return {
          bg: 'var(--status-inshop-bg)',
          text: 'var(--status-inshop-text)',
          border: 'var(--status-inshop-border)',
          dotColor: '#C47828',
        };
      case 'retired':
        return {
          bg: 'var(--status-retired-bg)',
          text: 'var(--status-retired-text)',
          border: 'var(--status-retired-border)',
          dotColor: '#888888',
        };
      case 'critical':
        return {
          bg: 'var(--status-critical-bg)',
          text: 'var(--status-critical-text)',
          border: 'var(--status-critical-border)',
          dotColor: '#C93B2B',
        };
      case 'warning':
        return {
          bg: 'var(--status-warning-bg)',
          text: 'var(--status-warning-text)',
          border: 'var(--status-warning-border)',
          dotColor: '#B8860B',
        };
      case 'olive':
        return {
          bg: 'var(--color-olive-100)',
          text: 'var(--color-olive-800)',
          border: 'var(--color-olive-300)',
          dotColor: 'var(--color-olive-600)',
        };
      default:
        return {
          bg: 'var(--bg-surface-hover)',
          text: 'var(--text-secondary)',
          border: 'var(--border-subtle)',
          dotColor: 'var(--text-muted)',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        fontSize: size === 'sm' ? '0.72rem' : '0.78rem',
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: style.dotColor,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
};
