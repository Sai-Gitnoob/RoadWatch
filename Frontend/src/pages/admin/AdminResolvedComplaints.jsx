import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { CheckCircle, Clock, MapPin, Hash, ShieldAlert } from 'lucide-react';

const severityColors = {
  high: 'bg-danger text-white border-danger',
  medium: 'bg-warning text-white border-warning',
  low: 'bg-success text-white border-success'
};

export default function AdminResolvedComplaints() {
  const { complaints, fetchComplaints } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Filter ONLY resolved complaints
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  // Sort by resolved date (newest resolved first)
  const sortedComplaints = [...resolvedComplaints].sort((a, b) => {
    const dateA = a.resolvedAt ? new Date(a.resolvedAt).getTime() : new Date(a.updatedAt).getTime();
    const dateB = b.resolvedAt ? new Date(b.resolvedAt).getTime() : new Date(b.updatedAt).getTime();
    return dateB - dateA; // Descending age (newest resolved first)
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Resolved Complaints</h1>
        <p className="text-slate-400 font-medium">History of successfully addressed infrastructure issues.</p>
      </div>

      <div className="grid gap-4">
        {sortedComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700">
            <CheckCircle size={48} className="text-slate-500 mb-4" />
            <p className="text-lg font-bold text-slate-300">No resolved complaints yet</p>
            <p className="text-slate-500 text-sm">Resolved issues will appear here.</p>
          </div>
        ) : (
          sortedComplaints.map(complaint => (
            <div key={complaint.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex-1 opacity-80">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColors[complaint.severity] || severityColors.low}`}>
                    {complaint.severity || 'low'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <CheckCircle size={12} className="text-success" />
                    Resolved: {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : new Date(complaint.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Hash size={12} />
                    {complaint.ticketId}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-slate-200 mb-1 leading-tight line-through">{complaint.issueType}</h3>
                
                <p className="text-sm font-medium text-slate-400 flex items-start gap-1.5 line-clamp-1">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{complaint.roadName} • {typeof complaint.location === 'string' ? complaint.location : (complaint.location?.landmark || complaint.location?.area || 'Mumbai')}</span>
                </p>
              </div>

              <div className="flex items-center md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                  className="w-full md:w-32 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
