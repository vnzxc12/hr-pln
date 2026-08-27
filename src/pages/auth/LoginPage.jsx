import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { LunayveLogo } from '../../assets/Logo';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@lunayveconstruction.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickPersona = async (demoEmail) => {
    setEmail(demoEmail);
    const res = await login(demoEmail, 'password123');
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 bg-grid-pattern relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <LunayveLogo
            className="w-16 h-16 mx-auto mb-3"
            showText={false}
          />
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            PROJECT LUNAYVE
          </h1>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-1">
            Construction HR Management
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Centralized workforce management for Office & Construction Sites
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@lunayveconstruction.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo Mode: Click any persona below to log in instantly.'); }} className="text-[11px] text-emerald-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Persona Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Demo Personas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickPersona(u.email)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="truncate">
                  <p className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                    {u.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        <p className="font-semibold text-slate-400">Project Lunayve Construction</p>
        <p className="text-[11px] mt-0.5 text-slate-500">
          A product by VCS Technologies • © 2026 VCS Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
