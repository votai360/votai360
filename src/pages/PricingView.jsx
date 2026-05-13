import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, Zap, Target, Star, ShieldCheck, CreditCard } from 'lucide-react';
import { redirectToCheckout } from '../lib/mercadopago';

export function PricingView({ onSelectPlan }) {
  const plans = [
    {
      id: 'vereador',
      name: 'Plano Vereador',
      price: '59,90',
      period: '/mês',
      description: 'Ideal para pré-candidatos e vereadores em mandato municipal.',
      features: [
        'Até 5.000 Eleitores',
        'CRM Político Completo',
        'Simulador de Nominata 2028',
        'Mapas de Calor (Bairros)',
        'Suporte via WhatsApp'
      ],
      icon: <Target size={24} color="var(--color-primary)" />,
      color: 'var(--color-primary)'
    },
    {
      id: 'deputado',
      name: 'Plano Legislativo',
      price: '100,00',
      period: '/mês',
      description: 'Focado em Deputados Estaduais e Federais (Cenário 2026).',
      featured: true,
      features: [
        'Eleitores Ilimitados',
        'Inteligência Estadual/Federal',
        'Simulador de Sobras 80/20',
        'Geolocalização Avançada',
        'Multi-usuários (Equipe)',
        'Relatórios de Campo'
      ],
      icon: <Zap size={24} color="#8b5cf6" />,
      color: '#8b5cf6'
    },
    {
      id: 'majoritario',
      name: 'Plano Majoritário',
      price: '150,00',
      period: '/mês',
      description: 'Para Prefeitos, Governadores, Senadores e Presidente.',
      features: [
        'Tudo do Plano Legislativo',
        'Dashboard de Gestão de Crise',
        'Análise de Sentimento',
        'Monitoramento de Obras/Pedidos',
        'Consultoria de Dados Eleitorais',
        'Segurança LGPD Enterprise'
      ],
      icon: <Star size={24} color="var(--color-secondary)" />,
      color: 'var(--color-secondary)'
    }
  ];

  return (
    <div className="container animate-in" style={{ padding: '2rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Badge variant="primary" style={{ marginBottom: '1rem' }}>SaaS VOTAAÍ 360</Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '-0.05em' }}>
          Escolha o Plano para sua <span style={{ color: 'var(--color-primary)' }}>Vitória</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Tecnologia de ponta para organizar sua base, dominar o território e garantir sua cadeira nas próximas eleições.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            glass 
            padding="2rem" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              border: plan.featured ? `2px solid ${plan.color}` : '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              transform: plan.featured ? 'scale(1.05)' : 'none',
              zIndex: plan.featured ? 1 : 0
            }}
          >
            {plan.featured && (
              <div style={{ 
                position: 'absolute', 
                top: '-15px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                backgroundColor: plan.color, 
                color: 'white', 
                padding: '0.25rem 1rem', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                boxShadow: `0 4px 15px ${plan.color}66`
              }}>
                RECOMENDADO
              </div>
            )}

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: `${plan.color}15`, borderRadius: 'var(--radius-md)' }}>
                {plan.icon}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{plan.name}</h2>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>R$</span>
                <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>{plan.price}</span>
                <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>{plan.description}</p>
            </div>

            <div style={{ flex: 1, marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>O que está incluso:</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    <div style={{ color: plan.color }}>
                      <Check size={18} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              size="lg" 
              style={{ backgroundColor: plan.color, border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => redirectToCheckout(plan.id)}
            >
              <CreditCard size={18} /> Assinar via Mercado Pago
            </Button>
          </Card>
        ))}
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} /> 
          Pagamento 100% Seguro • Criptografia SSL • Cancelamento Fácil
        </div>
        <img src="https://vortex-storage.s3.amazonaws.com/payment-methods.png" alt="Métodos de Pagamento" style={{ height: '30px', opacity: 0.5 }} />
      </footer>
    </div>
  );
}

function Badge({ children, variant, style }) {
  return (
    <span style={{ 
      padding: '0.4rem 1rem', 
      borderRadius: '20px', 
      fontSize: '0.75rem', 
      fontWeight: 'bold', 
      backgroundColor: variant === 'primary' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
      color: variant === 'primary' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
      ...style
    }}>
      {children}
    </span>
  );
}
