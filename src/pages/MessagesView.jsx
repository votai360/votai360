import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageSquare, Send, Users, AlertCircle, BookOpen } from 'lucide-react';
import { useVoters } from '../store/VoterContext';

export function MessagesView() {
  const { voters } = useVoters();
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' ou 'scripts'
  const [message, setMessage] = useState('Olá {nome}, tudo bem? Gostaria de te convidar para conhecer nossas propostas para o bairro {bairro}!');
  const [audience, setAudience] = useState('all');

  const scripts = [
    {
      title: 'Apresentação Inicial',
      context: 'Para novos contatos ou abordagens de rua',
      text: 'Olá, sou voluntário da campanha do [Candidato]. Estamos passando no bairro {bairro} para ouvir as demandas dos moradores. O que você acha que mais precisa melhorar por aqui?'
    },
    {
      title: 'Pedido de Voto / Apoio',
      context: 'Para quem já demonstrou interesse',
      text: 'Oi {nome}, como conversamos antes, sua ajuda é fundamental. Podemos contar com seu apoio e de sua família para renovarmos nossa cidade?'
    },
    {
      title: 'Convite para Evento',
      context: 'Reuniões em casas ou comícios',
      text: 'Grande {nome}! Teremos uma reunião especial no bairro {bairro} nesta [Data] às [Hora]. Sua presença é muito importante para discutirmos o futuro da nossa região!'
    }
  ];

  // Filtra os eleitores com base na audiência selecionada
  const filteredVoters = voters.filter(v => {
    if (audience === 'all') return true;
    if (audience === 'strong_supporters') return v.supportLevel === 'strong';
    if (audience === 'leaders') return v.tags?.includes('liderança');
    return true;
  });

  const getWhatsAppLink = (phone, name, neighborhood) => {
    const personalizedMessage = message
      .replace(/{nome}/g, name)
      .replace(/{bairro}/g, neighborhood || 'região');
    
    // Remove caracteres não numéricos do telefone
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(personalizedMessage)}`;
  };

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Comunicação Estratégica</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Ferramentas para convencer e mobilizar</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setActiveTab('direct')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'direct' ? '3px solid var(--color-primary)' : '3px solid transparent', color: activeTab === 'direct' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Envio Direto
        </button>
        <button 
          onClick={() => setActiveTab('scripts')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'scripts' ? '3px solid var(--color-primary)' : '3px solid transparent', color: activeTab === 'scripts' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Scripts de Abordagem
        </button>
      </div>

      {activeTab === 'direct' ? (
        <div className="animate-in">
          <Card glass hover padding="1.5rem" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
              <Users size={20} color="var(--color-secondary)" /> 1. Escolha o Público
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Button variant={audience === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setAudience('all')}>Todos ({voters.length})</Button>
              <Button variant={audience === 'strong_supporters' ? 'primary' : 'outline'} size="sm" onClick={() => setAudience('strong_supporters')}>Apoiadores</Button>
              <Button variant={audience === 'leaders' ? 'primary' : 'outline'} size="sm" onClick={() => setAudience('leaders')}>Lideranças</Button>
            </div>
          </Card>

          <Card glass padding="1.5rem" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
              <MessageSquare size={20} color="var(--color-primary)" /> 2. Personalize sua Mensagem
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', outline: 'none', resize: 'none', fontSize: '0.95rem' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Use {'{nome}'} e {'{bairro}'} para personalizar automaticamente.</p>
          </Card>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>3. Lista de Envio ({filteredVoters.length})</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredVoters.map(voter => (
              <Card key={voter.id} glass padding="1rem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{voter.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{voter.phone} • {voter.neighborhood}</div>
                </div>
                <a href={getWhatsAppLink(voter.phone, voter.name, voter.neighborhood)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button size="sm" style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}>
                    <Send size={14} style={{ marginRight: '0.4rem' }} /> Enviar
                  </Button>
                </a>
              </Card>
            ))}
            {filteredVoters.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Nenhum eleitor neste grupo.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in" style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <BookOpen size={20} color="var(--color-primary)" />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>Escolha um roteiro para padronizar o discurso da sua equipe.</p>
          </div>
          
          {scripts.map((script, i) => (
            <Card key={i} glass padding="1.5rem" hover style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ color: 'var(--color-text-primary)', fontWeight: '700', fontSize: '1.1rem' }}>{script.title}</h4>
                <Badge variant="neutral">{script.context}</Badge>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem' }}>
                "{script.text}"
              </div>
              <Button 
                variant="primary" 
                style={{ width: '100%' }}
                onClick={() => {
                  setMessage(script.text);
                  setActiveTab('direct');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Copiar para Envio Direto
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
