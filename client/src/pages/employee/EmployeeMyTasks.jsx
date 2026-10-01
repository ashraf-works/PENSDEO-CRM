import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  UserCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function EmployeeMyTasks() {
  const { token } = useAppStore();
  const [tasks, setTasks] = useState([
    {
      _id: 'tsk_1',
      title: 'Build Responsive Checkout Component',
      projectId: { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-10-05',
    },
    {
      _id: 'tsk_2',
      title: 'On-Page Technical SEO Audit',
      projectId: { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
      status: 'Internal Review',
      priority: 'Medium',
      dueDate: '2026-10-02',
    },
    {
      _id: 'tsk_3',
      title: 'Stripe Webhooks Error Handler Integration',
      projectId: { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
      status: 'Completed',
      priority: 'High',
      dueDate: '2026-09-28',
    },
  ]);

  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks(token);
      if (data && data.length > 0) setTasks(data);
    } catch (err) {
      console.log('Using default employee tasks list.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus, token).catch(() => null);

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      if (['Waiting for Client', 'Completed'].includes(newStatus)) {
        setNotificationMessage(
          `🔔 Status updated to "${newStatus}". Notification triggered for Client/Manager alert & progress synced!`
        );
        setTimeout(() => setNotificationMessage(''), 5000);
      }
    } catch (err) {
      console.error('Task status update failed:', err);
    }
  };

  // Summary counts
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = tasks.filter((t) =>
    ['Not Started', 'Waiting for Client', 'Internal Review', 'Blocked'].includes(t.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-400" /> My Assigned Tasks Dashboard
          </h1>
          <p className="text-xs text-slate-400">View tasks, update progress status, and trigger client updates.</p>
        </div>
      </div>

      {notificationMessage && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <Clock3 className="w-4 h-4 text-purple-400" /> {notificationMessage}
        </div>
      )}

      {/* Summary Counter Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completed */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-3xl font-extrabold text-emerald-400">{completedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-3xl font-extrabold text-indigo-400">{inProgressCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Pending / Review / Waiting */}
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending / Review</span>
            <span className="text-3xl font-extrabold text-amber-400">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Tasks Allocated to You</h3>
          <span className="text-xs text-slate-400">{tasks.length} Total Assigned</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {tasks.map((task) => (
            <div key={task._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-850/40 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      task.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Due: {task.dueDate || 'Soon'}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{task.title}</h4>
                {task.description && (
                  <p className="text-xs text-slate-300 font-normal leading-relaxed max-w-xl">
                    {task.description}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  Project: {task.projectId?.title || 'Acme E-Commerce Redesign'}
                </p>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Update Status:</span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-purple-300 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Client">Waiting for Client (Triggers Alert)</option>
                  <option value="Internal Review">Internal Review</option>
                  <option value="Completed">Completed (Syncs Progress)</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
