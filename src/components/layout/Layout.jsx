import { BottomNav } from './BottomNav';
import { useConfig } from '../../store/ConfigContext';
import { UserCircle, Settings, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingView } from '../../pages/PricingView';

export function Layout({ children }) {
  const { config, subscription } = useConfig();
  const navigate = useNavigate();

  // Lógica de Bloqueio (Paywall) Comercial
  // Admins e usuários com assinatura ativa têm acesso total.
  const isBlocked = subscription?.status === 'inactive' && !subscription?.isTrial && !subscription?.isAdmin;

  if (isBlocked) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', overflowY: 'auto' }}>
        <PricingView onSelectPlan={(plan) => alert(`Redirecionando para o checkout do plano: ${plan}`)} />
      </div>
    );
  }

  const layoutStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '80px',
  };

  const headerStyle = {
    backgroundColor: 'var(--color-primary)',
    padding: '0.75rem 1rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  };

  const brandingContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px'
  };

  const photoStyle = {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        {/* Placeholder para equilibrar o layout (espaço à esquerda) */}
        <div style={{ width: '40px' }} />

        {/* Branding Centralizado */}
        <div style={brandingContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {config.photo_url ? (
              <img src={config.photo_url} alt="Candidato" style={photoStyle} />
            ) : (
              <div style={{ ...photoStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <UserCircle size={24} color="#fff" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '800', lineHeight: 1 }}>
                {config.number || '00.000'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '600' }}>
                {config.name || 'Candidato'}
              </span>
            </div>
          </div>
          {config.slogan && (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {config.slogan}
            </span>
          )}
        </div>

        {/* Botão de Configurações à Direita */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {subscription?.isAdmin && (
            <button 
              onClick={() => navigate('/app/admin')}
              title="Painel Admin"
              style={{ 
                background: 'rgba(245, 158, 11, 0.2)', 
                border: '1px solid rgba(245,158,11,0.4)', 
                color: '#f59e0b', 
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={20} />
            </button>
          )}
          <button 
            onClick={() => navigate('/app/settings')}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: '#fff', 
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      <main style={{ flex: 1 }}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
