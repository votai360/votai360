import React from 'react';

export function Input({ label, error, className = '', ...props }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
    width: '100%',
  };

  const errorStyle = {
    fontSize: '0.75rem',
    color: 'var(--color-danger)',
    marginTop: '0.25rem',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label style={labelStyle}>{label}</label>}
      <input 
        style={inputStyle} 
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = 'var(--color-primary)';
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = 'var(--color-border)';
        }}
        {...props} 
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
