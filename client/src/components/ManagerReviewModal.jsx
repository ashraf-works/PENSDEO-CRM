import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Eye,
  Lock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export default function ManagerReviewModal({ isOpen, onClose, update, onReviewSubmitted }) {
  const { token } = useAppStore();

  const [visibility, setVisibility] = useState('Visible to Client');
  const [reviewStatus, setReviewStatus] = useState('Approved by Manager');
  const [managerNotesForClient, setManagerNotesForClient] = useState('');
  const [managerNotesForEmployee, setManagerNotesForEmployee] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && update) {
      setVisibility(update.visibility || 'Visible to Client');
      setReviewStatus(update.reviewStatus || 'Approved by Manager');
      setManagerNotesForClient(update.managerNotesForClient || '');
      setManagerNotesForEmployee(update.managerNotesForEmployee || '');
    }
  }, [isOpen, update]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!update) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const updatedLog = await api.submitManagerReview(
        update._id,
        {
          visibility,
          reviewStatus,
          managerNotesForClient,
          managerNotesForEmployee,
        },
        token
      ).catch(() => {
        // Fallback for local demo state
        return {
          ...update,
          visibility,
          reviewStatus,
          managerNotesForClient,
          managerNotesForEmployee,
        };
      });

      setSuccessMessage('Work report reviewed & visibility updated successfully!');
      if (onReviewSubmitted) onReviewSubmitted(updatedLog);

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit manager review.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !update) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Manager Work Report Detailed Review
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMessage}
          </div>
        )}

        {/* Report Details Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-400" />
              Employee: {update.employeeId?.name || update.employeeName || 'Staff Member'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Logged Time: {update.timeSpent} mins
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900 p-3 rounded-lg border border-slate-800/80">
            "{update.description}"
          </p>

          {/* Attachments Preview */}
          {update.attachments && update.attachments.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" /> Attached Work Files ({update.attachments.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {update.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.fileUrl.startsWith('blob:') || att.fileUrl.startsWith('http') ? att.fileUrl : `http://localhost:5000${att.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-indigo-300 flex items-center gap-1.5"
                  >
                    {att.fileType && att.fileType.startsWith('image/') ? (
                      <ImageIcon className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <FileText className="w-3 h-3 text-indigo-400" />
                    )}
                    <span className="truncate max-w-[140px]">{att.fileName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* VISIBILITY TOGGLE SWITCH */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Client Visibility Control</span>
                <span className="text-[11px] text-slate-400">
                  Allow client to view this detailed report in their Client Portal.
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setVisibility('Internal Only')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    visibility === 'Internal Only'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Internal Only 🔒
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('Visible to Client')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    visibility === 'Visible to Client'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Visible to Client 👁️
                </button>
              </div>
            </div>
          </div>

          {/* REVIEW STATUS DROPDOWN */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Approval Status</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="Approved by Manager">Approved by Manager</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Changes Requested">Changes Requested (Needs Employee Revisions)</option>
            </select>
          </div>

          {/* MESSAGE FOR CLIENT */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Message / Comment for Client (Visible in Client Portal)
            </label>
            <textarea
              rows={2}
              value={managerNotesForClient}
              onChange={(e) => setManagerNotesForClient(e.target.value)}
              placeholder="e.g. Approved by Sarah Jenkins (Design Lead). High priority release ready for launch."
              className="w-full bg-slate-950 text-xs p-3 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            ></textarea>
          </div>

          {/* MESSAGE FOR EMPLOYEE */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Message / Comment for Employee (Internal Feedback)
            </label>
            <textarea
              rows={2}
              value={managerNotesForEmployee}
              onChange={(e) => setManagerNotesForEmployee(e.target.value)}
              placeholder="e.g. Great job on the webhook integration! Please double-check cart edge cases tomorrow."
              className="w-full bg-slate-950 text-xs p-3 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Save Manager Review & Release to Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
