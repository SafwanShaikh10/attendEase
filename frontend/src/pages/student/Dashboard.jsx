import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentDashboard, cancelRequest } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  X,
  History,
  RotateCcw,
  FileDown,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Circular Progress Ring ── */
const ProgressRing = ({ value, max, color = 'primary', size = 64, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  const colorMap = {
    primary: { stroke: '#333333', trail: 'rgba(51,51,51,0.10)' },
    accent:  { stroke: '#4a5d4e', trail: 'rgba(74,93,78,0.10)' },
    amber:   { stroke: '#b45309', trail: 'rgba(180,83,9,0.10)' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={c.trail} strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={c.stroke} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out" />
    </svg>
  );
};

/* ── Status badge styles ── */
const statusConfig = {
  SUBMITTED:              { label: 'Submitted',    bg: 'bg-primary/5',   text: 'text-secondary',  border: 'border-primary/10' },
  CLASS_COORD_APPROVED:   { label: 'In Progress',  bg: 'bg-amber-50',    text: 'text-amber-700',  border: 'border-amber-200' },
  YEAR_COORD_APPROVED:    { label: 'In Progress',  bg: 'bg-amber-50',    text: 'text-amber-700',  border: 'border-amber-200' },
  CHAIRPERSON_APPROVED:   { label: 'Approved',     bg: 'bg-green-50',    text: 'text-green-700',  border: 'border-green-200' },
  REJECTED:               { label: 'Rejected',     bg: 'bg-red-50',      text: 'text-red-700',    border: 'border-red-200' },
  RESUBMISSION_REQUESTED: { label: 'Resubmit',     bg: 'bg-orange-50',   text: 'text-orange-700', border: 'border-orange-200' },
  CANCELLED:              { label: 'Cancelled',    bg: 'bg-primary/5',   text: 'text-secondary',  border: 'border-primary/10' },
};

/* ── Greeting helper ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: getStudentDashboard,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentDashboard']);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  const { requests = [], balances = [] } = data || {};
  const currentBalance = balances[0] || { odUsed: 0, medicalUsed: 0 };
  const activeRequests = requests.filter(r =>
    !['CHAIRPERSON_APPROVED', 'YEAR_COORD_APPROVED', 'REJECTED', 'CANCELLED'].includes(r.status)
    || (r.status === 'YEAR_COORD_APPROVED' && r.leaveType === 'SPECIAL_OD')
  ).length;

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-8">

      {/* ── Greeting Bar ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline text-3xl font-black text-primary tracking-tight leading-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em] mt-2">{today}</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* OD Used */}
        <div className="bg-surface border border-primary/10 p-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <ProgressRing value={currentBalance.odUsed} max={5} color="primary" size={72} strokeWidth={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-primary font-headline">{currentBalance.odUsed}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-1">OD Used</p>
            <p className="text-2xl font-black text-primary font-headline">
              {currentBalance.odUsed}<span className="text-primary/20 text-base">/5</span>
            </p>
            <p className="text-[10px] text-secondary mt-1">{5 - currentBalance.odUsed} remaining this semester</p>
          </div>
        </div>

        {/* Medical Used */}
        <div className="bg-surface border border-primary/10 p-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <ProgressRing value={currentBalance.medicalUsed} max={5} color="accent" size={72} strokeWidth={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-accent font-headline">{currentBalance.medicalUsed}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-1">Medical Used</p>
            <p className="text-2xl font-black text-primary font-headline">
              {currentBalance.medicalUsed}<span className="text-primary/20 text-base">/5</span>
            </p>
            <p className="text-[10px] text-secondary mt-1">{5 - currentBalance.medicalUsed} remaining this semester</p>
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-surface border border-primary/10 p-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-full bg-primary/5 border-2 border-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary/40" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-1">Active Requests</p>
            <p className="text-2xl font-black text-primary font-headline">{activeRequests}</p>
            <p className="text-[10px] text-secondary mt-1">Currently in progress</p>
          </div>
        </div>
      </div>

      {/* ── Main Content: Table + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left — My Requests Table (3/4 width) */}
        <div className="lg:col-span-3 bg-surface border border-primary/10 overflow-hidden">
          <div className="p-6 border-b border-primary/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">My Requests</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/[0.03] text-secondary text-[9px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-secondary">
                      <History className="w-10 h-10 mx-auto mb-4 opacity-10" />
                      <p className="text-[10px] uppercase tracking-widest font-bold">No leave requests found</p>
                      <p className="text-[10px] text-secondary/60 mt-1">Click "Apply for Leave" to get started</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const cfg = statusConfig[req.status] || statusConfig.SUBMITTED;
                    return (
                      <tr key={req.id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-primary">{req.leaveType.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-secondary uppercase tracking-wide">{req.letterType} Letter</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-primary font-medium font-mono">
                            {new Date(req.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(req.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-primary">{req.daysCount}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 text-[9px] font-bold border uppercase tracking-wide ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1">
                            {req.status === 'SUBMITTED' && (
                              <button
                                onClick={() => cancelMutation.mutate(req.id)}
                                className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                                title="Cancel Request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            {(req.status === 'REJECTED' || req.status === 'RESUBMISSION_REQUESTED') && (
                              <button
                                onClick={() => navigate(`/student/submit?resubmit=${req.id}`)}
                                className="p-2 text-accent hover:bg-accent/10 transition-colors"
                                title="Resubmit"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/student/track/${req.id}`)}
                              className="group/view flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                              title="View Tracker"
                            >
                              View
                              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/view:opacity-100 group-hover/view:translate-x-0 transition-all" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Quick Actions (1/4 width) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-primary p-6 text-background">
            <button
              onClick={() => navigate('/student/submit')}
              className="group w-full flex items-center justify-between py-4 px-5 bg-background/10 hover:bg-background/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-4 h-4 text-background/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-background">Apply for Leave</span>
              </div>
              <ArrowRight className="w-4 h-4 text-background/40 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>


          {/* Mini balance summary */}
          <div className="bg-surface border border-primary/10 p-5">
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-4">Semester Balance</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">OD Remaining</span>
                <span className="text-sm font-black text-primary font-headline">{5 - currentBalance.odUsed}</span>
              </div>
              <div className="h-px bg-primary/5" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">Medical Remaining</span>
                <span className="text-sm font-black text-primary font-headline">{5 - currentBalance.medicalUsed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
