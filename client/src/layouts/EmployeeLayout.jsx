import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  FolderKanban,
  UserCheck,
  LogOut,
  Briefcase,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function EmployeeLayout() {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  const navItems = [
    { name: "My Tasks", path: '/employee', icon: CheckSquare, end: true },
    { name: "Today's Work", path: '/employee/work-logs', icon: Clock },
    { name: 'Projects', path: '/employee/projects', icon: FolderKanban },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Employee Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-5 space-y-6">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">PENSDEO Workspace</h2>
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Employee Workspace
              </span>
            </div>
          </div>

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
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
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

        {/* User Profile */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0) : 'E'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 truncate max-w-[90px]">{currentUser?.name}</p>
                <span className="text-[10px] font-semibold text-purple-400">{currentUser?.department || 'Development'}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsChangePassOpen(true)}
                className="text-slate-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
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
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Employee Daily Logger Mode Active</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Department:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-purple-300">
                {currentUser?.department || 'Development'}
              </span>
            </div>
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
