import React, { createContext, useContext, useState } from 'react';

const TeamContext = createContext();

// Mock inicial
const initialTeam = [
  { id: '1', name: 'Carlos Silva', role: 'coordinator', phone: '11999999999', area: 'Centro', performance: 85 },
  { id: '2', name: 'Ana Oliveira', role: 'volunteer', phone: '11988888888', area: 'Zona Sul', performance: 60 },
  { id: '3', name: 'Marcos Costa', role: 'volunteer', phone: '11977777777', area: 'Zona Norte', performance: 95 }
];

const initialTasks = [
  { id: '1', title: 'Visitar liderança no Bairro Centro', assignedTo: '1', status: 'pending', deadline: 'Hoje' },
  { id: '2', title: 'Panfletagem na feira livre', assignedTo: '2', status: 'done', deadline: 'Ontem' },
  { id: '3', title: 'Cadastrar 10 novos eleitores', assignedTo: '3', status: 'doing', deadline: 'Amanhã' }
];

export function TeamProvider({ children }) {
  const [team, setTeam] = useState(initialTeam);
  const [tasks, setTasks] = useState(initialTasks);

  const addMember = (member) => {
    const newMember = { ...member, id: Date.now().toString(), performance: 0 };
    setTeam([newMember, ...team]);
    return { success: true };
  };

  const addTask = (task) => {
    const newTask = { ...task, id: Date.now().toString(), status: 'pending' };
    setTasks([newTask, ...tasks]);
    return { success: true };
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const deleteMember = (id) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    return { success: true };
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
