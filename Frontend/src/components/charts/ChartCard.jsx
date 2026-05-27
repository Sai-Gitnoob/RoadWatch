import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';

export default function ChartCard({ title, type = 'bar', data, className = '' }) {
  const COLORS = {
    pending: '#EF4444', // red for pending
    assigned: '#F59E0B', // orange for assigned
    inprogress: '#3B82F6', // keep blue for in progress
    resolved: '#22C55E', // green for resolved
    delayed: '#EF4444', // red (kept for any delayed usage)
    critical: '#EF4444', // red for critical
  };

  return (
    <Card className={`p-6 shadow-sm border-slate-200 ${className}`} hover={false}>
      <SectionHeader title={title} />
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }}
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} 
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
              />

              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase().replace(/\s+/g, '')] || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase().replace(/\s+/g, '')] || '#3B82F6'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600, color: '#64748B' }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
