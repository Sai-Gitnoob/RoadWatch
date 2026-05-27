import { useEffect, useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Clock, CheckCircle } from 'lucide-react';

const COLORS = ['#EF4444', '#F59E0B', '#22C55E']; // High, Med, Low
const STATUS_COLORS = { pending: '#F59E0B', assigned: '#3B82F6', 'in-progress': '#2563EB', resolved: '#22C55E' };

export default function AdminStatistics() {
  const { complaints, fetchComplaints } = useAppStore();

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Derived Metrics
  const total = complaints.length;
  const active = complaints.filter(c => c.status !== 'resolved').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;

  // Pie Chart Data (Severity)
  const severityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    complaints.forEach(c => {
      if (counts[c.severity] !== undefined) counts[c.severity]++;
    });
    return [
      { name: 'High Priority', value: counts.high },
      { name: 'Medium Priority', value: counts.medium },
      { name: 'Low Priority', value: counts.low },
    ];
  }, [complaints]);

  // Bar Chart Data (Status)
  const statusData = useMemo(() => {
    const counts = { pending: 0, assigned: 0, 'in-progress': 0, resolved: 0 };
    complaints.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });
    return [
      { name: 'Pending', count: counts.pending, fill: STATUS_COLORS.pending },
      { name: 'Assigned', count: counts.assigned, fill: STATUS_COLORS.assigned },
      { name: 'In Progress', count: counts['in-progress'], fill: STATUS_COLORS['in-progress'] },
      { name: 'Resolved', count: counts.resolved, fill: STATUS_COLORS.resolved },
    ];
  }, [complaints]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Platform Statistics</h1>
        <p className="text-slate-400 font-medium">Real-time metrics on civic infrastructure complaints.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Filed</p>
            <p className="text-3xl font-extrabold text-white">{total}</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-warning/20 text-warning flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-extrabold text-white">{active}</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
            <p className="text-3xl font-extrabold text-white">{resolved}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Severity Breakdown */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Severity Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {severityData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs font-semibold text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Status Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
