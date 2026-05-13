export const mockVoters = [
  {
    id: '1',
    name: 'João Silva',
    phone: '11999999999',
    neighborhood: 'Centro',
    supportLevel: 'supporter',
    tags: ['liderança', 'comércio'],
    latitude: -23.550520,
    longitude: -46.633308,
    interaction_score: 85,
    key_issue: 'Segurança',
    last_interaction_date: '2023-10-10',
    influence_radius: 5, // Traz votos
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    phone: '11988888888',
    neighborhood: 'Vila Mariana',
    supportLevel: 'strong',
    tags: ['influenciadora', 'saúde'],
    latitude: -23.5898,
    longitude: -46.6342,
    interaction_score: 30, // Baixa interação recente
    key_issue: 'Saúde',
    last_interaction_date: '2023-09-01',
    influence_radius: 0, // Forte, mas não mobilizou ninguém (Candidata a cabo)
  },
  {
    id: '3',
    name: 'Carlos Souza',
    phone: '11977777777',
    neighborhood: 'Pinheiros',
    supportLevel: 'cold',
    tags: ['indeciso'],
    latitude: -23.5671,
    longitude: -46.6997,
    interaction_score: 60, // Frio mas interagiu muito recentemente!
    key_issue: 'Asfalto',
    last_interaction_date: '2023-10-12',
    influence_radius: 1,
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '11966666666',
    neighborhood: 'Mooca',
    supportLevel: 'neutral',
    tags: ['esporte'],
    latitude: -23.5564,
    longitude: -46.5925,
    interaction_score: 10,
    key_issue: 'Esportes',
    last_interaction_date: '2023-08-15',
    influence_radius: 0,
  },
  {
    id: '5',
    name: 'Pedro Nunes',
    phone: '11955555555',
    neighborhood: 'Vila Mariana',
    supportLevel: 'neutral',
    tags: ['morador antigo'],
    latitude: -23.5901,
    longitude: -46.6350,
    interaction_score: 15,
    key_issue: 'Saúde',
    last_interaction_date: '2023-08-20',
    influence_radius: 0,
  }
];

export const mockStats = {
  totalVoters: 1245,
  newToday: 12,
  conversionRate: '68%',
  strongSupporters: 342,
};
