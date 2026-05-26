import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { complaintService } from '../../services/complaintService';
import { MapPin, Clock, Hash, AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const statusConfig = {
  'pending': { color: 'text-warning bg-warning/10 border-warning/20', label: 'Pending' },
  'assigned': { color: 'text-info bg-info/10 border-info/20', label: 'Assigned' },
  'in-progress': { color: 'text-primary bg-primary/10 border-primary/20', label: 'In Progress' },
  'resolved': { color: 'text-success bg-success/10 border-success/20', label: 'Resolved' }
};

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, token, fetchComplaints, setNotification } = useAppStore();
  const [complaint, setComplaint] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const found = complaints.find(c => c.id === id);
    if (found) {
      setComplaint(found);
    } else {
      // Could fetch single if not in store
      navigate('/admin');
    }
  }, [id, complaints, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await complaintService.updateStatus(id, newStatus, token);
      setNotification({ type: 'success', message: `Complaint marked as ${statusConfig[newStatus].label}` });
      // Refresh the store so dashboard and lists update instantly
      await fetchComplaints();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update status' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!complaint) return (
    <div className="flex h-screen items-center justify-center bg-bg-base">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-24 md:pb-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to List
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Header Details */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusConfig[complaint.status]?.color}`}>
                {statusConfig[complaint.status]?.label || complaint.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-600 text-slate-300">
                {complaint.severity || 'low'} priority
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">{complaint.issueType}</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Ticket ID: {complaint.ticketId}</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700 mb-8 flex flex-wrap gap-3">
          <h3 className="w-full text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Admin Actions</h3>
          
          <button 
            disabled={isUpdating || complaint.status !== 'pending'}
            onClick={() => handleStatusUpdate('assigned')}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-sm bg-info text-white hover:bg-info/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Mark Assigned
          </button>
          
          <button 
            disabled={isUpdating || complaint.status !== 'assigned'}
            onClick={() => handleStatusUpdate('in-progress')}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Mark In Progress
          </button>
          
          <button 
            disabled={isUpdating || complaint.status !== 'in-progress'}
            onClick={() => handleStatusUpdate('resolved')}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-sm bg-success text-white hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Mark Resolved
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                <AlertTriangle size={14} /> Description
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                {complaint.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                <MapPin size={14} /> Location
              </h3>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-2">
                <p className="text-white font-bold">{complaint.roadName}</p>
                <p className="text-slate-400 text-sm font-medium">{complaint.location}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Clock size={14} /> Timeline
            </h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-[11px] before:w-[2px] before:bg-slate-700">
              
              {/* Filed */}
              <div className="relative">
                <div className="absolute -left-6 w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-800" />
                <p className="text-sm font-bold text-white leading-none mb-1">Complaint Filed</p>
                <p className="text-xs text-slate-400 font-medium">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>

              {/* Assigned */}
              {complaint.assignedAt && (
                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 rounded-full bg-info border-2 border-slate-800" />
                  <p className="text-sm font-bold text-white leading-none mb-1">Assigned</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(complaint.assignedAt).toLocaleString()}</p>
                </div>
              )}

              {/* In Progress */}
              {complaint.inProgressAt && (
                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 rounded-full bg-primary border-2 border-slate-800" />
                  <p className="text-sm font-bold text-white leading-none mb-1">In Progress</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(complaint.inProgressAt).toLocaleString()}</p>
                </div>
              )}

              {/* Resolved */}
              {complaint.resolvedAt && (
                <div className="relative">
                  <div className="absolute -left-6 w-3 h-3 rounded-full bg-success border-2 border-slate-800" />
                  <p className="text-sm font-bold text-success leading-none mb-1">Resolved</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(complaint.resolvedAt).toLocaleString()}</p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
