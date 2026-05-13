import React, { useState } from 'react';
import { useVoters } from '../store/VoterContext';
import { useConfig } from '../store/ConfigContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Search, Plus, Phone, MapPin, Trash2, Send, User, ChevronRight, TrendingUp, UserPlus } from 'lucide-react';
import { generateWhatsAppLink, whatsappTemplates } from '../lib/whatsapp';

export function Voters() {
  const { voters, addVoter, deleteVoter } = useVoters();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Controle pós-cadastro
  const [justRegistered, setJustRegistered] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    neighborhood: '',
    cep: '',
    birth_date: '',
    supportLevel: 'neutral',
    tags: [],
    isLeader: false,
  });

  const [currentTag, setCurrentTag] = useState('');

  const { config } = useConfig();

  const filteredVoters = voters.filter(voter => 
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Identifica aniversariantes do dia
  const today = new Date();
  const todayStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const birthdayBoys = voters.filter(v => v.birth_date && v.birth_date.includes(todayStr));

  const getSupportBadge = (level) => {
    const l = level === 'strong' ? 'strong' : level === 'supporter' ? 'supporter' : level === 'neutral' ? 'neutral' : 'cold';
    switch(l) {
      case 'strong': return <Badge variant="strong">Apoiador Forte</Badge>;
      case 'supporter': return <Badge variant="supporter">Apoiador</Badge>;
      case 'neutral': return <Badge variant="neutral">Neutro</Badge>;
      case 'cold': return <Badge variant="cold">Frio</Badge>;
      default: return null;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (level) => {
    const l = level === 'strong' ? 'strong' : level === 'supporter' ? 'supporter' : level === 'neutral' ? 'neutral' : 'cold';
    switch(l) {
      case 'strong': return 'linear-gradient(135deg, #10B981, #059669)';
      case 'supporter': return 'linear-gradient(135deg, #3B82F6, #2563EB)';
      case 'neutral': return 'linear-gradient(135deg, #9CA3AF, #6B7280)';
      case 'cold': return 'linear-gradient(135deg, #EF4444, #DC2626)';
      default: return 'var(--color-primary)';
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getCoordinates = async (neighborhood, cep) => {
    try {
      // Prioridade total para o CEP se disponível
      const query = cep && cep.length >= 8 ? cep : `${neighborhood}, ${config.city || ''}, ${config.state || ''}, Brasil`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error("Erro ao geocodificar", e);
    }
    return null;
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir o eleitor "${name}"?`)) {
      const result = await deleteVoter(id);
      if (!result.success) {
        alert('Erro ao excluir: ' + result.error);
      }
    }
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag] });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const coords = await getCoordinates(formData.neighborhood, formData.cep);

    // Mescla a tag de liderança se marcado
    const finalTags = [...formData.tags];
    if (formData.isLeader && !finalTags.includes('liderança')) {
      finalTags.push('liderança');
    }

    const result = await addVoter({
      name: formData.name,
      phone: formData.phone,
      neighborhood: formData.neighborhood,
      cep: formData.cep,
      birth_date: formData.birth_date || null,
      supportLevel: formData.supportLevel,
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lon : null,
      interaction_score: 10,
      tags: finalTags,
    });
    
    setLoading(false);
    if (result.success) {
      setJustRegistered({ ...formData, tags: finalTags });
      setFormData({ name: '', phone: '', neighborhood: '', birth_date: '', supportLevel: 'neutral', tags: [], isLeader: false });
    } else {
      alert('Erro ao cadastrar eleitor: ' + result.error);
    }
  };

  const openWhatsApp = (voter = justRegistered, template = 'welcome') => {
    if (!voter || !voter.phone) return;
    
    const firstName = voter.name.split(' ')[0];
    let message = "";
    
    if (template === 'birthday') {
      message = whatsappTemplates.birthday(firstName, config.name);
    } else {
      message = whatsappTemplates.welcome(firstName, config.name);
    }
    
    const url = generateWhatsAppLink(voter.phone, message);
    window.open(url, '_blank');
    
    if (voter === justRegistered) {
      setIsModalOpen(false);
      setJustRegistered(null);
    }
  };

  const openNewModal = () => {
    setJustRegistered(null);
    setFormData({ name: '', phone: '', neighborhood: '', birth_date: '', supportLevel: 'neutral', tags: [], isLeader: false });
    setIsModalOpen(true);
  };

  const exportToCSV = () => {
    if (voters.length === 0) return;
    
    const headers = ['Nome', 'Telefone', 'Bairro', 'Nascimento', 'Nível de Apoio', 'Tags'];
    const rows = voters.map(v => [
      v.name,
      v.phone,
      v.neighborhood,
      v.birth_date || '',
      v.supportLevel,
      v.tags?.join('; ') || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eleitores_votai_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container animate-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Base de Eleitores</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Gerencie seus contatos e fidelize votos</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <TrendingUp size={16} style={{ marginRight: '0.4rem' }} /> Exportar Excel
          </Button>
          <Button size="sm" onClick={openNewModal}>
            <UserPlus size={16} style={{ marginRight: '0.4rem' }} /> Novo Eleitor
          </Button>
        </div>
      </header>

      {/* ALERTAS DE ANIVERSÁRIO */}
      {birthdayBoys.length > 0 && (
        <Card glass padding="1rem" style={{ marginBottom: '2rem', border: '1px solid rgba(var(--color-primary-rgb), 0.3)', background: 'rgba(var(--color-primary-rgb), 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
              <Plus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Aniversariantes de Hoje! 🎉</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Não deixe passar em branco, envie um parabéns!</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {birthdayBoys.map(boy => (
              <div key={boy.id} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{boy.name.split(' ')[0]}</span>
                <button 
                  onClick={() => openWhatsApp(boy, 'birthday')}
                  style={{ background: '#25D366', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Send size={12} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={20} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou bairro..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid transparent',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: '1rem',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'transparent'}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredVoters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <User size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Nenhum eleitor encontrado.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Tente ajustar a sua busca ou adicione um novo.</p>
          </div>
        ) : (
          filteredVoters.map(voter => (
            <Card key={voter.id} glass hover padding="1rem" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', cursor: 'pointer' }}>
              
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: getAvatarColor(voter.supportLevel),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                {getInitials(voter.name)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{voter.name}</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{voter.cep || voter.neighborhood || 'Sem CEP'}</span>
                    {voter.birth_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.5rem' }}>
                        <Plus size={12} /> {new Date(voter.birth_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                  {getSupportBadge(voter.supportLevel)}
                  {voter.tags && voter.tags.length > 0 && voter.tags.slice(0, 3).map(tag => (
                    <Badge 
                      key={tag} 
                      variant={tag === 'liderança' ? 'strong' : 'neutral'} 
                      style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.15rem 0.4rem',
                        backgroundColor: tag === 'liderança' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-brighter)',
                        color: tag === 'liderança' ? '#10B981' : 'var(--color-text-secondary)',
                        border: tag === 'liderança' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--color-border)'
                      }}
                    >
                      {tag === 'liderança' ? '⭐ Liderança' : `#${tag}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); openWhatsApp(voter); }}
                  style={{ background: '#25D366', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                  className="hover-scale"
                  title="WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(voter.id, voter.name); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Unificado (Cadastro ou Sucesso) */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setJustRegistered(null); }} title={justRegistered ? "Cadastrado com Sucesso!" : "Novo Cadastro de Eleitor"}>
        
        {justRegistered ? (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)' }}>
              <UserPlus size={40} />
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{justRegistered.name} está na base!</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Que tal enviar uma mensagem de boas-vindas agora mesmo para estreitar o relacionamento?
              </p>
            </div>

            <Button onClick={() => openWhatsApp()} style={{ width: '100%', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }} size="lg">
              <Send size={18} style={{ marginRight: '0.75rem' }} /> Enviar WhatsApp
            </Button>

            <Button variant="ghost" onClick={() => { setIsModalOpen(false); setJustRegistered(null); }} style={{ width: '100%' }}>
              Talvez depois
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input 
              label="Nome Completo" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input 
                label="WhatsApp" 
                type="number"
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <Input 
                label="CEP (Opcional)" 
                placeholder="Ex: 28000-000"
                value={formData.cep}
                onChange={e => setFormData({...formData, cep: e.target.value})}
              />
              <Input 
                label="Nascimento" 
                type="date"
                value={formData.birth_date}
                onChange={e => setFormData({...formData, birth_date: e.target.value})}
              />
            </div>
            <Input 
              label="Bairro" 
              required 
              value={formData.neighborhood}
              onChange={e => setFormData({...formData, neighborhood: e.target.value})}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Nível de Apoio</label>
              <select 
                value={formData.supportLevel}
                onChange={e => setFormData({...formData, supportLevel: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              >
                <option value="strong">Forte Apoiador (Liderança)</option>
                <option value="supporter">Apoiador</option>
                <option value="neutral">Neutro / Indeciso</option>
                <option value="cold">Frio / Resistente</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.1)', cursor: 'pointer' }} onClick={() => setFormData({...formData, isLeader: !formData.isLeader})}>
              <input 
                type="checkbox" 
                checked={formData.isLeader} 
                onChange={() => {}} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Marcar como Liderança</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Aparecerá nos filtros estratégicos de envio.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Interesses / Tags</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Ex: Saúde, Educação..." 
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    outline: 'none'
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem' }}>
                    #{tag}
                    <span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: '1rem' }}>&times;</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Cadastrar Eleitor'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
