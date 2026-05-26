import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle, AlertTriangle, FileText, 
  ChevronRight, MapPin, Calendar, Plus, UserCheck, Activity 
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, StatCard, StatusBadge, PageHeader, SectionHeader } from '../components/ui';
import ChartCard from '../components/charts/ChartCard';

function isDelayed(complaint) {
  if (!complaint.createdAt) return false;
  const days = (Date.now() - new Date(complaint.createdAt).getTime()) / 86400000;
  return complaint.status !== 'resolved' && days > 7;
}

function getSeverityBadge(sev) {
  const s = (sev || 'low').toLowerCase();
  let bg = 'bg-slate-700 text-white';
  if (s === 'medium') bg = 'bg-amber-500 text-white';
  if (s === 'high') bg = 'bg-red-500 text-white';
  if (s === 'critical') bg = 'bg-red-900 text-white';
  
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  
  return (
    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold text-center min-w-[70px] ${bg}`}>
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const complaints = useAppStore((s) => s.complaints);
  const navigate   = useNavigate();

  const stats = useMemo(() => {
    let pending = 0;
    let assigned = 0;
    let inProgress = 0;
    let resolved = 0;

    complaints.forEach((c) => {
      if (c.status === 'resolved') {
        resolved++;
      } else if (c.status === 'in-progress') {
        inProgress++;
      } else if (c.status === 'assigned') {
        assigned++;
      } else {
        pending++;
      }
    });

    return {
      pending,
      assigned,
      inProgress,
      resolved,
    };
  }, [complaints]);

  const customStatusData = useMemo(() => {
    return [
      { name: 'Pending', value: stats.pending },
      { name: 'Assigned', value: stats.assigned },
      { name: 'In Progress', value: stats.inProgress },
      { name: 'Resolved', value: stats.resolved },
    ];
  }, [stats]);

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <PageHeader 
          title="Dashboard Overview" 
          subtitle="Real-time municipal data and infrastructure health monitoring for Mumbai." 
          className="mb-0"
        />
        <button 
          onClick={() => navigate('/complaint')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} /> New Report
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard value={stats.pending}    label="Pending"      icon={Clock}         status="danger" />
        <StatCard value={stats.assigned}   label="Assigned"     icon={UserCheck}     status="warning" />
        <StatCard value={stats.inProgress} label="In Progress"  icon={Activity}      status="info" />
        <StatCard value={stats.resolved}   label="Resolved"     icon={CheckCircle}   status="success" />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Report Status Distribution" data={customStatusData} type="pie" />
        <ChartCard title="Pipeline Volume" data={customStatusData} type="bar" />
      </div>

      {/* Recent Complaints */}
      <div className="space-y-6">
        <div className="px-1">
          <SectionHeader 
            title="Recent Complaints" 
            subtitle="Latest reported issues across the city" 
          />
        </div>
        <Card className="p-0 overflow-hidden shadow-sm" hover={false}>
          {complaints.length === 0 ? (
            <div className="py-20 text-center bg-bg-base">
              <p className="text-sm font-medium text-text-muted">No reports found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-base/50">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Road</th>
                    <th className="px-6 py-4 text-center">Issue</th>
                    <th className="px-6 py-4 text-center">Severity</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-bg-surface">
                  {complaints.slice(0, 10).map((c, idx) => {
                    const delayed = isDelayed(c);
                    const formatDate = (dateVal) => {
                      if (!dateVal) return '';
                      const d = new Date(dateVal);
                      return isNaN(d) ? '' : d.toLocaleDateString();
                    };
                    const dateStr = formatDate(c.createdAt);
                    const roadName = c.roadName || c.location?.split(',')[0] || 'Unknown Road';
                    
                    return (
                      <tr key={c.id} className="hover:bg-bg-base/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-text-muted whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            #{idx + 1}
                            {delayed && <AlertTriangle size={14} className="text-danger flex-shrink-0" title="Overdue" />}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-text-main whitespace-nowrap">
                          {roadName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-text-muted whitespace-nowrap">
                          {c.issueType}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {getSeverityBadge(c.severity)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-text-muted whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/dashboard/complaint/${c.id}`)}
                            className="text-sm font-bold text-primary hover:text-primary-light hover:underline transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
