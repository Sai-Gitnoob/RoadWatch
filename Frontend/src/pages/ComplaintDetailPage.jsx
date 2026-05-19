import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, User,
  Shield, AlertTriangle, CheckCircle, Clock, FileText, Phone
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, SectionHeader, PageHeader, StatusBadge } from '../components/ui';
import ChartCard from '../components/charts/ChartCard';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const complaints = useAppStore((s) => s.complaints);
  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return (
      <PageContainer className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={48} className="text-warning mb-6" />
        <PageHeader title="Incident Not Found" subtitle="The requested intelligence record is either encrypted or does not exist in the current sector." />
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg">
          <ArrowLeft size={16} /> Return to Command Center
        </button>
      </PageContainer>
    );
  }

  const chartData = [
    { name: 'Resolution Probability', value: 85 },
    { name: 'Resource Allocation', value: 65 },
    { name: 'Public Sentiment', value: 45 },
  ];

  const daysAgo = Math.floor((Date.now() - new Date(complaint.createdAt).getTime()) / 86400000);
  const isDelayed = complaint.status !== 'resolved' && daysAgo > 7;

  return (
    <PageContainer>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Operations
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <StatusBadge status={complaint.status} />
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Incident #{complaint.id.slice(-8).toUpperCase()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter uppercase tracking-wider mb-6 leading-tight">
            {complaint.issueType}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm font-bold text-text-muted">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              {complaint.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className={`px-6 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest
            ${complaint.severity === 'critical' ? 'border-danger/30 text-danger bg-danger/5' : 'border-border-subtle text-text-muted bg-bg-base/30'}`}>
            Priority: {complaint.severity}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-30">
        <div className="lg:col-span-2 space-y-10">
          <Card className="p-10" hover={false}>
            <SectionHeader title="Situational Analysis" />
            <p className="text-lg font-medium text-text-main leading-relaxed mb-8">
              {complaint.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-bg-base/30 border border-border-subtle">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Assigned Agent</p>
                  <p className="text-sm font-black text-text-main">{complaint.assignedTo || 'Municipal Taskforce 07'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Verification Status</p>
                  <p className="text-sm font-black text-text-main">Geospatially Confirmed</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChartCard title="Predictive Metrics" data={chartData} type="bar" className="h-full" />
            <Card className="p-8 flex flex-col justify-center text-center" hover={false}>
              <SectionHeader title="Municipal Response" className="justify-center" />
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-success" />
              </div>
              <p className="text-sm font-bold text-text-main mb-2">Operational Integrity High</p>
              <p className="text-xs text-text-muted">Estimated completion: 48-72 Operational Hours</p>
            </Card>
          </div>


        </div>

        <div className="space-y-8">
          <SectionHeader title="Activity Timeline" />
          <div className="relative pl-8 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border-subtle">
            {[
              { status: 'Resolved', time: 'Pending Execution', desc: 'Municipal repairs scheduled for next cycle.', icon: CheckCircle, color: 'text-text-muted' },
              { status: 'In Progress', time: '12h ago', desc: 'Taskforce dispatched to coordinates.', icon: Clock, color: 'text-info' },
              { status: 'Validated', time: '18h ago', desc: 'Geospatial AI confirmed reported hazard.', icon: Shield, color: 'text-primary' },
              { status: 'Filed', time: '24h ago', desc: 'Citizen report entered into neural pipeline.', icon: FileText, color: 'text-success' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-2 border-border-subtle flex items-center justify-center z-10 ${step.color}`}>
                  <step.icon size={12} />
                </div>
                <div>
                  <p className="text-xs font-black text-text-main uppercase tracking-tight">{step.status}</p>
                  <p className="text-[10px] text-text-muted font-bold mb-2">{step.time}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
