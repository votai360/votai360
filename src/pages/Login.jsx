import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ArrowRight, Users, Map, Target, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  { icon: <Users size={16} />, text: 'CRM de Eleitores Inteligente' },
  { icon: <Map size={16} />, text: 'Mapas de Calor por Região' },
  { icon: <Target size={16} />, text: 'Simulador Eleitoral Avançado' },
  { icon: <BarChart3 size={16} />, text: 'Relatórios e Inteligência de Dados' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (signUpError) throw signUpError;
        if (data.user && data.session === null) {
          setError('✅ Conta criada! Verifique seu e-mail para confirmar o acesso.');
        } else {
          navigate('/');
        }
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/');
      }
    } catch (err) {
      let msg = err.message;
      if (msg.includes('Invalid login')) msg = 'E-mail ou senha incorretos. Verifique e tente novamente.';
      if (msg.includes('Email confirmation')) msg = 'Confirme seu e-mail antes de entrar.';
      if (msg.includes('Signup disabled')) msg = 'Cadastro temporariamente desativado.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #000d1a 0%, #001a0d 40%, #000d1a 100%)',
      padding: '1.5rem',
    }}>
      {/* FUNDO ANIMADO - ORBES DE LUZ */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        {/* Orbe principal verde */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite',
        }} />
        {/* Orbe azul */}
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite',
        }} />
        {/* Orbe verde claro */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 60%)',
        }} />
        {/* Grade de pontos */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(22,163,74,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }} />
        {/* Linha decorativa diagonal */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(45deg, transparent 49.5%, rgba(22,163,74,0.04) 49.5%, rgba(22,163,74,0.04) 50.5%, transparent 50.5%)',
          backgroundSize: '80px 80px',
        }} />
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{
        width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* LOGO + BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Logo com glow e fundo transparente */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: '-20px',
              background: 'radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }} />
            <img
              src="/logo.png"
              alt="VotAí 360"
              style={{
                height: 'auto',
                width: '100%',
                maxWidth: '280px',
                objectFit: 'contain',
                position: 'relative',
                filter: 'brightness(1.25) contrast(1.1) drop-shadow(0 0 25px rgba(255,255,255,0.4)) drop-shadow(0 0 10px rgba(22,163,74,0.6))',
              }}
            />
            {/* Subtítulo direto abaixo da logo */}
            <p style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(22,163,74,0.8)',
              marginTop: '0.5rem',
              textAlign: 'center',
            }}>
              Gestão Política Inteligente
            </p>
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            lineHeight: 1.6,
          }}>
            Da campanha ao mandato.<br />Do contato ao voto.
          </p>
        </div>

        {/* CARD DE LOGIN — GLASSMORPHISM PREMIUM */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Borda superior luminosa */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(22,163,74,0.6), transparent)',
          }} />

          {/* Header do card */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.4rem', fontWeight: '800',
              color: '#fff', marginBottom: '0.35rem',
              letterSpacing: '-0.5px',
            }}>
              {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
              {isSignUp ? 'Preencha os dados para começar' : 'Entre com seu e-mail e senha'}
            </p>
          </div>

          {/* MENSAGEM DE ERRO / SUCESSO */}
          {error && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem',
              backgroundColor: error.startsWith('✅') ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${error.startsWith('✅') ? 'rgba(22,163,74,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: error.startsWith('✅') ? '#4ade80' : '#f87171',
              fontSize: '0.82rem', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* FORMULÁRIO */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Campo E-mail */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(22,163,74,0.5)'; e.target.style.background = 'rgba(22,163,74,0.06)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.85rem 3rem 0.85rem 1rem', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.95rem',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(22,163,74,0.5)'; e.target.style.background = 'rgba(22,163,74,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', padding: '0.25rem',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BOTÃO PRINCIPAL */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.95rem',
                borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(22,163,74,0.4)' : 'linear-gradient(135deg, #16A34A 0%, #15803d 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: '700',
                letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(22,163,74,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(22,163,74,0.45)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(22,163,74,0.35)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Autenticando...
                </>
              ) : (
                <>
                  {isSignUp ? 'Criar Conta Gratuita' : 'Entrar na Plataforma'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* RODAPÉ DO CARD */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem',
              }}
            >
              {isSignUp ? (
                <>Já tem uma conta? <span style={{ color: '#4ade80', fontWeight: '600' }}>Entrar agora</span></>
              ) : (
                <>Ainda não tem conta? <span style={{ color: '#4ade80', fontWeight: '600' }}>Cadastre-se</span></>
              )}
            </button>
          </div>
        </div>

        {/* FEATURES ABAIXO DO CARD */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem',
          marginTop: '1.5rem',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 0.85rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(10px)',
              transition: `all 0.5s ease ${0.2 + i * 0.1}s`,
            }}>
              <span style={{ color: '#16A34A' }}>{f.icon}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* SELO DE SEGURANÇA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          marginTop: '1.5rem',
        }}>
          <ShieldCheck size={13} color="rgba(255,255,255,0.25)" />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            Protegido por criptografia de nível bancário · LGPD Compliant
          </span>
        </div>
      </div>

      {/* CSS KEYFRAMES */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 35px) scale(1.08); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #001a0d inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
