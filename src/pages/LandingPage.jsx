import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Map, Target, ShieldCheck, 
  ArrowRight, Check, MessageCircle, 
  BarChart3, Calendar, Zap, Rocket 
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const whatsappNumber = '5522988129016';
  const whatsappUrl = (plan) => `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de saber mais sobre o plano ${plan} do VotAí 360.`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    { 
      title: 'Mapa de Calor Eleitoral', 
      desc: 'Visualize onde estão seus votos com precisão cirúrgica.',
      icon: <Map size={24} />
    },
    { 
      title: 'CRM de Eleitores', 
      desc: 'Gestão completa da sua base com histórico e tags.',
      icon: <Users size={24} />
    },
    { 
      title: 'Simulador de Quociente', 
      desc: 'Previsão real de cadeiras e estratégia de nominata.',
      icon: <Target size={24} />
    },
    { 
      title: 'Agenda de Campanha', 
      desc: 'Coordene eventos e equipe em tempo real.',
      icon: <Calendar size={24} />
    }
  ];

  const plans = [
    { 
      name: 'Vereador', 
      price: '59,90', 
      features: ['Até 5.000 Eleitores', 'Mapa de Calor', 'Gestão de Equipe', 'Suporte WhatsApp'],
      color: 'var(--color-primary)'
    },
    { 
      name: 'Deputados', 
      price: '100,00', 
      features: ['Eleitores Ilimitados', 'Simulador Avançado', 'Múltiplos Municípios', 'Suporte Prioritário'],
      color: '#2563EB',
      popular: true
    },
    { 
      name: 'Prefeitos', 
      price: '150,00', 
      features: ['Painel de Gestão Master', 'Inteligência Geográfica', 'API de Disparos', 'Consultoria VIP'],
      color: '#7C3AED'
    }
  ];

  return (
    <div style={{ 
      backgroundColor: '#000d1a', 
      color: '#fff', 
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 5%', position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'rgba(0, 13, 26, 0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <img src="/logo.png" alt="VotAí 360" style={{ height: '40px' }} />
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
          <a href="#precos" style={{ 
            backgroundColor: 'var(--color-primary)', color: '#fff', 
            padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-md)', 
            textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem'
          }}>Começar Agora</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 5% 4rem', textAlign: 'center', 
        position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)', zIndex: 0
        }} />

        <div className="animate-in" style={{ position: 'relative', zIndex: 1 }}>
          <Badge variant="primary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>
            <Zap size={14} style={{ marginRight: '0.5rem' }} /> Tecnologia para 2028
          </Badge>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '900', 
            lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-2px'
          }}>
            Vença as Eleições com <br />
            <span style={{ 
              background: 'linear-gradient(90deg, #4ade80, #16A34A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Inteligência de Dados</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', 
            maxWidth: '800px', margin: '0 auto 2.5rem', lineHeight: 1.6
          }}>
            Abandone as planilhas. Gerencie eleitores, coordene sua equipe e visualize seu crescimento com a plataforma política mais completa do Brasil.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={whatsappUrl('Geral')} style={{ 
              backgroundColor: 'var(--color-primary)', color: '#fff', 
              padding: '1.2rem 2.5rem', borderRadius: 'var(--radius-lg)', 
              textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              boxShadow: '0 10px 30px rgba(22,163,74,0.4)'
            }}>
              Quero Vencer em 2028 <ArrowRight size={20} />
            </a>
          </div>
        </div>

        {/* Mockup / Image */}
        <div style={{ marginTop: '5rem', position: 'relative' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: '24px',
            padding: '1rem', border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '1000px', margin: '0 auto', boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
          }}>
            <img src="/logo.png" alt="Dashboard Preview" style={{ width: '100%', borderRadius: '16px', filter: 'brightness(0.8)' }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '8rem 5%', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Tudo o que sua campanha precisa</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Funcionalidades desenvolvidas por especialistas em estratégia política.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} style={{ 
              padding: '2.5rem', borderRadius: '24px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.3s'
            }} className="hover-scale">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" style={{ padding: '8rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Planos Sob Medida</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Escolha o nível de inteligência que sua candidatura exige.</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          {plans.map((p, i) => (
            <div key={i} style={{ 
              padding: '3rem 2rem', borderRadius: '32px', 
              background: p.popular ? 'rgba(22,163,74,0.05)' : 'rgba(255,255,255,0.03)', 
              border: p.popular ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
              flex: '1', minWidth: '300px', maxWidth: '380px',
              position: 'relative'
            }}>
              {p.popular && <div style={{ 
                position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-primary)', padding: '0.4rem 1rem', 
                borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '800'
              }}>MAIS VENDIDO</div>}
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>{p.name}</h3>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.5rem', verticalAlign: 'top', marginRight: '4px' }}>R$</span>
                <span style={{ fontSize: '3.5rem', fontWeight: '900' }}>{p.price.split(',')[0]}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>,{p.price.split(',')[1]}/mês</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '3rem' }}>
                {p.features.map((f, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                    <Check size={18} color="var(--color-primary)" /> {f}
                  </li>
                ))}
              </ul>
              <a href={whatsappUrl(p.name)} style={{ 
                display: 'block', width: '100%', textAlign: 'center',
                padding: '1.2rem', borderRadius: '16px', textDecoration: 'none',
                backgroundColor: p.popular ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                color: '#fff', fontWeight: '800', transition: 'all 0.2s'
              }}>Assinar {p.name}</a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '8rem 5%', textAlign: 'center' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(37,99,235,0.1))',
          padding: '5rem 2rem', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.05)',
          maxWidth: '1000px', margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '2rem' }}>Pronto para ser o <br />próximo eleito?</h2>
          <a href={whatsappUrl('Final CTA')} style={{ 
            backgroundColor: '#fff', color: '#000', 
            padding: '1.2rem 3rem', borderRadius: 'var(--radius-lg)', 
            textDecoration: 'none', fontWeight: '800', fontSize: '1.2rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <MessageCircle size={22} /> Falar com Consultor no WhatsApp
          </a>
          <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            Atendimento imediato • Configuração em 24h
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <img src="/logo.png" alt="VotAí 360" style={{ height: '30px', marginBottom: '1.5rem', opacity: 0.5 }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
          © 2026 VotAí 360 - Todos os direitos reservados. <br />
          Desenvolvido para campanhas políticas de alto desempenho.
        </p>
      </footer>

      <style>{`
        html { scroll-behavior: smooth; }
        .hover-scale:hover { transform: translateY(-10px); background: rgba(255,255,255,0.06); border-color: rgba(22,163,74,0.3); }
        .animate-in { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          h1 { font-size: 2.8rem !important; }
          section { padding: 4rem 5% !important; }
        }
      `}</style>
    </div>
  );
}
