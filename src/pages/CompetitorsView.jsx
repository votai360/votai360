import React, { useState, useEffect } from 'react';
import { useConfig } from '../store/ConfigContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Target, Users, Zap, CheckCircle2, Circle, Edit3, Save, X, Plus, Database, GitMerge, Trash2, AlertCircle } from 'lucide-react';


export function CompetitorsView() {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState('nominatas'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newParty, setNewParty] = useState('');
  
  // FEDERAÇÕES PARTIDÁRIAS
  // Cada federação é um array de siglas de partidos que somam seus votos juntos
  const [federacoes, setFederacoes] = useState(() => {
    const saved = localStorage.getItem('votaai_federacoes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newFed, setNewFed] = useState({ partido1: '', partido2: '' });

  if (!config) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-text-secondary)' }}>
        Carregando inteligência de dados...
      </div>
    );
  }

  const addFederacao = () => {
    const p1 = newFed.partido1.toUpperCase().trim();
    const p2 = newFed.partido2.toUpperCase().trim();
    if (!p1 || !p2 || p1 === p2) return;
    const nova = [p1, p2];
    const atualizado = [...federacoes, nova];
    setFederacoes(atualizado);
    localStorage.setItem('votaai_federacoes', JSON.stringify(atualizado));
    setNewFed({ partido1: '', partido2: '' });
  };

  const removeFederacao = (idx) => {
    const atualizado = federacoes.filter((_, i) => i !== idx);
    setFederacoes(atualizado);
    localStorage.setItem('votaai_federacoes', JSON.stringify(atualizado));
  };

  // Resolve qual é o "grupo" de um partido (federação ou si mesmo)
  const getFederationKey = (partyName) => {
    for (const fed of federacoes) {
      if (fed.includes(partyName)) return fed.sort().join('+');
    }
    return partyName;
  };

  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('macae_full_nominata');
    return saved ? JSON.parse(saved) : [];
  });

  const [newCandForm, setNewCandForm] = useState({ name: '', party: '', votes: '' });

  useEffect(() => {
    localStorage.setItem('macae_full_nominata', JSON.stringify(candidates));
  }, [candidates]);



  const addCandidate = () => {
    if (!newCandForm.name || !newCandForm.party || !newCandForm.votes) return;
    const newCand = {
      id: Date.now(),
      name: newCandForm.name,
      party: newCandForm.party.toUpperCase(),
      votes2024: parseInt(newCandForm.votes),
      status: 'Novo',
      active: true
    };
    setCandidates([newCand, ...candidates]);
    setNewCandForm({ name: '', party: '', votes: '' });
  };

  const toggleCandidate = (id) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const changeParty = (id, party) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, party: party.toUpperCase() } : c));
    setEditingId(null);
  };

  const deleteCandidate = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      setCandidates(prev => prev.filter(c => c.id !== id));
    }
  };

  // Proteção contra dados nulos
  if (!config) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-text-secondary)' }}>
        Carregando inteligência de dados...
      </div>
    );
  }

  const userParty = (config.party || 'PARTIDO').toUpperCase();
  const userGoal = parseInt(config.vote_goal) || 1000;
  
  // SIMULADOR AVANÇADO
  const activeCandidates = candidates.filter(c => c.active);
  const totalVotesEst = parseInt(config.total_voters_city || 171182) * 0.8;
  const totalSeats = parseInt(config.seats_count) || 21;
  const qe = Math.round(totalVotesEst / totalSeats);

  // Agrupa candidatos por FEDERAÇÃO (se existir) ou partido individual
  const parties = activeCandidates.reduce((acc, curr) => {
    const key = getFederationKey(curr.party);
    const isFederation = key.includes('+');
    if (!acc[key]) acc[key] = { 
      name: key, 
      total: 0, 
      cands: [], 
      isFederation,
      partiesInFed: isFederation ? key.split('+') : [curr.party]
    };
    acc[key].total += curr.votes2024;
    acc[key].cands.push(curr);
    return acc;
  }, {});

  if (userParty && !parties[getFederationKey(userParty)]) {
    const key = getFederationKey(userParty);
    parties[key] = { name: key, total: 0, cands: [], isFederation: key.includes('+'), partiesInFed: key.split('+') };
  }
  
  if (userParty) {
    const key = getFederationKey(userParty);
    parties[key].total += userGoal;
    parties[key].cands.push({ name: `⭐ VOCÊ`, party: userParty, votes2024: userGoal, isUser: true });
  }

  // 1. Distribuição por Quociente Eleitoral (QE)
  let distributedSeats = 0;
  let partyResults = Object.values(parties).map(p => {
    const qeSeats = Math.floor(p.total / qe);
    distributedSeats += qeSeats;
    return { ...p, qeSeats, extraSeats: 0 };
  });

  // 2. Distribuição de Sobras (Cálculo de Médias)
  // Regra: Média = Total de Votos / (Vagas Obtidas + 1)
  while (distributedSeats < totalSeats) {
    let bestMedia = -1;
    let winningPartyIndex = -1;

    partyResults.forEach((p, idx) => {
      // Regra 2024/2028: Partidos precisam de 80% do QE para concorrer às sobras (simplificando aqui)
      const currentSeats = p.qeSeats + p.extraSeats;
      const media = p.total / (currentSeats + 1);
      
      if (media > bestMedia) {
        bestMedia = media;
        winningPartyIndex = idx;
      }
    });

    if (winningPartyIndex !== -1) {
      partyResults[winningPartyIndex].extraSeats += 1;
      distributedSeats += 1;
    } else {
      break; // Proteção
    }
  }

  const simulation = partyResults.map(p => {
    const totalPartySeats = p.qeSeats + p.extraSeats;
    const sorted = [...p.cands].sort((a, b) => b.votes2024 - a.votes2024);
    
    // Filtro de Cláusula de Barreira Individual
    // 10% do QE para vagas diretas e 20% para sobras. 
    // Para simplificar e garantir segurança, marcamos quem tem menos de 20%.
    const electedWithBarrier = sorted.slice(0, totalPartySeats).map(cand => ({
      ...cand,
      meetsBarrier: cand.votes2024 >= (qe * 0.20),
      isDirect: sorted.indexOf(cand) < p.qeSeats
    }));

    return { 
      ...p, 
      seats: totalPartySeats, 
      elected: electedWithBarrier,
      qe,
      nextSeatCost: Math.round((p.qeSeats + p.extraSeats + 1) * qe - p.total)
    };
  }).sort((a, b) => b.total - a.total);

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.party.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.votes2024 - a.votes2024);

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={24} color="var(--color-secondary)" /> 
          Estrategista {config.election_type === 'municipal' ? config.city : config.state} {config.election_type === 'municipal' ? '2028' : '2026'}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Monte sua nominata e simule o resultado</p>
      </header>

      <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('nominatas')} style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', color: activeTab === 'nominatas' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'nominatas' ? '2px solid var(--color-primary)' : 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Gestão de Nomes
        </button>
        <button onClick={() => setActiveTab('federacoes')} style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', color: activeTab === 'federacoes' ? '#8b5cf6' : 'var(--color-text-muted)', borderBottom: activeTab === 'federacoes' ? '2px solid #8b5cf6' : 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Federações {federacoes.length > 0 && <span style={{ backgroundColor: '#8b5cf6', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem', marginLeft: '4px' }}>{federacoes.length}</span>}
        </button>
        <button onClick={() => setActiveTab('projecao')} style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', color: activeTab === 'projecao' ? 'var(--color-secondary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'projecao' ? '2px solid var(--color-secondary)' : 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Projeção {config.election_type === 'federal' ? 'Federal' : config.election_type === 'estadual' ? 'Estadual' : 'Câmara'}
        </button>
      </div>

      {activeTab === 'nominatas' && (
        <div className="animate-in">
          {/* FORMULÁRIO DE CADASTRO */}
          <Card glass padding="1.25rem" style={{ marginBottom: '1.5rem', border: '1px solid rgba(var(--color-primary-rgb), 0.2)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} color="var(--color-primary)" /> Cadastrar Nova Liderança / Candidato
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <Input size="sm" placeholder="Nome de Urna" value={newCandForm.name} onChange={e => setNewCandForm({...newCandForm, name: e.target.value})} spellCheck="false" autoComplete="off" />
              <Input size="sm" placeholder="Partido" value={newCandForm.party} onChange={e => setNewCandForm({...newCandForm, party: e.target.value})} spellCheck="false" autoComplete="off" />
              <Input size="sm" type="number" placeholder="Votos" value={newCandForm.votes} onChange={e => setNewCandForm({...newCandForm, votes: e.target.value})} />
            </div>
            <Button size="sm" onClick={addCandidate} style={{ width: '100%', gap: '0.5rem' }}>
              <Plus size={16} /> Adicionar à Simulação
            </Button>
          </Card>

          {/* PAINEL DE FEDERAÇÕES */}
          <Card glass padding="1.25rem" style={{ marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitMerge size={16} color="#8b5cf6" /> Federações Ativas
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: 'auto' }}>Os votos dos partidos federados são somados para o QE</span>
            </h4>
            {federacoes.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.5rem' }}>Nenhuma federação cadastrada. Vá na aba "Federações" para criar.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {federacoes.map((fed, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '20px', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 'bold' }}>
                    <GitMerge size={12} /> {fed.join(' + ')}
                  </div>
                ))}
              </div>
            )}
          </Card>



          <Input placeholder="Buscar por nome ou partido..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} icon={<Search size={18} />} style={{ marginBottom: '1.5rem' }} />
        </div>
      )}

      {activeTab === 'federacoes' && (
        <div className="animate-in">
          <Card glass padding="1.5rem" style={{ marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitMerge size={18} color="#8b5cf6" /> Criar Nova Federação
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Na federação, os votos de ambos os partidos são somados para o cálculo do Quociente Eleitoral. As vagas conquistadas são distribuídas internamente pelos candidatos mais votados de qualquer partido da federação.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
              <Input size="sm" placeholder="Partido 1 (ex: PT)" value={newFed.partido1} onChange={e => setNewFed({...newFed, partido1: e.target.value.toUpperCase()})} spellCheck="false" autoComplete="off" />
              <div style={{ textAlign: 'center', color: '#8b5cf6', fontWeight: 'bold', fontSize: '1.2rem' }}>+</div>
              <Input size="sm" placeholder="Partido 2 (ex: PCdoB)" value={newFed.partido2} onChange={e => setNewFed({...newFed, partido2: e.target.value.toUpperCase()})} spellCheck="false" autoComplete="off" />
            </div>
            <Button size="sm" onClick={addFederacao} style={{ width: '100%', gap: '0.5rem', backgroundColor: '#8b5cf6', border: 'none' }}>
              <GitMerge size={16} /> Criar Federação
            </Button>
          </Card>

          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Federações Cadastradas ({federacoes.length})
          </h4>

          {federacoes.length === 0 ? (
            <Card glass padding="2rem" style={{ textAlign: 'center' }}>
              <GitMerge size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nenhuma federação cadastrada ainda.</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Use o formulário acima para criar a primeira.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {federacoes.map((fed, i) => (
                <Card key={i} glass padding="1rem" style={{ border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                      <GitMerge size={18} color="#8b5cf6" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>
                        {fed[0]} <span style={{ color: '#8b5cf6' }}>+</span> {fed[1]}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Votos somados para fins de QE</div>
                    </div>
                  </div>
                  <button onClick={() => removeFederacao(i)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                    <Trash2 size={16} />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'nominatas' && (
        <div className="animate-in" style={{ marginTop: '-1.5rem' }}>
          <Input placeholder="Buscar por nome ou partido..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} icon={<Search size={18} />} style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((comp) => (
              <Card key={comp.id} glass padding="1rem" style={{ opacity: comp.active ? 1 : 0.4, borderLeft: comp.active ? `4px solid ${comp.party === userParty ? 'var(--color-secondary)' : 'var(--color-primary)'}` : '4px solid #666' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div onClick={() => toggleCandidate(comp.id)} style={{ cursor: 'pointer' }}>
                        {comp.active ? <CheckCircle2 size={18} color="var(--color-primary)" /> : <Circle size={18} color="var(--color-text-muted)" />}
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{comp.name}</div>
                    </div>
                    {editingId === comp.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                        <Input size="sm" value={newParty} onChange={e => setNewParty(e.target.value)} placeholder="NOVO PARTIDO" spellCheck="false" autoComplete="off" />
                        <Button size="sm" onClick={() => changeParty(comp.id, newParty)}><Save size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X size={14} /></Button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{comp.party} • {comp.votes2024.toLocaleString()} votos</span>
                        <button onClick={() => { setEditingId(comp.id); setNewParty(comp.party); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Button variant="ghost" size="sm" onClick={() => toggleCandidate(comp.id)}>
                      {comp.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <button onClick={() => deleteCandidate(comp.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projecao' && (
        <div className="animate-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <Card glass padding="1rem">
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Quociente Eleitoral (QE)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{qe.toLocaleString()}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Votos para 1 vaga direta</div>
            </Card>
            <Card glass padding="1rem">
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Vagas em disputa</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{totalSeats}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                {config.election_type === 'municipal' ? `Câmara de ${config.city}` : `Assembleia de ${config.state}`}
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {simulation.map((party, i) => (
              <Card key={i} glass padding="1.25rem" style={{ borderLeft: party.name === userParty ? '4px solid var(--color-secondary)' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                {party.name === userParty && (
                  <Badge variant="primary" style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '0.6rem' }}>SEU PARTIDO</Badge>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{party.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total: {party.total.toLocaleString()} votos</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: party.seats > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{party.seats}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Vagas</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <span><strong style={{ color: 'var(--color-text-primary)' }}>{party.qeSeats}</strong> Diretas (QE)</span>
                  <span><strong style={{ color: 'var(--color-text-primary)' }}>{party.extraSeats}</strong> por Média (Sobra)</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {party.elected.map((cand, j) => (
                    <div key={j} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: 'var(--radius-md)', 
                      backgroundColor: cand.isUser ? 'rgba(var(--color-primary-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
                      border: !cand.meetsBarrier ? '1px dashed var(--color-danger)' : cand.isUser ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.85rem',
                      position: 'relative'
                    }}>
                      <span style={{ fontWeight: 'bold', color: cand.isUser ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{j + 1}º</span>
                      <span style={{ color: !cand.meetsBarrier ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}>{cand.name}</span>
                      <Badge variant="neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>{cand.votes2024.toLocaleString()}</Badge>
                      {!cand.meetsBarrier && (
                        <div title="Abaixo da Cláusula de Barreira (20% do QE)" style={{ color: 'var(--color-danger)', marginLeft: '0.25rem', display: 'flex', alignItems: 'center' }}>
                          <AlertCircle size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                  {party.seats === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Nenhum candidato eleito nesta projeção.</div>}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Próxima vaga estimada em:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>+{party.nextSeatCost.toLocaleString()} votos</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
