import React from 'react';
import { Card } from '../components/ui/Card';
import { useVoters } from '../store/VoterContext';
import { useConfig } from '../store/ConfigContext';
import { Users, UserPlus, TrendingUp, Heart, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export function Dashboard() {
  const { stats, voters } = useVoters();
  const { config } = useConfig();
  
  const voteGoal = parseInt(config.vote_goal) || 1000;
  const progressPercent = Math.min(Math.round((stats.strongSupporters / voteGoal) * 100), 100);

  const kpiGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const kpiValueStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    marginTop: '0.75rem',
    marginBottom: '0.25rem',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.05em',
  };

  const kpiLabelStyle = {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        displayColors: false,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748B', font: { family: "'Inter', sans-serif" } }
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.5)', borderDash: [5, 5] },
        ticks: { color: '#64748B', font: { family: "'Inter', sans-serif" } },
        beginAtZero: true,
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const chartData = {
    labels: ['1', '5', '10', '15', '20', '25', '30'],
    datasets: [
      {
        fill: true,
        label: 'Novos Eleitores',
        data: [12, 19, 35, 50, 80, 110, 150],
        borderColor: '#10B981',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#10B981',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Dashboard de Vitória</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Foco no resultado: {stats.strongSupporters} de {voteGoal} votos garantidos</p>
        </div>
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>RUMO À CÂMARA</span>
        </div>
      </header>

      {/* 🏆 VOTE GOAL PROGRESS */}
      <Card glass padding="1.25rem" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.05), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Progresso da Eleição</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #25D366, #3b82f6)',
              transition: 'width 1s ease-in-out'
            }} 
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
          Você precisa de mais <strong>{Math.max(0, voteGoal - stats.strongSupporters)}</strong> apoios fortes para garantir a eleição.
        </p>
      </Card>

      <div style={kpiGridStyle}>
        <Card padding="1.25rem" glass hover>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <Users size={22} color="var(--color-primary)" />
            </div>
          </div>
          <div style={kpiValueStyle}>{stats.totalVoters}</div>
          <div style={kpiLabelStyle}>Total Eleitores</div>
        </Card>
        
        <Card padding="1.25rem" glass hover>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <UserPlus size={22} color="#10B981" />
            </div>
          </div>
          <div style={kpiValueStyle}>+{stats.newToday}</div>
          <div style={kpiLabelStyle}>Novos Hoje</div>
        </Card>

        <Card padding="1.25rem" glass hover>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(245, 166, 35, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <TrendingUp size={22} color="#F5A623" />
            </div>
          </div>
          <div style={kpiValueStyle}>{stats.conversionRate}</div>
          <div style={kpiLabelStyle}>Taxa Conversão</div>
        </Card>

        <Card padding="1.25rem" glass hover>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <Heart size={22} color="#EF4444" />
            </div>
          </div>
          <div style={kpiValueStyle}>{stats.strongSupporters}</div>
          <div style={kpiLabelStyle}>Apoiadores Fortes</div>
        </Card>
      </div>

      <Card padding="1.5rem" glass style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Crescimento da Base (30 dias)</h3>
        <div style={{ height: '240px' }}>
          <Line options={chartOptions} data={chartData} />
        </div>
      </Card>
      
      <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Alertas Inteligentes</h3>
      <Card padding="1.25rem" glass hover style={{ borderLeft: '4px solid #F5A623', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <AlertCircle size={24} color="#F5A623" />
        <div>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Bairro Centro precisa de atenção</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Menos de 10 cadastros na última semana. Recomenda-se caminhada.</p>
        </div>
      </Card>
    </div>
  );
}
