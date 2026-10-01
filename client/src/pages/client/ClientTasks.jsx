import React, { useState, useEffect } from 'react';
import { CheckSquare, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function ClientTasks() {
  const { token } = useAppStore();
  const [tasks, setTasks] = useState([
    {
      _id: 'tsk_1',
      title: 'Build Responsive Checkout Component',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-10-05',
    },
    {
      _id: 'tsk_2',
      title: 'On-Page Technical SEO Audit',
      status: 'Internal Review',
      priority: 'Medium',
      dueDate: '2026-10-02',
    },
  ]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks(token);
      if (data && data.length > 0) setTasks(data);
    } catch (err) {
      console.log('Using default client tasks list.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" /> Project Tasks Progress
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track task milestones and current status across your active project.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Live Milestone Tracker
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {tasks.map((task) => (
          <div key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                {task.priority || 'Medium'} Priority
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{task.title}</h3>
              <p className="text-xs text-slate-400">Target Due Date: {task.dueDate || '2026-10-05'}</p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                task.status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}
            >
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
