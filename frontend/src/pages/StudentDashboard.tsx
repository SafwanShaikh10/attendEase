
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Reveal animation logic
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
  }, []);

  const stats = [
    { label: 'OD Used', value: '12', icon: 'history_edu', color: 'text-primary' },
    { label: 'Medical Used', value: '05', icon: 'medical_services', color: 'text-secondary' },
    { label: 'Pending', value: '02', icon: 'pending_actions', color: 'text-accent' }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-primary text-background flex flex-col p-8 fixed h-full z-50">
        <div className="mb-16">
          <Link to="/" className="text-2xl font-brand italic font-bold tracking-tighter text-background">AttendEase</Link>
          <p className="text-[9px] uppercase tracking-[0.3em] text-accent mt-2">Student Portal</p>
        </div>

        <nav className="flex-1 space-y-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-4 border-l-2 transition-all ${activeTab === 'overview' ? 'border-accent bg-background/5 text-accent' : 'border-transparent opacity-50 hover:opacity-100 hover:bg-background/5'}`}
          >
            Dashboard Overview
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full text-left text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-4 border-l-2 transition-all ${activeTab === 'requests' ? 'border-accent bg-background/5 text-accent' : 'border-transparent opacity-50 hover:opacity-100 hover:bg-background/5'}`}
          >
            Leave Requests
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full text-left text-[10px] uppercase tracking-[0.2em] font-bold py-3 px-4 border-l-2 transition-all ${activeTab === 'history' ? 'border-accent bg-background/5 text-accent' : 'border-transparent opacity-50 hover:opacity-100 hover:bg-background/5'}`}
          >
            Request History
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-background/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">SR</div>
            <div>
              <p className="text-xs font-bold">Siddharth R.</p>
              <p className="text-[9px] opacity-60">2021BTECE001</p>
            </div>
          </div>
          <button className="w-full py-3 bg-secondary text-background text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-all">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12">
        <header className="flex justify-between items-end mb-16 reveal-node">
          <div>
            <h1 className="text-5xl font-headline font-bold text-primary mb-2">Welcome Back, Siddharth</h1>
            <p className="text-sm text-secondary font-medium italic">Monitoring your academic attendance and leave status.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary opacity-40">Current Semester</p>
            <p className="text-lg font-headline font-bold text-primary">VI - Autumn 2025</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, i) => (
            <div 
              key={stat.label} 
              className="reveal-node portal-hover bg-surface academic-border p-8 cursor-default group"
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`material-symbols-outlined text-4xl ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                  {stat.icon}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/30">Academic Ledger</span>
              </div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-secondary mb-2">{stat.label}</h3>
              <p className={`text-6xl font-headline font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Actions & Recent */}
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8 reveal-node" style={{ transitionDelay: '400ms' }}>
            <div className="bg-white academic-border p-10 h-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-bold text-primary">Recent Activity</h3>
                <Link to="/student/requests" className="text-[9px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors">View All</Link>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Tech Symposium OD', date: 'Oct 12, 2025', status: 'Pending', type: 'Special OD' },
                  { title: 'Medical Leave - Viral Fever', date: 'Oct 05, 2025', status: 'Approved', type: 'Medical' },
                  { title: 'Workshop Attendance', date: 'Sep 28, 2025', status: 'Approved', type: 'Standard OD' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 border-b border-primary/5 hover:bg-background/50 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                      <div>
                        <p className="font-bold text-primary group-hover:text-secondary transition-colors">{item.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-primary/40 font-medium">{item.type} • {item.date}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] px-3 py-1 font-bold uppercase tracking-widest rounded-full ${item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 reveal-node" style={{ transitionDelay: '500ms' }}>
            <div className="bg-primary p-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-headline font-bold text-background mb-6">New Request</h3>
                <p className="text-sm text-background/60 leading-relaxed mb-10 italic">
                  Initiate a new request for academic OD, medical leave, or special circumstances through our structured system.
                </p>
              </div>
              <button className="w-full py-4 bg-accent text-primary text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-background transition-all">
                Create Application
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
