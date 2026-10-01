import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  X,
  Send,
  FileText
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function ClientDeliverables() {
  const { token, currentUser } = useAppStore();

  const [deliverables, setDeliverables] = useState([]);

  // Modal State for Request Changes feedback
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDeliverables();
  }, [currentUser]);

  const fetchDeliverables = async () => {
    try {
      const data = await api.getDeliverables(token);
      const storedProjectsRaw = localStorage.getItem('pensdeo_projects');
      let clientProjectIds = new Set();
      if (storedProjectsRaw) {
        try {
          const parsed = JSON.parse(storedProjectsRaw);
          parsed.forEach((p) => {
            if (p.clientId === currentUser?._id || p.clientId?._id === currentUser?._id || p.clientId?.email === currentUser?.email) {
              clientProjectIds.add(p._id);
            }
          });
        } catch (e) {}
      }

      if (data && Array.isArray(data)) {
        const filtered = data.filter((d) => clientProjectIds.has(d.projectId) || clientProjectIds.has(d.projectId?._id));
        setDeliverables(filtered);
      } else {
        setDeliverables([]);
      }
    } catch (err) {
      setDeliverables([]);
    }
  };

  // Handle Approve button click
  const handleApprove = async (id) => {
    try {
      const updated = await api.submitClientReview(
        id,
        { status: 'Approved', clientFeedback: 'Approved by Client' },
        token
      ).catch(() => null);

      setDeliverables((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status: 'Approved', clientFeedback: 'Approved by Client' } : d
        )
      );
    } catch (err) {
      console.error('Failed to approve deliverable:', err);
    }
  };

  // Open modal for Request Changes
  const openChangesModal = (deliverable) => {
    setSelectedDeliverable(deliverable);
    setFeedbackText(deliverable.clientFeedback || '');
    setShowModal(true);
  };

  // Submit Request Changes modal
  const handleRequestChangesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeliverable) return;

    try {
      await api.submitClientReview(
        selectedDeliverable._id,
        { status: 'Changes Requested', clientFeedback: feedbackText },
        token
      ).catch(() => null);

      setDeliverables((prev) =>
        prev.map((d) =>
          d._id === selectedDeliverable._id
            ? { ...d, status: 'Changes Requested', clientFeedback: feedbackText }
            : d
        )
      );
    } catch (err) {
      console.error('Failed to request changes:', err);
    } finally {
      setShowModal(false);
      setSelectedDeliverable(null);
      setFeedbackText('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" /> Deliverables & Asset Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review design prototypes, code deliverables, and reports. Approve assets or request changes.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Client Feedback Hub
        </div>
      </div>

      {/* Deliverables Grid */}
      {deliverables.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
          No project deliverables uploaded for client review yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliverables.map((item) => (
          <div
            key={item._id}
            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition-all ${
              item.status === 'Approved'
                ? 'bg-slate-900/90 border-emerald-500/30'
                : item.status === 'Changes Requested'
                ? 'bg-slate-900/90 border-rose-500/30'
                : 'bg-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                  {item.type || 'Document'}
                </span>

                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    item.status === 'Approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'Changes Requested'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                  }`}
                >
                  {item.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {item.status === 'Changes Requested' && <XCircle className="w-3.5 h-3.5" />}
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-mono truncate underline"
                >
                  <ArrowUpRight className="w-4 h-4" /> {item.fileUrl}
                </a>
              </div>

              {/* Display existing Feedback if present */}
              {item.clientFeedback && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-indigo-400" /> Client Feedback History:
                  </span>
                  <p className="text-slate-200 italic font-normal">"{item.clientFeedback}"</p>
                </div>
              )}
            </div>

            {/* PROMINENT ACTION BUTTONS FOR ITEMS PENDING REVIEW */}
            {item.status === 'Pending Review' && (
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                {/* Approve Button (Green) */}
                <button
                  onClick={() => handleApprove(item._id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Deliverable
                </button>

                {/* Request Changes Button (Red) */}
                <button
                  onClick={() => openChangesModal(item)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Request Changes
                </button>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* REQUEST CHANGES MODAL */}
      {showModal && selectedDeliverable && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-400" /> Request Revision & Feedback
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestChangesSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Deliverable Title:</span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {selectedDeliverable.title}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Specify Required Changes & Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please describe what updates or revisions are needed before final approval..."
                  className="w-full bg-slate-950 text-xs p-3.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Revision Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
