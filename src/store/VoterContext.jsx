import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VoterContext = createContext();

const mockVoters = [
  { id: '1', name: 'João Silva', phone: '11999999999', neighborhood: 'Centro', supportLevel: 'strong', latitude: -23.550520, longitude: -46.633308, created_at: new Date().toISOString(), interaction_score: 80, influence_radius: 5, key_issue: 'Saúde' },
  { id: '2', name: 'Maria Souza', phone: '11988888888', neighborhood: 'Vila Mariana', supportLevel: 'supporter', latitude: -23.589885, longitude: -46.632483, created_at: new Date().toISOString(), interaction_score: 60, influence_radius: 2, key_issue: 'Segurança' },
  { id: '3', name: 'Pedro Costa', phone: '11977777777', neighborhood: 'Pinheiros', supportLevel: 'neutral', latitude: -23.561414, longitude: -46.697520, created_at: new Date().toISOString(), interaction_score: 30, influence_radius: 0, key_issue: 'Educação' },
  { id: '4', name: 'Ana Clara', phone: '11966666666', neighborhood: 'Mooca', supportLevel: 'cold', latitude: -23.556488, longitude: -46.598687, created_at: new Date(Date.now() - 86400000).toISOString(), interaction_score: 55, influence_radius: 0, key_issue: 'Saúde' },
  { id: '5', name: 'Lucas Santos', phone: '11955555555', neighborhood: 'Centro', supportLevel: 'neutral', latitude: -23.548900, longitude: -46.638800, created_at: new Date(Date.now() - 172800000).toISOString(), interaction_score: 40, influence_radius: 1, key_issue: 'Asfalto' }
];

export function VoterProvider({ children }) {
  const [voters, setVoters] = useState([]);
  const [stats, setStats] = useState({
    totalVoters: 0,
    newToday: 0,
    conversionRate: '0%',
    strongSupporters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função de busca (declarada antes do uso)
  const fetchVoters = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVoters([]);
        return;
      }

      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoters(data || []);
    } catch (error) {
      console.warn('Erro ao buscar eleitores:', error.message);
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  // Busca dados iniciais
  useEffect(() => {
    fetchVoters();
  }, []);

  // Calcula estatísticas sempre que voters atualizar
  useEffect(() => {
    if (voters.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newTodayCount = voters.filter(v => v.created_at && v.created_at.startsWith(todayStr)).length;
      
      const isStrong = (v) => v.supportLevel === 'strong' || v.support_level === 'strong';
      const isSupporter = (v) => v.supportLevel === 'supporter' || v.support_level === 'supporter' || isStrong(v);

      const strongCount = voters.filter(isStrong).length;
      const supporterCount = voters.filter(isSupporter).length;
      
      const leaderCount = voters.filter(v => v.tags?.includes('liderança') || v.tags?.includes('Equipe')).length;
      const conversion = Math.round((supporterCount / voters.length) * 100) || 0;

      setStats({
        totalVoters: voters.length,
        newToday: newTodayCount,
        conversionRate: `${conversion}%`,
        strongSupporters: strongCount,
        totalLeaders: leaderCount,
      });
    }
  }, [voters]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchVoters();
      } else if (event === 'SIGNED_OUT') {
        setVoters([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addVoter = async (voterData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const voterWithUser = { ...voterData, user_id: user.id };
      
      const { data, error } = await supabase
        .from('voters')
        .insert([voterWithUser])
        .select();

      if (error) throw error;
      
      if (data) {
        setVoters(prev => [data[0], ...prev]);
      }
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar eleitor:', error);
      return { success: false, error: error.message };
    }
  };

  const updateVoter = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('voters')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        setVoters(prev => prev.map(v => v.id === id ? data[0] : v));
      }
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar eleitor:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteVoter = async (id) => {
    try {
      const { error } = await supabase
        .from('voters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVoters(prev => prev.filter(v => v.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir eleitor:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <VoterContext.Provider value={{
      voters,
      stats,
      loading,
      error,
      addVoter,
      updateVoter,
      deleteVoter,
      refreshVoters: fetchVoters
    }}>
      {children}
    </VoterContext.Provider>
  );
}

export function useVoters() {
  const context = useContext(VoterContext);
  if (!context) {
    throw new Error('useVoters deve ser usado dentro de um VoterProvider');
  }
  return context;
}
