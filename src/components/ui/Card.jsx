import React from 'react';

export function Card({ children, className = '', padding = '1.5rem', glass = false, hover = false, ...props }) {
  const style = {
    backgroundColor: glass ? 'var(--glass-bg)' : 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: glass ? '1px solid var(--glass-border)' : '1px solid var(--color-border)',
    padding: padding,
    boxShadow: 'var(--shadow-md)',
    backdropFilter: glass ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: glass ? 'blur(12px)' : 'none',
  };

  const hoverClass = hover ? 'hover-scale' : '';

  return (
    <div style={style} className={`card ${hoverClass} animate-in ${className}`} {...props}>
      {children}
    </div>
  );
}
