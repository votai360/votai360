import React from 'react';

export function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variants = {
    cold: { bg: '#F3F4F6', color: '#4B5563' }, // Gray
    neutral: { bg: '#FEF3C7', color: '#D97706' }, // Yellow/Warning
    supporter: { bg: '#D1FAE5', color: '#059669' }, // Green/Primary
    strong: { bg: '#10B981', color: '#FFFFFF' }, // Solid Green
    primary: { bg: '#E0E7FF', color: '#2563EB' }, // Blue/Secondary
  };

  const currentVariant = variants[variant] || variants.neutral;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: currentVariant.bg,
    color: currentVariant.color,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <span style={style} className={`badge ${className}`} {...props}>
      {children}
    </span>
  );
}
