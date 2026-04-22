import { getPendingRequests, getCoordinatorStats, downloadCoordinatorExcel, getYearReports } from '../../api/coordinator';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardList, 
  Calendar, 
  ChevronRight,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ArrowRightLeft,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import RequestDetailModal from '../../components/RequestDetailModal';

const PendingList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or REPORTS
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL, OD_MED, SPECIAL
  const [divisionFilter, setDivisionFilter] = useState('ALL'); // ALL, A, B, C (for reports)
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['pendingRequests', user?.role],
    queryFn: () => getPendingRequests(user.role),
    enabled: !!user,
  });

  const { data: statsData } = useQuery({
    queryKey: ['coordinatorStats', user?.role],
    queryFn: getCoordinatorStats,
    enabled: !!user && (user.role === 'CLASS_COORD' || user.role === 'YEAR_COORD')
  });

  const { data: reportData } = useQuery({
    queryKey: ['yearReports', user?.role],
    queryFn: getYearReports,
    enabled: !!user && user.role === 'YEAR_COORD' && activeTab === 'REPORTS'
  });

  const requests = pageData?.requests || [];
  const actingAs = pageData?.actingAs;
  const substituteForName = pageData?.substituteForName;

  // Filtering: Category, Search, and Division (for reports)
  const filteredRequests = useMemo(() => {
    let list = activeTab === 'PENDING' ? [...requests] : [...(reportData?.data || [])];
    
    // Sort pending by oldest first
    if (activeTab === 'PENDING') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // Category Filter
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'OD_MED') {
        list = list.filter(r => r.leaveType === 'OD' || r.leaveType === 'MEDICAL');
      } else if (categoryFilter === 'SPECIAL') {
        list = list.filter(r => r.leaveType === 'SPECIAL_OD');
      }
    }

    // Division Filter (Reports focus)
    if (divisionFilter !== 'ALL') {
      list = list.filter(r => r.student.division === divisionFilter);
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.student.name.toLowerCase().includes(q) || 
        r.student.rollNo?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, reportData, categoryFilter, searchQuery, activeTab, divisionFilter]);

  const getTimePendingText = (createdAt) => {
    const diffHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'CLASS_COORD': return 'Class Coordinator Portal';
      case 'YEAR_COORD': return 'Year Coordinator Portal';
      case 'CHAIRPERSON': return 'Chairperson Approval Queue';
      default: return 'Coordinator Dashboard';
    }
  };

  if (isLoading) return (
    <div className="p-20 text-center animate-pulse text-accent text-[10px] font-black uppercase tracking-[0.3em]">
      Fetching pending applications...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Substitute Banner */}
      {actingAs === 'SUBSTITUTE' && substituteForName && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-xs font-bold uppercase tracking-widest">
            You are currently acting as substitute for {substituteForName}. Your approvals will be logged accordingly.
          </p>
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex gap-8 border-b border-primary/10">
        <button 
          onClick={() => setActiveTab('PENDING')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
            activeTab === 'PENDING' ? 'text-accent border-b-2 border-accent' : 'text-secondary hover:text-primary'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Pending Approvals
        </button>
        {user?.role === 'YEAR_COORD' && (
          <button 
            onClick={() => setActiveTab('REPORTS')}
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
              activeTab === 'REPORTS' ? 'text-accent border-b-2 border-accent' : 'text-secondary hover:text-primary'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Excel Sheet View (Reports)
          </button>
        )}
      </div>

      {/* Header */}
      <div className="pb-4 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-3">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-headline text-4xl font-black text-primary tracking-tight">
            {activeTab === 'REPORTS' ? 'Academic Records' : `Good morning, ${user?.name.split(' ')[0]}`}
          </h1>
          <p className="text-secondary mt-2 text-sm font-light italic">
            {activeTab === 'REPORTS' 
              ? `Reviewing finalized attendance records for Year ${user?.year || ''}.`
              : user?.role === 'CHAIRPERSON'
                ? 'Reviewing Special OD requests across all departments.'
                : `Managing pending attendance requests for Year ${user?.year || ''}.`}
          </p>
        </div>
        
        {user?.role === 'CLASS_COORD' && (
          <button 
            onClick={() => downloadCoordinatorExcel()}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary/[0.02] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Download Excel Records
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {activeTab === 'PENDING' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-surface border border-primary/10 flex flex-col justify-between">
            <ClipboardList className="w-5 h-5 text-accent mb-4" />
            <p className="text-[9px] uppercase tracking-widest font-black text-secondary">Pending Review</p>
            <p className="text-3xl font-black text-primary mt-1">{statsData?.pendingReview || 0}</p>
          </div>
          <div className="p-6 bg-surface border border-primary/10 flex flex-col justify-between">
            <CheckCircle className="w-5 h-5 text-green-500 mb-4" />
            <p className="text-[9px] uppercase tracking-widest font-black text-secondary">Approved This Month</p>
            <p className="text-3xl font-black text-primary mt-1">{statsData?.approvedThisMonth || 0}</p>
          </div>
          <div className="p-6 bg-surface border border-primary/10 flex flex-col justify-between">
            <XCircle className="w-5 h-5 text-red-500 mb-4" />
            <p className="text-[9px] uppercase tracking-widest font-black text-secondary">Rejected This Month</p>
            <p className="text-3xl font-black text-primary mt-1">{statsData?.rejectedThisMonth || 0}</p>
          </div>
          <div className="p-6 bg-surface border border-primary/10 flex flex-col justify-between">
            {user?.role === 'YEAR_COORD' ? (
               <>
                 <ArrowRightLeft className="w-5 h-5 text-blue-500 mb-4" />
                 <p className="text-[9px] uppercase tracking-widest font-black text-secondary">Forwarded to Chairperson</p>
                 <p className="text-3xl font-black text-primary mt-1">{statsData?.forwardedToChairperson || 0}</p>
               </>
            ) : (
               <>
                 <Clock className="w-5 h-5 text-blue-500 mb-4" />
                 <p className="text-[9px] uppercase tracking-widest font-black text-secondary">Avg. Response Time</p>
                 <p className="text-3xl font-black text-primary mt-1">{statsData?.avgResponseTimeHours || 0} <span className="text-sm font-bold text-secondary tracking-normal">hrs</span></p>
               </>
            )}
          </div>
        </div>
      )}

      {/* Over 24h Warning Banner */}
      {pendingOver24h.length > 0 && (
        <div 
          className="bg-amber-50 border border-amber-200 text-amber-900 p-4 flex justify-between items-center cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => {
            document.getElementById('pending-table').scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-bold">
              You have {pendingOver24h.length} request{pendingOver24h.length > 1 ? 's' : ''} pending for over 24 hours. Please review {pendingOver24h.length > 1 ? 'them' : 'it'}.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600" />
        </div>
      )}

      {/* Table & Reports Section */}
      <div id="pending-table" className="bg-surface border border-primary/10 overflow-hidden">
        <div className="p-6 border-b border-primary/10 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                {activeTab === 'REPORTS' ? 'Approved Records' : 'Pending Approvals'}
                <span className="ml-2 text-secondary font-normal">({filteredRequests.length})</span>
              </h3>
            </div>
            
            {/* Division Sub-tabs for Reports */}
            {activeTab === 'REPORTS' && (
              <div className="flex gap-2">
                {['ALL', 'A', 'B', 'C'].map(div => (
                  <button
                    key={div}
                    onClick={() => setDivisionFilter(div)}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                      divisionFilter === div 
                        ? 'bg-primary text-background' 
                        : 'bg-primary/5 text-secondary hover:bg-primary/10'
                    }`}
                  >
                    {div === 'ALL' ? 'All Divisions' : `Div ${div}`}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-primary/10 text-[10px] font-black uppercase text-primary tracking-widest focus:border-primary outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="OD_MED">Attendance (OD/Med)</option>
              <option value="SPECIAL">Special OD</option>
            </select>
            <div className="relative w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name or roll..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-primary/10 text-sm text-primary placeholder-secondary/50 focus:border-primary transition-all outline-none font-body"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/5 text-[9px] font-black text-secondary uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Student Identity</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Dates / Count</th>
                <th className="px-8 py-4">{activeTab === 'PENDING' ? (user?.role === 'YEAR_COORD' ? 'Class Coord Action' : 'Submitted On') : 'Finalized On'}</th>
                <th className="px-8 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center text-secondary">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500/70" />
                      </div>
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-primary">You are all caught up</p>
                      <p className="text-sm">No pending requests in your division.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isOver24h = (Date.now() - new Date(req.createdAt).getTime()) > 24 * 60 * 60 * 1000;
                  
                  return (
                    <tr key={req.id} className={`hover:bg-primary/[0.02] transition-colors group ${isOver24h ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-sm flex-shrink-0">
                            {req.student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{req.student.name}</p>
                              <span className="px-1.5 py-0.5 bg-primary/5 text-primary text-[7px] font-black uppercase tracking-wider border border-primary/10">Div {req.student.division}</span>
                              {(req.parentRequest || req.parentRequestId) && activeTab === 'PENDING' && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black uppercase tracking-wider rounded-sm">Resubmission</span>
                              )}
                            </div>
                            <p className="text-[9px] text-secondary uppercase font-bold tracking-wider mt-0.5">#{req.student.rollNo || req.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wide border ${
                          req.leaveType === 'SPECIAL_OD' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          req.leaveType === 'MEDICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-accent/10 text-accent border-accent/20'
                        }`}>
                          {req.leaveType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-primary font-mono">
                          <Calendar className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                          {new Date(req.fromDate).toLocaleDateString('en-GB')} – {new Date(req.toDate).toLocaleDateString('en-GB')}
                        </div>
                        <p className="text-[9px] text-secondary font-black mt-1 ml-5 uppercase tracking-widest">{req.daysCount} days total</p>
                      </td>
                      <td className="px-8 py-6">
                        {activeTab === 'PENDING' && user?.role === 'YEAR_COORD' ? (
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-primary">Approved by {req.classCoordApproval?.name || 'Class Coord'}</p>
                             <p className="text-[8px] text-secondary font-black uppercase tracking-widest">{new Date(req.classCoordApproval?.at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-primary font-mono">{new Date(activeTab === 'PENDING' ? req.createdAt : req.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                            <p className={`text-[9px] font-black mt-1 uppercase tracking-widest ${isOver24h && activeTab === 'PENDING' ? 'text-amber-600' : 'text-secondary'}`}>
                              {activeTab === 'PENDING' ? getTimePendingText(req.createdAt) : 'FINALIZED'}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }}
                          className="group/btn flex items-center gap-2 px-5 py-2.5 bg-background border border-primary/15 text-secondary text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {activeTab === 'PENDING' ? 'Review' : 'Details'}
                          <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default PendingList;
