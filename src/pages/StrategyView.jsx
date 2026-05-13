import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Target, TrendingUp, Users, MapPin, CheckCircle2, AlertCircle, Zap, ArrowRight, ShieldAlert, Sparkles, FileText } from 'lucide-react';
import { useVoters } from '../store/VoterContext';
import { useConfig } from '../store/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { cityStats } from '../data/city_stats';

export function StrategyView() {
  const { voters } = useVoters();
  const { config } = useConfig();
  const navigate = useNavigate();
  
  // Estatísticas Reais
  const totalVoters = voters.length;
  // Suporte para ambos os formatos (Banco de Dados e Código)
  const isStrong = (v) => v.supportLevel === 'strong' || v.support_level === 'strong';
  const isNeutral = (v) => v.supportLevel === 'neutral' || v.support_level === 'neutral';

  const supporters = voters.filter(isStrong).length;
  const neutral = voters.filter(isNeutral).length;
  
  // Inteligência de Metas Automáticas
  const stats = cityStats[config.city?.toUpperCase()] || null;
  const suggestedGoal = stats ? Math.round(stats.voters / stats.seats * 0.1) : 1000; // Regra de bolso: 10% do QE médio
  
  // Meta Real do Candidato
  const voteGoal = parseInt(config.vote_goal) || suggestedGoal;
  const progress = Math.min(Math.round((supporters / voteGoal) * 100), 100);
 
  // Análise Territorial Dinâmica
  const territorialData = useMemo(() => {
    const neighborhoodMap = {};
    
    voters.forEach(v => {
      if (!v.neighborhood) return;
      if (!neighborhoodMap[v.neighborhood]) {
        neighborhoodMap[v.neighborhood] = { name: v.neighborhood, current: 0, total: 0 };
      }
      neighborhoodMap[v.neighborhood].total += 1;
      if (isStrong(v)) {
        neighborhoodMap[v.neighborhood].current += 1;
      }
    });

    const neighborhoods = Object.values(neighborhoodMap);
    const targetPerNeighborhood = Math.round(voteGoal / (neighborhoods.length || 1));

    return neighborhoods.map(n => ({
      ...n,
      target: targetPerNeighborhood,
      pct: Math.round((n.current / targetPerNeighborhood) * 100) || 0
    })).sort((a, b) => b.current - a.current);
  }, [voters, voteGoal]);

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Dashboard de Vitória</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Estratégia baseada em dados reais</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/app/competitors')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }}>
          <ShieldAlert size={16} /> Nominatas
        </Button>
      </header>

      {/* 🎯 CARD DE META PRINCIPAL */}
      <Card glass padding="1.5rem" style={{ marginBottom: '1.5rem', border: '1px solid rgba(var(--color-primary-rgb), 0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Target size={120} color="var(--color-primary)" />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Quociente Eleitoral</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Progresso rumo à cadeira na Câmara</p>
          </div>
          {stats ? (
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <Sparkles size={14} color="#fbbf24" />
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 'bold' }}>Dados de {config.city}</span>
            </div>
          ) : <Zap size={24} color="#fbbf24" fill="#fbbf24" />}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Apoiadores: <strong>{supporters}</strong></span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Meta: {voteGoal}</span>
          </div>
          <div style={{ width: '100%', height: '14px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '7px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{progress}% atingido</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Faltam {voteGoal - supporters} votos</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Indecisos (Neutros)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{neutral}</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Lideranças Ativas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10B981' }}>{voters.filter(v => v.tags?.includes('liderança')).length}</div>
          </div>
        </div>
      </Card>

      {/* 📊 ANÁLISE DE NOMINATA */}
      <Card glass padding="1.5rem" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-secondary)' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="var(--color-secondary)" /> Simulador de Força da Nominata
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          {stats ? (
            `Em ${config.city}, o Quociente Eleitoral estimado é de ${Math.round(stats.voters / stats.seats)} votos. Com ${stats.seats} vagas em disputa, a concorrência será alta.`
          ) : (
            `Em ${config.election_type === 'municipal' ? config.city : config.state}, o peso do seu partido define sua segurança. Com ${config.seats_count || 21} vagas em disputa, a concorrência interna e a cláusula de barreira são os maiores desafios.`
          )}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>LEVE</div>
            <div style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>~800-2k</div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-secondary)', textAlign: 'center', backgroundColor: 'rgba(245, 166, 35, 0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>MÉDIA</div>
            <div style={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>~3k-8k</div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>PESADA</div>
            <div style={{ fontWeight: 'bold', color: '#ef4444' }}>+15k</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
          <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.5rem' }}>📌 Inteligência de Campo ({config.election_type === 'municipal' ? config.city : config.state}):</strong>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Cláusula de Barreira:</strong> Você precisa de no mínimo {Math.round(voteGoal * 0.1) || 100} votos para ser elegível individualmente (10% do QE).</li>
            <li><strong>Sobra (Média):</strong> Com a nova regra 80/20, o partido precisa de fôlego coletivo para não perder a vaga.</li>
          </ul>
        </div>
      </Card>

      {/* 🚀 AÇÕES DE IMPACTO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <Card glass hover padding="1rem" style={{ borderLeft: '4px solid #fbbf24', cursor: 'pointer' }} onClick={() => navigate('/app/voters')}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '0.6rem', borderRadius: '50%' }}>
              <TrendingUp size={20} color="#fbbf24" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Converter Indecisos</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{neutral} eleitores neutros.</div>
            </div>
            <ArrowRight size={16} color="var(--color-text-muted)" />
          </div>
        </Card>

        <Card glass hover padding="1rem" style={{ borderLeft: '4px solid #10B981', cursor: 'pointer' }} onClick={() => navigate('/app/messages')}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '50%' }}>
              <Users size={20} color="#10B981" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Mobilizar Lideranças</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{voters.filter(v => v.tags?.includes('liderança')).length} líderes ativos.</div>
            </div>
            <ArrowRight size={16} color="var(--color-text-muted)" />
          </div>
        </Card>
      </div>

      {/* 📊 TERRITÓRIOS DINÂMICOS */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
        Dominação Territorial ({config.election_type === 'municipal' ? config.city : config.state})
      </h3>
      <Card glass padding="0" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-text-secondary)' }}>
                {config.election_type === 'municipal' ? 'Bairro / Região' : 'Cidade / Regional'}
              </th>
              <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-secondary)' }}>Total Base</th>
              <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-secondary)' }}>Meta (Votos)</th>
              <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--color-text-secondary)' }}>Real (%)</th>
            </tr>
          </thead>
          <tbody>
            {territorialData.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Cadastre eleitores com bairro para ver a análise territorial.
                </td>
              </tr>
            ) : territorialData.map((reg, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>{reg.name}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{reg.total}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{reg.target}</div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: reg.pct > 50 ? 'var(--color-success)' : reg.pct > 20 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                    {reg.pct}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
