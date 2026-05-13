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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      await fetchSubscription();
      
      // 1. Tenta carregar do localStorage primeiro (específico do usuário)
      const storageKey = `votaai_config_${user.id}`;
      const localConfig = localStorage.getItem(storageKey);
      if (localConfig) {
        const parsed = JSON.parse(localConfig);
        setConfig(parsed);
        applyTheme(parsed);
      }

      // 2. Tenta sincronizar com o Supabase filtrando por user_id
      const { data, error } = await supabase
        .from('campaign_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setConfig(data);
        applyTheme(data);
        localStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        // Se não houver config no banco, usa o padrão mas não salva por cima do local ainda
        if (!localConfig) {
          applyTheme(defaultConfig);
        }
      }
    } catch (err) {
      console.warn('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchConfig();
      } else if (event === 'SIGNED_OUT') {
        setConfig(defaultConfig);
        setSubscription({ status: 'inactive', plan: 'free', isTrial: false, isAdmin: false });
        // Limpa localStorage sensível
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('votaai_')) localStorage.removeItem(key);
        });
      }
    });

    return () => subscription.unsubscribe();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const storageKey = `votaai_config_${user.id}`;
      const configWithUser = { ...newConfig, user_id: user.id };

      // 1. Salva localmente
      localStorage.setItem(storageKey, JSON.stringify(configWithUser));
      setConfig(configWithUser);
      applyTheme(configWithUser);

      // 2. Salva no Supabase
      const { data: existing } = await supabase
        .from('campaign_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        await supabase.from('campaign_settings').update(configWithUser).eq('user_id', user.id);
      } else {
        await supabase.from('campaign_settings').insert([configWithUser]);
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
