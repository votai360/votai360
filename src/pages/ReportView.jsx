import React, { useRef } from 'react';
import { useVoters } from '../store/VoterContext';
import { useConfig } from '../store/ConfigContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Printer, Download, Target, Users, MapPin, Calendar, FileText, TrendingUp } from 'lucide-react';

export function ReportView() {
  const { voters } = useVoters();
  const { config } = useConfig();
  const reportRef = useRef();

  if (!config || !voters) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-text-secondary)' }}>
        Gerando relatórios...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Processamento de Dados
  // Suporte para ambos os formatos (Banco de Dados e Código)
  const isStrong = (v) => v.supportLevel === 'strong' || v.support_level === 'strong';
  
  const supporters = voters.filter(isStrong).length;
  const total = voters.length;
  const progress = Math.min(Math.round((supporters / (parseInt(config.vote_goal) || 1000)) * 100), 100);

  const neighborhoodMap = {};
  voters.forEach(v => {
    if (!v.neighborhood) return;
    neighborhoodMap[v.neighborhood] = (neighborhoodMap[v.neighborhood] || 0) + 1;
  });
  const topNeighborhoods = Object.entries(neighborhoodMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>Relatórios Estratégicos</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Gere documentos prontos para impressão</p>
        </div>
        <Button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> Imprimir PDF
        </Button>
      </header>

      {/* ÁREA DO RELATÓRIO (O que será impresso) */}
      <div ref={reportRef} className="print-container" style={{ 
        backgroundColor: 'white', 
        color: '#1a1a1a', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        minHeight: '29.7cm', // A4
        width: '100%',
        maxWidth: '21cm',
        margin: '0 auto'
      }}>
        
        {/* HEADER DO RELATÓRIO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #10B981', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981', margin: 0, textTransform: 'uppercase' }}>VotAí 360</h1>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.2rem 0' }}>Inteligência e Gestão Política de Precisão</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{config.name || 'Candidato'}</h2>
            <p style={{ fontSize: '0.9rem', color: '#444', margin: '0.1rem 0' }}>{config.party} - {config.number}</p>
            <p style={{ fontSize: '0.75rem', color: '#888' }}>Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* RESUMO EXECUTIVO */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
            <FileText size={18} /> Resumo da Base Eleitoral
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Total Base</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{total}</div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0fdf4' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase' }}>Votos Fortes</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10B981' }}>{supporters}</div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Progresso Meta</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{progress}%</div>
            </div>
          </div>
        </section>

        {/* ANÁLISE DE TERRITÓRIOS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          <section>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
              <MapPin size={18} /> Top 5 Bairros (Presença)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#888', fontSize: '0.8rem' }}>Bairro</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 0', color: '#888', fontSize: '0.8rem' }}>Eleitores</th>
                </tr>
              </thead>
              <tbody>
                {topNeighborhoods.map(([name, count], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>{name}</td>
                    <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
              <TrendingUp size={18} /> Saúde da Campanha
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span>Fidelização (Apoiadores)</span>
                <span style={{ fontWeight: 'bold' }}>{Math.round((supporters/total)*100) || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(supporters/total)*100 || 0}%`, height: '100%', background: '#10B981' }} />
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
              O candidato possui uma taxa de conversão de {Math.round((supporters/total)*100) || 0}%. Recomenda-se focar no engajamento dos {total - supporters} eleitores neutros/frios para atingir a meta de {config.vote_goal} votos.
            </p>
          </section>
        </div>

        {/* PRÓXIMOS PASSOS (ESPAÇO PARA ANOTAÇÕES) */}
        <section style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Anotações da Coordenação:</h3>
          <div style={{ minHeight: '150px', border: '1px dashed #ccc', borderRadius: '8px', padding: '1rem' }}></div>
        </section>

        {/* RODAPÉ */}
        <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#aaa', margin: 0 }}>VotAí 360 - Plataforma de Inteligência Eleitoral</p>
          <p style={{ fontSize: '0.7rem', color: '#aaa', margin: '0.2rem 0' }}>Documento Interno e Confidencial</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background-color: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-container { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: none !important;
            padding: 0 !important;
          }
          @page { size: A4; margin: 2cm; }
          .container { padding: 0 !important; }
        }
      `}} />
    </div>
  );
}
