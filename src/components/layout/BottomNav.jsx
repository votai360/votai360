import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Map as MapIcon, Calendar, Target, ShieldCheck } from 'lucide-react';

export function BottomNav() {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '0.5rem 0',
    paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
    zIndex: 1000,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
  };

  const linkStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.65rem',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.25rem',
    transition: 'all 0.2s'
  };

  const getLinkStyle = ({ isActive }) => ({
    ...linkStyle,
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    transform: isActive ? 'translateY(-2px)' : 'none'
  });

  const iconProps = { size: 22, strokeWidth: 1.5 };

  return (
    <nav style={navStyle}>
      <NavLink to="/" style={getLinkStyle}>
        <LayoutDashboard {...iconProps} />
        <span>Resumo</span>
      </NavLink>
      <NavLink to="/voters" style={getLinkStyle}>
        <Users {...iconProps} />
        <span>Eleitores</span>
      </NavLink>
      <NavLink to="/strategy" style={getLinkStyle}>
        <Target {...iconProps} />
        <span>Estratégia</span>
      </NavLink>
      <NavLink to="/calendar" style={getLinkStyle}>
        <Calendar {...iconProps} />
        <span>Agenda</span>
      </NavLink>
      <NavLink to="/map" style={getLinkStyle}>
        <MapIcon {...iconProps} />
        <span>Mapa</span>
      </NavLink>
      <NavLink to="/team" style={getLinkStyle}>
        <ShieldCheck {...iconProps} />
        <span>Equipe</span>
      </NavLink>
    </nav>
  );
}
