import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

import { supabase } from '../lib/supabase';

const getTodayStr = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(y, m - 1, d);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  let formatted = date.toLocaleDateString('pt-BR', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [baseDate, setBaseDate] = useState(new Date()); 
  const [formData, setFormData] = useState({ title: '', type: 'reunião', date: getTodayStr(), time: '', location: '', team: 0, color: '#3B82F6', status: 'pending' });

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date');

      if (error) throw error;
      
      // Adaptar dados do banco para o formato do estado
      const adapted = data.map(ev => ({
        ...ev,
        date: ev.event_date.split('T')[0],
        // O restante dos campos já deve coincidir ou ser adaptado conforme necessário
      }));
      
      setEvents(adapted);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchEvents();
      } else if (event === 'SIGNED_OUT') {
        setEvents([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const newEvent = {
        title: formData.title,
        description: '', // Opcional
        event_date: formData.date + 'T' + (formData.time.includes(':') ? formData.time.split(' ')[0] : '00:00:00'),
        location: formData.location,
        type: formData.type === 'reunião' ? 'reuniao' : formData.type, // Ajuste de string conforme enum no DB
        status: 'pending',
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select();

      if (error) throw error;
      
      if (data) {
        setEvents(prev => [...prev, { ...data[0], date: data[0].event_date.split('T')[0] }]);
      }
      setIsModalOpen(false);
      setSelectedDate(formData.date);
      setFormData({ title: '', type: 'reunião', date: formData.date, time: '', location: '', team: 0, color: '#3B82F6', status: 'pending' });
    } catch (err) {
      console.error('Erro ao adicionar evento:', err);
      alert('Erro ao salvar evento no banco de dados.');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Tem certeza que deseja excluir o evento "${title}"?`)) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    const event = events.find(ev => ev.id === id);
    const newStatus = event.status === 'done' ? 'pending' : 'done';
    try {
      const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: newStatus } : ev));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const eventTypes = [
    { value: 'reunião', label: 'Reunião', color: '#3B82F6' },
    { value: 'caminhada', label: 'Caminhada', color: '#10B981' },
    { value: 'panfletagem', label: 'Panfletagem', color: '#F59E0B' },
    { value: 'entrevista', label: 'Entrevista/Mídia', color: '#8B5CF6' },
    { value: 'outro', label: 'Outro', color: '#6B7280' },
  ];

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const typeDef = eventTypes.find(t => t.value === type);
    setFormData({ ...formData, type, color: typeDef ? typeDef.color : '#3B82F6' });
  };

  const moveDays = (days) => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + days);
    setBaseDate(newDate);
  };

  // Generate 7 days starting from baseDate - 3 days (so selected/current is in middle if not navigated away)
  const generateWeekDays = () => {
    const days = [];
    const start = new Date(baseDate);
    start.setDate(start.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      
      const dayName = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'][d.getDay()];
      const dayNum = d.getDate();
      
      const localD = new Date(d);
      localD.setMinutes(localD.getMinutes() - localD.getTimezoneOffset());
      const dateStr = localD.toISOString().split('T')[0];

      days.push({ dayName, dayNum, dateStr });
    }
    return days;
  };

  const weekDays = generateWeekDays();
  const filteredEvents = events.filter(e => e.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={24} color="var(--color-primary)" /> Agenda
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Gerencie seus eventos e compromissos</p>
        </div>
        <Button size="md" onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem' }}>
          <Plus size={20} />
        </Button>
      </header>

      {/* Navegador de Dias */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => moveDays(-7)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
          {baseDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => moveDays(7)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Mini Calendário Funcional */}
      <Card glass padding="1rem" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {weekDays.map((dayObj) => {
          const isSelected = dayObj.dateStr === selectedDate;
          const isToday = dayObj.dateStr === getTodayStr();

          return (
            <div 
              key={dayObj.dateStr} 
              onClick={() => setSelectedDate(dayObj.dateStr)}
              className={isSelected ? 'hover-scale' : ''} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                padding: '0.5rem 0.25rem',
                minWidth: '40px',
                borderRadius: 'var(--radius-full)',
                background: isSelected ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' : 'transparent',
                color: isSelected ? '#fff' : (isToday ? 'var(--color-primary)' : 'var(--color-text-secondary)'),
                boxShadow: isSelected ? '0 4px 10px rgba(16, 185, 129, 0.4)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: isSelected || isToday ? '700' : '500', marginBottom: '0.2rem' }}>
                {dayObj.dayName}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{dayObj.dayNum}</span>
              {isToday && !isSelected && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginTop: '2px' }} />}
            </div>
          )
        })}
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-primary)', margin: 0 }}>
            {selectedDate === getTodayStr() ? 'Hoje, ' : ''}{formatDisplayDate(selectedDate)}
          </h3>
          <Badge variant="neutral">{filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}</Badge>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            Nenhum evento agendado para este dia.
          </div>
        ) : (
          filteredEvents.map(event => (
            <Card key={event.id} glass hover padding="1.25rem" style={{ borderLeft: `4px solid ${event.status === 'done' ? 'var(--color-success)' : event.color}`, opacity: event.status === 'done' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--color-text-primary)', textDecoration: event.status === 'done' ? 'line-through' : 'none' }}>{event.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {event.status === 'done' ? (
                    <Badge variant="supporter" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Concluído</Badge>
                  ) : (
                    <>
                      <Badge variant="neutral" style={{ fontSize: '0.7rem', background: `${event.color}20`, color: event.color, border: `1px solid ${event.color}40`, textTransform: 'uppercase' }}>
                        {event.type}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleToggleStatus(event.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--color-success)', color: 'var(--color-success)' }} title="Marcar como Concluído">
                        <CheckCircle size={14} style={{ marginRight: '0.25rem' }} /> Concluir
                      </Button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-danger, #ef4444)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Excluir Evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} color="var(--color-text-muted)" /> <span style={{ fontWeight: '500' }}>{event.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={16} color="var(--color-text-muted)" /> <span>{event.location}</span>
                </div>
                {event.team > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={16} color="var(--color-text-muted)" /> <span>{event.team} pessoas convocadas</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Novo Evento">
        <form onSubmit={handleAddEvent} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Título do Evento" 
            required 
            placeholder="Ex: Reunião com Lideranças do Bairro X"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Data</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', outline: 'none' }}
              />
            </div>

            <Input 
              label="Horário" 
              required 
              placeholder="Ex: 14h - 16h"
              value={formData.time} 
              onChange={e => setFormData({...formData, time: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Tipo de Evento</label>
            <select 
              value={formData.type}
              onChange={handleTypeChange}
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-fast)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            >
              {eventTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Input 
            label="Local / Endereço" 
            required 
            placeholder="Ex: Comitê Central ou Rua das Flores, 123"
            value={formData.location} 
            onChange={e => setFormData({...formData, location: e.target.value})} 
          />

          <Input 
            label="Quantidade de Pessoas (Equipe/Público)" 
            type="number"
            min="0"
            value={formData.team} 
            onChange={e => setFormData({...formData, team: e.target.value})} 
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Evento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
