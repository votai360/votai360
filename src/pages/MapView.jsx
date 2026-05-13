import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useVoters } from '../store/VoterContext';
import { useConfig } from '../store/ConfigContext';
import { Badge } from '../components/ui/Badge';
import { Search, MapPin, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Ícones Customizados
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-leaflet-marker hover-scale',
    html: `<div style="
      background: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const icons = {
  strong: createCustomIcon('linear-gradient(135deg, #10B981, #059669)'), // Forte - Verde
  supporter: createCustomIcon('linear-gradient(135deg, #3B82F6, #2563EB)'), // Apoiador - Azul
  neutral: createCustomIcon('linear-gradient(135deg, #9CA3AF, #6B7280)'), // Neutro - Cinza
  cold: createCustomIcon('linear-gradient(135deg, #EF4444, #DC2626)'), // Frio - Vermelho
};

const defaultCenter = [-23.550520, -46.633308]; // São Paulo como default

// Componente para forçar o mapa a atualizar o centro
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export function MapView() {
  const { voters } = useVoters();
  const { config } = useConfig();
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');

  const filteredVoters = voters.filter(voter => {
    const level = voter.supportLevel || voter.support_level;
    if (filterLevel === 'all') return true;
    return level === filterLevel;
  });

  useEffect(() => {
    async function centerOnCampaignRegion() {
      if (config && config.city) {
        try {
          const query = `${config.city}, ${config.state || ''}, Brasil`;
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else if (voters && voters.length > 0) {
             const firstV = voters.find(v => v.latitude && v.longitude);
             if (firstV) setMapCenter([firstV.latitude, firstV.longitude]);
          }
        } catch (err) {
          console.error("Erro ao buscar coordenadas da campanha", err);
        }
      } else if (voters && voters.length > 0) {
        const firstV = voters.find(v => v.latitude && v.longitude);
        if (firstV) setMapCenter([firstV.latitude, firstV.longitude]);
      }
    }

    if (mapCenter === defaultCenter) {
      centerOnCampaignRegion();
    }
  }, [config, voters]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}, Brasil`);
      const data = await response.json();

      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert('Cidade não encontrada. Tente incluir o estado (ex: Campinas, SP).');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      alert('Erro na busca. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <header className="glass" style={{ padding: '1.5rem', zIndex: 10, borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Mapa Eleitoral</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Visualização geográfica da base e heatmap de força.</p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar cidade ou região..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: 'var(--radius-full)',
                border: '2px solid transparent',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color var(--transition-fast)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
          </div>
          <Button type="submit" size="md" disabled={isSearching} style={{ padding: '0 1rem' }}>
            <Search size={18} />
          </Button>
        </form>
        
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="var(--color-text-secondary)" />
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
              flex: 1,
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <option value="all">Todos os perfis de apoio</option>
            <option value="strong">Somente Forte Apoiador (Verde)</option>
            <option value="supporter">Somente Apoiador (Azul)</option>
            <option value="neutral">Somente Neutro (Cinza)</option>
            <option value="cold">Somente Frio (Vermelho)</option>
          </select>
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <MapUpdater center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Mudado para light_all para visual mais limpo/moderno
          />
          
          {filteredVoters.map(voter => {
            const level = voter.supportLevel || voter.support_level;
            return voter.latitude && voter.longitude ? (
              <Marker 
                key={voter.id} 
                position={[voter.latitude, voter.longitude]}
                icon={icons[level] || icons.neutral}
              >
                <Popup className="premium-popup">
                  <div style={{ minWidth: '160px', padding: '0.5rem 0' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1E293B', fontWeight: '700' }}>{voter.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '12px' }}>
                      <MapPin size={12} />
                      <span style={{ fontSize: '0.85rem' }}>{voter.neighborhood}</span>
                    </div>
                    <Badge variant={voter.supportLevel} style={{ width: '100%', justifyContent: 'center' }}>
                      {voter.supportLevel}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            ) : null
          })}
        </MapContainer>
        
        {/* Legenda Flutuante */}
        <div className="glass hover-scale" style={{
          position: 'absolute',
          bottom: '1.5rem',
          right: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.85rem',
          fontWeight: '500',
          color: 'var(--color-text-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 2px 4px rgba(16,185,129,0.4)' }}></div>
            <span>Forte</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 2px 4px rgba(59,130,246,0.4)' }}></div>
            <span>Apoiador</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #9CA3AF, #6B7280)', boxShadow: '0 2px 4px rgba(156,163,175,0.4)' }}></div>
            <span>Neutro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 2px 4px rgba(239,68,68,0.4)' }}></div>
            <span>Frio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
