import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ShieldCheck, Users, CheckCircle2, XCircle, 
  Clock, Crown, Zap, Target, Star, AlertCircle,
  RefreshCw, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useConfig } from '../store/ConfigContext';
import { useNavigate } from 'react-router-dom';

const PLAN_LABELS = {
  free:        { label: 'Sem Plano',   color: '#6b7280', icon: <Clock size={14} /> },
  vereador:    { label: 'Vereador',    color: 'var(--color-primary)', icon: <Target size={14} /> },
  deputado:    { label: 'Legislativo', color: '#8b5cf6', icon: <Zap size={14} /> },
  majoritario: { label: 'Majoritário', color: 'var(--color-secondary)', icon: <Star size={14} /> },
  master:      { label: 'Master',      color: '#f59e0b', icon: <Crown size={14} /> },
};

export function AdminView() {
  const { subscription } = useConfig();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // Redireciona se não for admin
  useEffect(() => {
    if (!subscription?.isAdmin) {
      navigate('/');
    }
  }, [subscription]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          role,
          created_at,
          subscriptions (
            id,
            plan_type,
            status,
            current_period_end,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activateSubscription = async (userId, planType) => {
    setUpdating(userId);
    try {
      // Calcula vencimento: 30 dias a partir de hoje
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      await fetchUsers();
      alert(`✅ Acesso liberado com sucesso!`);
    } catch (err) {
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const revokeSubscription = async (userId) => {
    if (!confirm('Tem certeza que deseja revogar o acesso deste usuário?')) return;
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      await fetchUsers();
      alert('🚫 Acesso revogado.');
    } catch (err) {
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const totalAtivos = users.filter(u => u.subscriptions?.[0]?.status === 'active').length;
  const totalPendentes = users.filter(u => u.subscriptions?.[0]?.status !== 'active').length;

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="#f59e0b" /> Painel do Administrador
          </h2>
          <Button size="sm" variant="ghost" onClick={fetchUsers} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Atualizar
          </Button>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Gerencie os acessos dos candidatos ao VotAí 360</p>
      </header>

      {/* MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <Card glass padding="1rem" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>{users.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Cadastrados</div>
        </Card>
        <Card glass padding="1rem" style={{ textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ativos</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10B981' }}>{totalAtivos}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Com acesso</div>
        </Card>
        <Card glass padding="1rem" style={{ textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pendentes</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444' }}>{totalPendentes}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Aguardando</div>
        </Card>
      </div>

      {/* LISTA DE USUÁRIOS */}
      {loading ? (
        <Card glass padding="2rem" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Carregando usuários...
        </Card>
      ) : users.length === 0 ? (
        <Card glass padding="2rem" style={{ textAlign: 'center' }}>
          <Users size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum usuário cadastrado ainda.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((user) => {
            const sub = user.subscriptions?.[0];
            const isActive = sub?.status === 'active';
            const plan = PLAN_LABELS[sub?.plan_type || 'free'];
            const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('pt-BR') : null;

            return (
              <Card key={user.id} glass padding="1.25rem" style={{
                borderLeft: `4px solid ${isActive ? '#10B981' : '#ef4444'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  {/* INFO DO USUÁRIO */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isActive ? <CheckCircle2 size={18} color="#10B981" /> : <XCircle size={18} color="#ef4444" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Mail size={11} /> Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem',
                        backgroundColor: `${plan.color}15`, color: plan.color, fontWeight: 'bold'
                      }}>
                        {plan.icon} {plan.label}
                      </div>
                      {isActive && periodEnd && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Vence em {periodEnd}
                        </div>
                      )}
                      {!isActive && (
                        <div style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertCircle size={12} /> Aguardando ativação
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                    {!isActive ? (
                      <>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Liberar como:</div>
                        {['vereador', 'deputado', 'majoritario'].map(planId => (
                          <Button
                            key={planId}
                            size="sm"
                            disabled={updating === user.id}
                            onClick={() => activateSubscription(user.id, planId)}
                            style={{ 
                              fontSize: '0.75rem', 
                              backgroundColor: PLAN_LABELS[planId].color,
                              border: 'none',
                              opacity: updating === user.id ? 0.6 : 1
                            }}
                          >
                            {updating === user.id ? '...' : PLAN_LABELS[planId].label}
                          </Button>
                        ))}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updating === user.id}
                        onClick={() => revokeSubscription(user.id)}
                        style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.8rem' }}
                      >
                        {updating === user.id ? 'Aguarde...' : '🚫 Revogar Acesso'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
