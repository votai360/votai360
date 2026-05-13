import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTeam([]);
        return;
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setTeam(data || []);
    } catch (err) {
      console.error('Erro ao buscar equipe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchTeam();
      } else if (event === 'SIGNED_OUT') {
        setTeam([]);
        setTasks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addMember = async (member) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const memberWithUser = { ...member, user_id: user.id };
      const { data, error } = await supabase
        .from('team_members')
        .insert([memberWithUser])
        .select();

      if (error) throw error;
      if (data) setTeam(prev => [data[0], ...prev]);
      return { success: true };
    } catch (err) {
      console.error('Erro ao adicionar membro:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteMember = async (id) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTeam(prev => prev.filter(m => m.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erro ao excluir membro:', err);
      return { success: false, error: err.message };
    }
  };

  const addTask = (task) => {
    const newTask = { ...task, id: Date.now().toString(), status: 'pending' };
    setTasks([newTask, ...tasks]);
    return { success: true };
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  return (
    <TeamContext.Provider value={{
      team,
      tasks,
      addMember,
      addTask,
      updateTaskStatus,
      deleteMember
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam deve ser usado dentro de um TeamProvider');
  }
  return context;
}
