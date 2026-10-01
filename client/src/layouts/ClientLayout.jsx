import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  FileCheck,
  ShieldCheck,
  LogOut,
  Sparkles,
  Building2,
  KeyRound
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function ClientLayout() {
  const { currentUser, currentProject, logout } = useAppStore();
  const navigate = useNavigate();
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/client', icon: LayoutDashboard, end: true },
    { name: "Today's Updates", path: '/client/updates', icon: Clock },
    { name: 'Tasks', path: '/client/tasks', icon: CheckSquare },
    { name: 'Deliverables', path: '/client/deliverables', icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Client Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-5 space-y-6">
        <div className="space-y-6">
          {/* Brand & Client Badge Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">PENSDEO Workspace</h2>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Client Portal
              </span>
            </div>
          </div>

          {/* Current Project Summary Badge */}
          {currentProject && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active Project
              </span>
              <p className="text-xs font-bold text-white truncate">{currentProject.title}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${currentProject.progressPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0) : 'C'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 truncate max-w-[90px]">{currentUser?.name}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Client Verified</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsChangePassOpen(true)}
                className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Change Password"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Simplified Client Feed & Transparency Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Client View
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
