import React, { useState } from 'react';
import { useTeam } from '../store/TeamContext';
import { useVoters } from '../store/VoterContext';
import { useConfig } from '../store/ConfigContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Users, UserPlus, CheckCircle, Clock, CheckSquare, Trophy, Trash2 } from 'lucide-react';

export function TeamView() {
  const { team, tasks, addMember, addTask, updateTaskStatus, deleteMember } = useTeam();
  const { addVoter } = useVoters();
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState('members');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Forms
  const [memberForm, setMemberForm] = useState({ name: '', phone: '', area: '', cep: '', role: 'volunteer', voters_count: 0 });
  const [taskForm, setTaskForm] = useState({ title: '', assignedTo: '', deadline: '' });

  // Ranking
  const rankedTeam = [...team].sort((a, b) => (b.voters_count || 0) - (a.voters_count || 0));
  const topThree = rankedTeam.slice(0, 3);

  const getCoordinates = async (neighborhood, cep) => {
    try {
      const city = config.city || '';
      const state = config.state || '';
      let query = `${neighborhood}, ${city}, ${state}, Brasil`;

      // 1. Tenta ViaCEP para precisão total
      if (cep && cep.replace(/\D/g, '').length === 8) {
        try {
          const viaCepRes = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
          const viaCepData = await viaCepRes.json();
          if (!viaCepData.erro) {
            query = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
          }
        } catch (err) {
          console.warn("ViaCEP offline");
        }
      }

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error("Erro ao geocodificar", e);
    }
    return null;
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    
    // Buscar coordenadas pelo CEP antes de salvar
    const coords = await getCoordinates(memberForm.area, memberForm.cep);
    
    const result = await addMember({
      ...memberForm,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lon : null
    });

    if (result.success) {
      // Automação: Adicionar também à lista de eleitores com as coordenadas
      await addVoter({
        name: memberForm.name,
        phone: memberForm.phone,
        neighborhood: memberForm.area || 'Equipe',
        cep: memberForm.cep,
        support_level: 'strong',
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lon : null,
        tags: ['Membro da Equipe', memberForm.role === 'coordinator' ? 'Coordenador' : 'Voluntário']
      });

      setIsMemberModalOpen(false);
      setMemberForm({ name: '', phone: '', area: '', cep: '', role: 'volunteer', voters_count: 0 });
      alert(`Sucesso! ${memberForm.name} agora faz parte da sua equipe e do seu mapa de calor.`);
    } else {
      alert('Erro ao adicionar membro: ' + result.error);
    }
  };

  const handleDeleteMember = (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}" da equipe?`)) {
      deleteMember(id);
    }
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    addTask(taskForm);
    setIsTaskModalOpen(false);
    setTaskForm({ title: '', assignedTo: '', deadline: '' });
  };

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
            <Users size={24} color="var(--color-primary)" /> 
            Gestão de Equipe
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Coordene seus cabos eleitorais e voluntários
          </p>
        </div>
      </header>

      {/* 🏆 RANKING DE LIDERANÇA */}
      {activeTab === 'members' && (
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="#fbbf24" /> Top Mobilizadores
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {topThree.map((member, i) => (
              <Card key={member.id} glass padding="1rem" style={{ textAlign: 'center', border: i === 0 ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                  {member.voters_count || 0}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Votos</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setActiveTab('members')}
          style={{ 
            padding: '0.75rem 1rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'members' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'members' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'members' ? '700' : '500',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Membros ({team.length})
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{ 
            padding: '0.75rem 1rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'tasks' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'tasks' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'tasks' ? '700' : '500',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Tarefas Ativas
        </button>
      </div>

      {activeTab === 'members' ? (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Button size="md" onClick={() => setIsMemberModalOpen(true)}>
              <UserPlus size={18} style={{ marginRight: '0.5rem' }} /> Novo Membro
            </Button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {team.map(member => (
              <Card key={member.id} glass hover padding="1.25rem">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{member.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                      CEP: <strong style={{ color: 'var(--color-text-primary)' }}>{member.cep || 'Não informado'}</strong> • Contato: {member.phone}
                    </p>
                    {member.cep && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        CEP: {member.cep}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={member.role === 'coordinator' ? 'primary' : 'neutral'}>
                      {member.role === 'coordinator' ? 'Coordenador' : 'Voluntário'}
                    </Badge>
                    <button 
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem' }}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Button size="md" onClick={() => setIsTaskModalOpen(true)}>
              <CheckSquare size={18} style={{ marginRight: '0.5rem' }} /> Nova Tarefa
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {tasks.map(task => {
              const assignedUser = team.find(m => m.id === task.assignedTo);
              return (
                <Card key={task.id} glass hover padding="1.25rem" style={{ borderLeft: `4px solid ${task.status === 'done' ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                        {task.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        Responsável: <strong style={{ color: 'var(--color-text-primary)' }}>{assignedUser ? assignedUser.name : 'Não atribuído'}</strong> • Prazo: {task.deadline}
                      </p>
                    </div>
                    
                    {task.status !== 'done' ? (
                      <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'done')} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: '2px solid var(--color-success)', color: 'var(--color-success)' }}>
                        <CheckCircle size={16} style={{ marginRight: '0.25rem' }} /> Concluir
                      </Button>
                    ) : (
                      <Badge variant="supporter" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Concluída</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Membro */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Cadastrar Novo Membro">
        <form onSubmit={handleMemberSubmit} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Nome" required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="WhatsApp" required value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} />
            <Input label="CEP (Opcional)" placeholder="Ex: 28000-000" value={memberForm.cep} onChange={e => setMemberForm({...memberForm, cep: e.target.value})} />
          </div>
          <Input label="Região de Atuação" required value={memberForm.area} onChange={e => setMemberForm({...memberForm, area: e.target.value})} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Função</label>
            <select 
              value={memberForm.role}
              onChange={e => setMemberForm({...memberForm, role: e.target.value})}
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-fast)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            >
              <option value="volunteer">Voluntário / Cabo Eleitoral</option>
              <option value="coordinator">Coordenador de Área</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsMemberModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tarefa */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Nova Tarefa">
        <form onSubmit={handleTaskSubmit} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Descrição da Tarefa" required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Responsável</label>
            <select 
              required
              value={taskForm.assignedTo}
              onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-fast)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            >
              <option value="">Selecione um membro...</option>
              {team.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <Input label="Prazo (ex: Hoje, Amanhã, 15/10)" required value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Tarefa</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
