
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const RoleDashboard = () => {
  const { role } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealNodes = document.querySelectorAll('.reveal-node');
    revealNodes.forEach(node => {
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [role]);

  const roleConfig: any = {
    coordinator: {
      title: 'Class Coordinator',
      stats: [
        { label: 'Pending Approvals', value: '42', icon: 'pending', color: 'text-primary' },
        { label: 'Validated Today', value: '18', icon: 'check_circle', color: 'text-secondary' },
        { label: 'Flagged Requests', value: '03', icon: 'flag', color: 'text-accent' }
      ],
      actions: ['Batch Process', 'Export Daily Report', 'Notify Students']
    },
    'year-coordinator': {
      title: 'Year-Wise Coordinator',
      stats: [
        { label: 'Final Approvals Due', value: '15', icon: 'rule', color: 'text-primary' },
        { label: 'Medical Clearances', value: '08', icon: 'medical_information', color: 'text-secondary' },
        { label: 'Total Absences', value: '124', icon: 'monitoring', color: 'text-accent' }
      ],
      actions: ['Review Policy', 'Division Analytics', 'Executive Report']
    },
    chairperson: {
      title: 'Chairperson',
      stats: [
        { label: 'Special OD Cases', value: '04', icon: 'stars', color: 'text-primary' },
        { label: 'Audit Exceptions', value: '02', icon: 'fact_check', color: 'text-secondary' },
        { label: 'Global Compliance', value: '98%', icon: 'security', color: 'text-accent' }
      ],
      actions: ['Authorize Special OD', 'Audit Ledger', 'Policy Override']
    },
    admin: {
      title: 'Administrator',
      stats: [
        { label: 'Active Users', value: '1.2k', icon: 'group', color: 'text-primary' },
        { label: 'System Health', value: 'Stable', icon: 'dns', color: 'text-secondary' },
        { label: 'Pending Configs', value: '00', icon: 'settings', color: 'text-accent' }
      ],
      actions: ['Configure Roles', 'System Analytics', 'Database Maintenance']
    }
  };

  const config = roleConfig[role || 'coordinator'] || roleConfig.coordinator;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-primary text-background flex flex-col p-8 fixed h-full z-50">
        <div className="mb-16">
          <Link to="/" className="text-2xl font-brand italic font-bold tracking-tighter text-background">AttendEase</Link>
          <p className="text-[9px] uppercase tracking-[0.3em] text-accent mt-2">{config.title} Terminal</p>
        </div>

        <nav className="flex-1 space-y-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-4 border-l-2 transition-all ${activeTab === 'overview' ? 'border-accent bg-background/5 text-accent' : 'border-transparent opacity-50 hover:opacity-100 hover:bg-background/5'}`}
          >
            Command Center
          </button>
          <button 
            className="w-full text-left text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-4 border-l-2 border-transparent opacity-50 hover:opacity-100 hover:bg-background/5 transition-all"
          >
            Process Ledger
          </button>
          <button 
            className="w-full text-left text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-4 border-l-2 border-transparent opacity-50 hover:opacity-100 hover:bg-background/5 transition-all"
          >
            Analytics Engine
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-background/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-background font-bold">
              {config.title[0]}
            </div>
            <div>
              <p className="text-xs font-bold">Admin Authority</p>
              <p className="text-[9px] opacity-60 uppercase tracking-widest">{role}</p>
            </div>
          </div>
          <button className="w-full py-3 bg-secondary text-background text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-all">
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12">
        <header className="flex justify-between items-end mb-16 reveal-node">
          <div>
            <h1 className="text-5xl font-headline font-bold text-primary mb-2">{config.title} Dashboard</h1>
            <p className="text-sm text-secondary font-medium italic">High-level administrative overview and control terminal.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary opacity-40">Security Status</p>
            <p className="text-lg font-headline font-bold text-green-600 flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              Encrypted
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {config.stats.map((stat: any, i: number) => (
            <div 
              key={stat.label} 
              className="reveal-node portal-hover bg-surface academic-border p-8 cursor-default group"
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`material-symbols-outlined text-4xl ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                  {stat.icon}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/30">System Metric</span>
              </div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-secondary mb-2">{stat.label}</h3>
              <p className={`text-6xl font-headline font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Role Specific Actions */}
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8 reveal-node" style={{ transitionDelay: '400ms' }}>
            <div className="bg-white academic-border p-10 h-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-bold text-primary">Priority Queue</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">Real-time Sync</span>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'REQ-901', student: 'Amit V.', type: 'Medical', time: '2m ago', priority: 'High' },
                  { id: 'REQ-899', student: 'Priya S.', type: 'Standard OD', time: '15m ago', priority: 'Normal' },
                  { id: 'REQ-895', student: 'Rohan M.', type: 'Special OD', time: '1h ago', priority: 'Critical' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 border-b border-primary/5 hover:bg-background transition-colors group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="text-xl font-headline italic font-bold text-primary/20 group-hover:text-secondary transition-colors">{item.id}</div>
                      <div>
                        <p className="font-bold text-primary">{item.student}</p>
                        <p className="text-[10px] uppercase tracking-wider text-primary/40 font-medium">{item.type} • {item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${item.priority === 'Critical' ? 'text-red-500' : 'text-secondary'}`}>
                        {item.priority}
                      </span>
                      <button className="text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/10 px-4 py-2 hover:bg-primary hover:text-background transition-all">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 reveal-node" style={{ transitionDelay: '500ms' }}>
            <div className="bg-primary p-10 h-full flex flex-col">
              <h3 className="text-2xl font-headline font-bold text-background mb-8">Quick Actions</h3>
              <div className="space-y-4">
                {config.actions.map((action: string) => (
                  <button key={action} className="w-full py-4 border border-background/20 text-background text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-accent hover:text-primary hover:border-accent transition-all flex justify-between items-center px-6">
                    {action}
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 p-6 bg-background/5 border border-background/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-accent mb-2">System Notice</p>
                <p className="text-[10px] text-background/50 leading-relaxed italic">
                  Daily reports will be automatically dispatched at 23:59 IST to the respective department heads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleDashboard;
