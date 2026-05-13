import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { candidateConfig as defaultConfig } from '../config/candidate';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    status: 'inactive', // 'active', 'inactive'
    plan: 'free',
    isTrial: false,
    isAdmin: false
  });

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // ✅ ACESSO MASTER - E-mail do administrador do sistema
        const ADMIN_EMAILS = ['hara.prata@gmail.com'];
        if (ADMIN_EMAILS.includes(user.email)) {
          setSubscription({ status: 'active', plan: 'master', isTrial: false, isAdmin: true });
          return;
        }

        // Verifica se é Admin pelo perfil no banco de dados
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setSubscription({ status: 'active', plan: 'pro', isTrial: false, isAdmin: true });
          return;
        }

        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && data.status === 'active') {
          setSubscription({ status: 'active', plan: data.plan_type, isTrial: false, isAdmin: false });
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar assinatura.');
    }
  };

  const fetchConfig = async () => {
    try {
      await fetchSubscription();
      // 1. Tenta carregar do localStorage primeiro (mais rápido e funciona offline)
      const localConfig = localStorage.getItem('votaai_config');
      if (localConfig) {
        const parsed = JSON.parse(localConfig);
        setConfig(parsed);
        applyTheme(parsed);
      }

      // 2. Tenta sincronizar com o Supabase
      const { data, error } = await supabase
        .from('campaign_settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setConfig(data);
        applyTheme(data);
        localStorage.setItem('votaai_config', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Usando configurações locais ou padrão.');
      if (!localStorage.getItem('votaai_config')) {
        applyTheme(defaultConfig);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    if (themeData.primary_color) {
      root.style.setProperty('--color-primary', themeData.primary_color);
    }
    if (themeData.secondary_color) {
      root.style.setProperty('--color-secondary', themeData.secondary_color);
    }
    if (themeData.tertiary_color) {
      root.style.setProperty('--color-accent', themeData.tertiary_color);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      // 1. Salva localmente como backup (garante que a foto funcione mesmo sem a coluna no DB)
      localStorage.setItem('votaai_config', JSON.stringify(newConfig));
      setConfig(newConfig);
      applyTheme(newConfig);

      // 2. Tenta salvar no Supabase (se a tabela/colunas existirem)
      try {
        const { data: existing } = await supabase.from('campaign_settings').select('id').limit(1).single();
        
        if (existing) {
          await supabase.from('campaign_settings').update(newConfig).eq('id', existing.id);
        } else {
          await supabase.from('campaign_settings').insert([newConfig]);
        }
      } catch (dbError) {
        console.warn('DB Sync failed, using local storage only:', dbError);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, loading, subscription }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro do ConfigProvider');
  }
  return context;
}
