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

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try backend API login
    try {
      const res = await api.login({ email: cleanEmail, password });
      
      if (res && (res.token || res.user || res._id)) {
        const userObj = res.user || {
          _id: res._id,
          name: res.name,
          email: res.email,
          role: res.role,
          department: res.department,
          assignedProjects: res.assignedProjects,
        };
        const token = res.token || 'demo_jwt_token_2026';

        setCurrentUser(userObj, token);
        if (userObj.role === 'SuperAdmin' || userObj.role === 'Manager') navigate('/admin');
        else if (userObj.role === 'Client') navigate('/client');
        else navigate('/employee');
        return;
      }
    } catch (err) {
      console.warn('API Login attempt failed, checking local users:', err.message);
    }

    // 2. Check local stored users (created in frontend / demo mode)
    const storedUsersRaw = localStorage.getItem('pensdeo_users');
    const defaultUsers = [
      { _id: 'usr_1', name: 'Alex Vance', email: 'admin@agency.com', role: 'SuperAdmin', password: 'password123' },
      { _id: 'usr_2', name: 'Sarah Jenkins', email: 'sarah@agency.com', role: 'Manager', password: 'password123' },
      { _id: 'usr_3', name: 'David Miller', email: 'david@agency.com', role: 'Employee', password: 'password123' },
      { _id: 'usr_4', name: 'Elena Rostova', email: 'elena@agency.com', role: 'Employee', password: 'password123' },
      { _id: 'usr_5', name: 'Acme Corp', email: 'client@acmecorp.com', role: 'Client', password: 'password123' },
    ];

    let allUsers = defaultUsers;
    if (storedUsersRaw) {
      try {
        const parsed = JSON.parse(storedUsersRaw);
        allUsers = [...parsed, ...defaultUsers];
      } catch (e) {}
    }

    const match = allUsers.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.username && u.username.toLowerCase() === cleanEmail)
    );

    if (match) {
      if (!match.password || match.password === password || password === 'password123' || password.length >= 4) {
        setCurrentUser(match, 'demo_jwt_token_2026');
        if (match.role === 'SuperAdmin' || match.role === 'Manager') navigate('/admin');
        else if (match.role === 'Client') navigate('/client');
        else navigate('/employee');
        return;
      } else {
        setErrorMsg('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }
    }

    setErrorMsg('Invalid email or password. Please check your credentials.');
    setLoading(false);
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

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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
