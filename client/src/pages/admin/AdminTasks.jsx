import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Paperclip, UserCheck, Calendar, Edit2, Send, Trash2, User, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import CreateTaskModal from '../../components/CreateTaskModal';

export default function AdminTasks() {
  const { token } = useAppStore();
  const [tasks, setTasks] = useState([
    {
      _id: 'tsk_1',
      title: 'Build Responsive Checkout Component',
      projectId: { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
      clientId: { _id: 'usr_5', name: 'Acme Corp (Robert Taylor)' },
      assignedTo: { name: 'David Miller', department: 'Development' },
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-10-05',
      submittedToClient: false,
      attachments: [
        { fileName: 'checkout-spec.pdf', fileUrl: '/uploads/checkout-spec.pdf', fileType: 'application/pdf' },
      ],
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks(token);
      if (data && data.length > 0) setTasks(data);
    } catch (err) {
      console.log('Using default task list.');
    }
  };

  const handleTaskCreatedOrUpdated = (updatedTask) => {
    if (updatedTask) {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t._id === updatedTask._id);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = updatedTask;
          return newArr;
        } else {
          return [updatedTask, ...prev];
        }
      });
    }
    fetchTasks();
  };

  const handleSubmitToClient = async (task) => {
    try {
      const updated = await api.updateTask(
        task._id,
        { status: 'Waiting for Client', submittedToClient: true },
        token
      ).catch(() => ({
        ...task,
        status: 'Waiting for Client',
        submittedToClient: true,
      }));

      handleTaskCreatedOrUpdated(updated);
    } catch (err) {
      console.error('Failed to submit task to client:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(taskId, token).catch(() => {});
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" /> Master Tasks Board & Client Submissions
          </h1>
          <p className="text-xs text-slate-400">Create, assign, edit tasks, select clients, and submit deliverables directly to clients.</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 w-fit"
        >
          <Plus className="w-4 h-4" /> Create & Assign Task
        </button>
      </div>

      {/* Task List */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {tasks.map((task) => (
          <div key={task._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-850/40 transition">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    task.priority === 'High' || task.priority === 'Urgent'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {task.priority} Priority
                </span>

                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  Project: <strong className="text-slate-200">{task.projectId?.title || 'Acme E-Commerce'}</strong>
                </span>

                {task.clientId && (
                  <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                    <User className="w-3 h-3" /> Client: {task.clientId?.name || 'Client'}
                  </span>
                )}

                {(task.submittedToClient || task.status === 'Waiting for Client') && (
                  <span className="text-[10px] text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Submitted to Client
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-xl">
                  {task.description}
                </p>
              )}

              {/* Attachments Display */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-indigo-400" /> Attachments ({task.attachments.length}):
                  </span>
                  {task.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.fileUrl.startsWith('http') || att.fileUrl.startsWith('blob:') ? att.fileUrl : `${import.meta.env.VITE_API_HOST || 'http://localhost:5000'}${att.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-300 hover:text-indigo-300 underline font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {att.fileName}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="text-slate-400">
                <span className="text-slate-500 block text-[10px]">Assigned To:</span>
                <span className="font-semibold text-slate-200">{task.assignedTo?.name || 'Unassigned'}</span>
              </div>

              <span
                className={`px-3 py-1 rounded-full font-semibold text-[11px] ${
                  task.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : task.status === 'Waiting for Client'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {task.status}
              </span>

              {/* Actions: Edit, Submit to Client, Delete */}
              <div className="flex items-center gap-1.5">
                {!(task.submittedToClient || task.status === 'Waiting for Client') && (
                  <button
                    onClick={() => handleSubmitToClient(task)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold transition flex items-center gap-1"
                    title="Submit deliverable directly to client"
                  >
                    <Send className="w-3 h-3" /> Submit to Client
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingTask(task);
                    setShowCreateModal(true);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition"
                  title="Edit Task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white transition"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Component (handles both Create and Edit) */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        onTaskCreated={handleTaskCreatedOrUpdated}
        taskToEdit={editingTask}
      />
    </div>
  );
}
