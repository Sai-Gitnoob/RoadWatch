import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { AlertTriangle, Clock, MapPin, Hash, ShieldAlert } from 'lucide-react';

const severityColors = {
  high: 'bg-danger text-white border-danger',
  medium: 'bg-warning text-white border-warning',
  low: 'bg-success text-white border-success'
};

const severityWeight = {
  high: 3,
  medium: 2,
  low: 1
};

export default function AdminActiveComplaints() {
  const { complaints, fetchComplaints } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Filter out resolved complaints
  const activeComplaints = complaints.filter(c => c.status !== 'resolved');

  // Sort: High -> Medium -> Low, then Oldest -> Newest
  const sortedComplaints = [...activeComplaints].sort((a, b) => {
    const sevA = severityWeight[a.severity] || 0;
    const sevB = severityWeight[b.severity] || 0;

    if (sevA !== sevB) {
      return sevB - sevA; // Descending severity
    }

    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB; // Ascending age (oldest first)
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Active Complaints</h1>
        <p className="text-slate-400 font-medium">Manage and prioritize unresolved municipal issues.</p>
      </div>

      <div className="grid gap-4">
        {sortedComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700">
            <ShieldAlert size={48} className="text-slate-500 mb-4" />
            <p className="text-lg font-bold text-slate-300">No active complaints</p>
            <p className="text-slate-500 text-sm">All clear! The city is looking good.</p>
          </div>
        ) : (
          sortedComplaints.map(complaint => (
            <div key={complaint.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColors[complaint.severity] || severityColors.low}`}>
                    {complaint.severity || 'low'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Hash size={12} />
                    {complaint.ticketId}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1 leading-tight">{complaint.issueType}</h3>

                <p className="text-sm font-medium text-slate-300 flex items-start gap-1.5 line-clamp-1">
                  <MapPin size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{complaint.roadName} • <span className="text-slate-500">{typeof complaint.location === 'string' ? complaint.location : (complaint.location?.landmark || complaint.location?.area || 'Mumbai')}</span></span>
                </p>
              </div>

              <div className="flex items-center md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                  className="w-full md:w-32 bg-primary hover:bg-primary-light text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm"
                >
                  Take Action
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
