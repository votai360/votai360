import React, { useState, useEffect } from 'react';
import { useConfig } from '../store/ConfigContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Save, UserCircle, Palette, LogOut } from 'lucide-react';
import { brazilStats } from '../data/brazil_stats';
import { cityStats } from '../data/city_stats';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function SettingsView() {
  const { config, updateConfig } = useConfig();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm('Deseja realmente sair da sua conta?')) return;
    await supabase.auth.signOut();
    navigate('/login');
  };

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    slogan: '',
    city: '',
    state: '',
    party: '',
    photo_url: '',
    vote_goal: '0',
    seats_count: '0',
    total_voters_city: '0',
    primary_color: '#10B981',
    secondary_color: '#3B82F6',
    tertiary_color: '#2563EB',
    election_type: 'municipal',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name || '',
        number: config.number || '',
        slogan: config.slogan || '',
        city: config.city || '',
        state: config.state || '',
        party: config.party || '',
        photo_url: config.photo_url || '',
        vote_goal: config.vote_goal || '1200',
        seats_count: config.seats_count || '17',
        total_voters_city: config.total_voters_city || '171182',
        primary_color: config.primary_color || '#1B4D3E',
        secondary_color: config.secondary_color || '#F5A623',
        tertiary_color: config.tertiary_color || '#2563EB',
        election_type: config.election_type || 'municipal',
      });
    }
  }, [config]);

  // Efeito para puxar dados automáticos por Cidade (Municipal)
  useEffect(() => {
    if (formData.election_type === 'municipal' && formData.city) {
      const cityKey = formData.city.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const foundCity = Object.keys(cityStats).find(k => 
        k.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === cityKey
      );

      if (foundCity) {
        const data = cityStats[foundCity];
        setFormData(prev => ({
          ...prev,
          total_voters_city: data.voters.toString(),
          seats_count: data.seats.toString()
        }));
      }
    }
  }, [formData.city, formData.election_type]);

  // Efeito para puxar dados automáticos por Estado (Estadual/Federal)
  useEffect(() => {
    if (formData.election_type !== 'municipal') {
      const stateKey = (formData.state || 'BR').toUpperCase();
      const stateData = brazilStats[stateKey];
      
      if (stateData) {
        const seats = formData.election_type === 'estadual' ? stateData.state_seats : stateData.federal_seats;
        
        setFormData(prev => ({
          ...prev,
          total_voters_city: stateData.voters.toString(),
          seats_count: seats.toString()
        }));
      }
    } else if (formData.election_type === 'municipal' && !formData.city) {
      // Se voltar para municipal e não tiver cidade, limpa os campos para o usuário preencher
      setFormData(prev => ({
        ...prev,
        total_voters_city: '0',
        seats_count: '0',
        vote_goal: '0'
      }));
    }
  }, [formData.election_type, formData.state]);

  // Cálculo Automático de Meta (Baseado na Cláusula de Barreira Individual - 20% do QE)
  useEffect(() => {
    const seats = parseInt(formData.seats_count);
    const totalVoters = parseInt(formData.total_voters_city);
    
    if (seats > 0 && totalVoters > 0) {
      const validVotes = totalVoters * 0.8; // Estimativa de 80% de votos válidos
      const qe = validVotes / seats; // Quociente Eleitoral (QE)
      
      // Regra Eleitoral Atualizada (Lei 14.211/2021 + STF ADIs 7228, 7263 e 7325):
      // Para ser eleito, o candidato precisa de no mínimo 20% do QE (exigência para as sobras)
      // ou 10% do QE para vagas diretas. Para segurança máxima, usamos 20%.
      const individualBarrier = Math.round(qe * 0.20); 
      
      setFormData(prev => ({ ...prev, vote_goal: individualBarrier.toString() }));
    }
  }, [formData.seats_count, formData.total_voters_city, formData.election_type]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateConfig(formData);
    setSaving(false);
    if (result.success) {
      alert('Configurações atualizadas com sucesso!');
    } else {
      alert('Erro ao salvar: ' + result.error);
    }
  };

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Personalização</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Adapte a plataforma para a identidade da sua campanha</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Identidade do Candidato */}
        <Card glass padding="1.5rem">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
            <UserCircle size={20} color="var(--color-primary)" /> Dados da Campanha
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--color-primary)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Candidato" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  <UserCircle size={48} />
                </div>
              )}
            </div>
            <label style={{ cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Selecionar Foto no Computador
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Tipo de Eleição</label>
                <select 
                  value={formData.election_type}
                  onChange={e => setFormData({...formData, election_type: e.target.value})}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="municipal">Municipal (Prefeito/Vereador)</option>
                  <option value="estadual">Estadual (Gov/Dep. Estadual)</option>
                  <option value="federal">Federal (Pres/Dep. Federal/Senador)</option>
                </select>
              </div>
              <Input label="Partido" placeholder="Ex: PRD" value={formData.party} onChange={e => setFormData({...formData, party: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Nome de Urna" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Número de Campanha" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input 
                label={formData.election_type === 'municipal' ? "Cadeiras na Câmara" : "Vagas em disputa"} 
                type="number" 
                placeholder="Ex: 21" 
                value={formData.seats_count} 
                onChange={e => setFormData({...formData, seats_count: e.target.value})} 
              />
              <Input 
                label={formData.election_type === 'municipal' ? "Total de Eleitores (Cidade)" : "Total de Eleitores (UF/País)"} 
                type="number" 
                placeholder="Ex: 171182" 
                value={formData.total_voters_city} 
                onChange={e => setFormData({...formData, total_voters_city: e.target.value})} 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Meta de Votos (Calculada)" type="number" value={formData.vote_goal} onChange={e => setFormData({...formData, vote_goal: e.target.value})} required />
              <Input label="Estado (UF)" placeholder="Ex: RJ" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} />
            </div>

            {formData.election_type === 'municipal' && (
              <Input label="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            )}

            <Input label="Slogan (Frase de efeito)" value={formData.slogan} onChange={e => setFormData({...formData, slogan: e.target.value})} />
          </div>
        </Card>

        {/* Cores do Partido */}
        <Card glass padding="1.5rem">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
            <Palette size={20} color="var(--color-secondary)" /> Identidade Visual (Cores)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.5rem' }}>
            <div className="hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Primária</label>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <input 
                  type="color" 
                  value={formData.primary_color}
                  onChange={e => setFormData({...formData, primary_color: e.target.value})}
                  style={{ position: 'absolute', top: '-10px', left: '-10px', width: '68px', height: '68px', padding: 0, border: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Secundária</label>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <input 
                  type="color" 
                  value={formData.secondary_color}
                  onChange={e => setFormData({...formData, secondary_color: e.target.value})}
                  style={{ position: 'absolute', top: '-10px', left: '-10px', width: '68px', height: '68px', padding: 0, border: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Terciária</label>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <input 
                  type="color" 
                  value={formData.tertiary_color}
                  onChange={e => setFormData({...formData, tertiary_color: e.target.value})}
                  style={{ position: 'absolute', top: '-10px', left: '-10px', width: '68px', height: '68px', padding: 0, border: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" disabled={saving} style={{ marginTop: '1rem' }}>
          <Save size={20} style={{ marginRight: '0.5rem' }} />
          {saving ? 'Salvando Tema...' : 'Salvar Personalização'}
        </Button>

        {/* BOTÃO DE LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.9rem',
            background: 'none',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={18} /> Sair da Conta
        </button>

      </form>
    </div>
  );
}
