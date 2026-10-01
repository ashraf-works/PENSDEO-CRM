import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@agency.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser, switchRole } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login({ email, password }).catch(() => null);
      if (res && res.token && res.user) {
        setCurrentUser(res.user, res.token);
        if (res.user.role === 'SuperAdmin' || res.user.role === 'Manager') navigate('/admin');
        else if (res.user.role === 'Client') navigate('/client');
        else navigate('/employee');
        return;
      }
    } catch (err) {
      console.warn('Backend login fallback to demo persona:', err.message);
    } finally {
      setLoading(false);
    }

    // Default demo persona fallback
    if (email.includes('admin')) {
      switchRole('SuperAdmin');
      navigate('/admin');
    } else if (email.includes('client')) {
      switchRole('Client');
      navigate('/client');
    } else if (email.includes('david') || email.includes('employee')) {
      switchRole('Employee');
      navigate('/employee');
    } else {
      switchRole('Manager');
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PENSDEO Workspace</h1>
          <p className="text-xs text-slate-400">
            Employee logs work → Admin controls it → Client gets transparent view
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="admin@agency.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            Sign In to CRM <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
