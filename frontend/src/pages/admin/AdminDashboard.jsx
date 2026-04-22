import { useQuery } from '@tanstack/react-query';
import { getAdminReports } from '../../api/admin';
import { 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ClipboardCheck,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: getAdminReports,
  });

  if (isLoading) return (
    <div className="p-20 text-center animate-pulse text-accent text-[10px] font-black uppercase tracking-[0.3em]">
      Crunching system data...
    </div>
  );

  const { overview, stale = [], usage = [], rates = [] } = data || {};

  const overviewCards = [
    { label: 'Total Requests', value: overview?.total, icon: BarChart3 },
    { label: 'Pending', value: overview?.pending, icon: Clock, highlight: 'amber' },
    { label: 'Approved', value: overview?.approved, icon: ClipboardCheck, highlight: 'green' },
    { label: 'Rejected', value: overview?.rejected, icon: XCircle, highlight: 'red' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="border-b border-primary/10 pb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-3">Administrator</p>
        <h1 className="font-headline text-4xl font-black text-primary tracking-tight">System Analytics</h1>
        <p className="text-secondary mt-2 text-sm font-light italic">
          Real-time monitoring of attendance requests and coordinator performance.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="bg-surface border border-primary/10 p-6 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black text-secondary uppercase tracking-[0.25em]">{card.label}</p>
              <card.icon className={`w-4 h-4 ${
                card.highlight === 'amber' ? 'text-amber-500' :
                card.highlight === 'green' ? 'text-green-600' :
                card.highlight === 'red' ? 'text-red-500' :
                'text-secondary'
              }`} />
            </div>
            <p className="font-headline text-4xl font-black text-primary">{card.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stale Requests */}
        <div className="bg-surface border border-primary/10 overflow-hidden">
          <div className="p-6 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Stale Requests (&gt; 48hrs)</h3>
            </div>
            <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 uppercase tracking-wide">Attention</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary/5 text-[9px] uppercase font-black text-secondary tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pending Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {stale.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-secondary text-[10px] uppercase tracking-widest font-bold italic">No stale requests. System is healthy.</td></tr>
                ) : (
                  stale.map((req) => (
                    <tr key={req.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary text-sm">{req.studentName}</td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-black px-2 py-1 bg-primary/5 text-secondary uppercase tracking-wider">{req.status}</span>
                      </td>
                      <td className="px-6 py-4 text-amber-600 font-bold text-sm font-mono">
                        {Math.floor((Date.now() - new Date(req.submittedAt)) / (1000 * 60 * 60))} hours
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Usage Students */}
        <div className="bg-surface border border-primary/10 overflow-hidden">
          <div className="p-6 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">High Usage Monitoring</h3>
            </div>
            <span className="text-[9px] font-black bg-accent/10 text-accent border border-accent/20 px-2 py-1 uppercase tracking-wide">Critical Threshold</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary/5 text-[9px] uppercase font-black text-secondary tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">OD Used</th>
                  <th className="px-6 py-4 text-center">MED Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {usage.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-secondary text-[10px] uppercase tracking-widest font-bold italic">No students above threshold.</td></tr>
                ) : (
                  usage.map((stu) => (
                    <tr key={stu.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{stu.name}</td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className={`font-black ${stu.odUsed >= 4 ? 'text-red-500' : 'text-secondary'}`}>{stu.odUsed}/5</span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className={`font-black ${stu.medicalUsed >= 4 ? 'text-red-500' : 'text-secondary'}`}>{stu.medicalUsed}/5</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approval Rates */}
      <div className="bg-surface border border-primary/10 overflow-hidden">
        <div className="p-6 border-b border-primary/10 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Coordinator Approval Rates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary/5 text-[9px] uppercase font-black text-secondary tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Coordinator</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4 text-center">Approved</th>
                <th className="px-8 py-4 text-center">Rejected</th>
                <th className="px-8 py-4 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {rates.map((coord, idx) => (
                <tr key={idx} className="hover:bg-primary/[0.02] transition-colors">
                  <td className="px-8 py-4 font-bold text-primary">{coord.name}</td>
                  <td className="px-8 py-4 text-[9px] text-secondary font-black uppercase tracking-wider">{coord.role}</td>
                  <td className="px-8 py-4 text-center font-black text-green-600">{coord.approved}</td>
                  <td className="px-8 py-4 text-center font-black text-red-500">{coord.rejected}</td>
                  <td className="px-8 py-4 text-right font-black text-accent font-mono">
                    {coord.total === 0 ? '0%' : `${Math.round((coord.approved / coord.total) * 100)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
