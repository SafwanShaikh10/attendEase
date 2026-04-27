
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  useEffect(() => {
    // Disable automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Ensure we start at the top
    window.scrollTo(0, 0);
    const timer = setTimeout(() => window.scrollTo(0, 0), 10);

    // Instant reveal for navbar
    const navItems = document.querySelectorAll('.nav-reveal');
    navItems.forEach((item) => {
      setTimeout(() => {
        item.classList.add('active');
      }, 100);
    });

    // Intersection Observer for scroll-based reveals
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

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-primary">
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto nav-reveal" style={{ transitionDelay: '100ms' }}>
          <div className="text-3xl font-headline italic font-bold tracking-tighter text-primary">AttendEase</div>
        </div>
        <div className="hidden md:flex flex-col gap-2 items-end pointer-events-auto">
          <a className="text-[10px] uppercase tracking-widest hover:italic transition-all text-primary nav-reveal" href="#journey" style={{ transitionDelay: '200ms' }}>01. Process</a>
          <a className="text-[10px] uppercase tracking-widest hover:italic transition-all text-primary nav-reveal" href="#portals" style={{ transitionDelay: '300ms' }}>02. Roles</a>
          <a className="text-[10px] uppercase tracking-widest hover:italic transition-all text-primary nav-reveal" href="#about" style={{ transitionDelay: '400ms' }}>03. Tech</a>
          <button className="mt-6 bg-primary text-background px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-secondary transition-all nav-reveal" style={{ transitionDelay: '500ms' }}>
            Enter the System
          </button>
        </div>
      </nav>

      <section className="min-h-screen relative flex items-center pt-24 pb-48 px-10">
        <div className="w-full max-w-[1600px] mx-auto swiss-grid">
          <div className="col-span-12 lg:col-span-11">
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] mb-16 border-l-[3px] border-primary pl-6 reveal-node" style={{ transitionDelay: '100ms' }}>Dayananda Sagar University</p>
            <h1 className="text-[clamp(4.5rem,14vw,14rem)] font-bold overlap-text z-10 relative text-primary reveal-node" style={{ transitionDelay: '200ms' }}>
              Leave<br />Requests.
            </h1>
            <div className="mt-12 swiss-grid">
              <div className="col-start-1 lg:col-start-6 col-span-12 lg:col-span-6">
                <h2 className="text-6xl md:text-8xl font-bold mb-12 italic text-secondary reveal-node" style={{ transitionDelay: '300ms' }}>Simplified.</h2>
                <p className="text-xl md:text-2xl text-text-primary/80 max-w-xl leading-relaxed font-light mb-16 italic reveal-node" style={{ transitionDelay: '400ms' }}>
                  A structured, role-based ecosystem for managing academic leave, medical certifications, and specialized OD requests.
                </p>
                <div className="flex flex-wrap gap-12 border-t divider-slate pt-12 reveal-node" style={{ transitionDelay: '500ms' }}>
                  <a className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary" href="#portals">
                    <span className="w-12 h-[1px] bg-primary group-hover:w-20 transition-all"></span>
                    Access Portal
                  </a>
                  <a className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary" href="#journey">
                    <span className="w-12 h-[1px] bg-primary group-hover:w-20 transition-all"></span>
                    Methodology
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-48 bg-surface overflow-hidden" id="journey">
        <div className="flex h-[819px] min-h-[600px]">
          <div className="w-24 md:w-48 flex-shrink-0 flex items-center justify-center border-r border-primary/20 reveal-node">
            <h2 className="vertical-text text-6xl md:text-8xl font-bold uppercase tracking-tighter text-primary">
              The Workflow
            </h2>
          </div>
          <div className="kinetic-scroll flex-1 px-12 md:px-24 items-center">
            <div className="step-card group reveal-node" style={{ transitionDelay: '100ms' }}>
              <div className="bg-background academic-border p-8 md:p-16 h-[500px] flex flex-col justify-between relative overflow-hidden">
                <div className="bleed-text font-bold text-primary">STUDENT</div>
                <div className="relative z-10">
                  <div className="text-6xl font-headline italic font-bold text-secondary mb-8">01/</div>
                  <h3 className="text-4xl md:text-6xl font-bold uppercase leading-none mb-6 text-primary">Student</h3>
                  <p className="text-lg md:text-xl font-medium max-w-xs leading-tight text-primary/80">Submits request with formal reason, digitized letter, and supporting credentials</p>
                </div>
                <div className="mt-auto border-t border-primary/20 pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary">Initiation Phase</span>
                </div>
              </div>
            </div>
            <div className="step-card group reveal-node" style={{ transitionDelay: '200ms' }}>
              <div className="bg-background academic-border p-8 md:p-16 h-[500px] flex flex-col justify-between relative overflow-hidden -rotate-1">
                <div className="bleed-text font-bold text-primary">REVIEW</div>
                <div className="relative z-10">
                  <div className="text-6xl font-headline italic font-bold text-secondary mb-8">02/</div>
                  <h3 className="text-4xl md:text-6xl font-bold uppercase leading-none mb-6 text-primary">Division<br />Lead</h3>
                  <p className="text-lg md:text-xl font-medium max-w-xs leading-tight text-primary/80">Primary verification of division-specific requests and attendance impact</p>
                </div>
                <div className="mt-auto border-t border-primary/20 pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary">Validation Layer</span>
                </div>
              </div>
            </div>
            <div className="step-card group reveal-node" style={{ transitionDelay: '300ms' }}>
              <div className="bg-background academic-border p-8 md:p-16 h-[500px] flex flex-col justify-between relative overflow-hidden rotate-1">
                <div className="bleed-text font-bold text-primary">APPROVAL</div>
                <div className="relative z-10">
                  <div className="text-6xl font-headline italic font-bold text-secondary mb-8">03/</div>
                  <h3 className="text-4xl md:text-6xl font-bold uppercase leading-none mb-6 text-primary">Year<br />Head</h3>
                  <p className="text-lg md:text-xl font-medium max-w-xs leading-tight text-primary/80">Final administrative authority for standard OD and Medical clearances</p>
                </div>
                <div className="mt-auto border-t border-primary/20 pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary">Executive Clearance</span>
                </div>
              </div>
            </div>
            <div className="step-card group reveal-node" style={{ transitionDelay: '400ms' }}>
              <div className="bg-background academic-border p-8 md:p-16 h-[500px] flex flex-col justify-between relative overflow-hidden -rotate-2">
                <div className="bleed-text font-bold text-primary">SPECIAL</div>
                <div className="relative z-10">
                  <div className="text-6xl font-headline italic font-bold text-secondary mb-8">04/</div>
                  <h3 className="text-4xl md:text-6xl font-bold uppercase leading-none mb-6 text-primary">Chairperson</h3>
                  <p className="text-lg md:text-xl font-medium max-w-xs leading-tight text-primary/80">Strategic oversight and authority for Special OD cases and exceptions</p>
                </div>
                <div className="mt-auto border-t border-primary/20 pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary">High Authority</span>
                </div>
              </div>
            </div>
            <div className="step-card group pr-[20vw] reveal-node" style={{ transitionDelay: '500ms' }}>
              <div className="bg-primary academic-border p-8 md:p-16 h-[500px] flex flex-col justify-between relative overflow-hidden border-background">
                <div className="bleed-text font-bold text-background opacity-20">DONE</div>
                <div className="relative z-10 text-background">
                  <div className="text-6xl font-headline italic font-bold text-accent opacity-60 mb-8">05/</div>
                  <h3 className="text-4xl md:text-6xl font-bold uppercase leading-none mb-6">Resolved</h3>
                  <p className="text-lg md:text-xl font-medium max-w-xs leading-tight opacity-90">Central ledger updated and automated notifications dispatched</p>
                </div>
                <div className="mt-auto border-t border-background/20 pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Cycle Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-48 px-10" id="portals">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b divider-slate pb-12 reveal-node">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-primary">Portals</h2>
            <p className="text-right max-w-[280px] text-[10px] uppercase tracking-[0.2em] font-bold text-secondary pb-4 leading-relaxed">Dedicated interfaces optimized for administrative precision and user convenience.</p>
          </div>
          <div className="divide-y divider-slate">
            <Link to="/student/login" className="grid grid-cols-12 py-16 group portal-hover transition-all cursor-pointer px-6 reveal-node block relative z-10" style={{ transitionDelay: '100ms' }}>
              <div className="col-span-1 text-xl font-headline italic opacity-30 text-primary">01</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-bold text-primary">Student</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Submit &amp; Track</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Digital Documentation</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Status Dashboard</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-secondary">arrow_outward</span>
              </div>
            </Link>
            <Link to="/coordinator/login" className="grid grid-cols-12 py-16 group portal-hover transition-all cursor-pointer px-6 reveal-node block relative z-10" style={{ transitionDelay: '200ms' }}>
              <div className="col-span-1 text-xl font-headline italic opacity-30 text-primary">02</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-bold text-primary">Coordinator</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Batch Processing</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Data Export</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Automated Alerts</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-secondary">arrow_outward</span>
              </div>
            </Link>
            <Link to="/year-coordinator/login" className="grid grid-cols-12 py-16 group portal-hover transition-all cursor-pointer px-6 reveal-node block relative z-10" style={{ transitionDelay: '300ms' }}>
              <div className="col-span-1 text-xl font-headline italic opacity-30 text-primary">03</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-bold text-primary">Year Head</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Final Authorization</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Cross-Division View</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Policy Management</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-secondary">arrow_outward</span>
              </div>
            </Link>
            <Link to="/chairperson/login" className="grid grid-cols-12 py-16 group portal-hover transition-all cursor-pointer px-6 reveal-node block relative z-10" style={{ transitionDelay: '400ms' }}>
              <div className="col-span-1 text-xl font-headline italic opacity-30 text-primary">04</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-bold text-primary">Chairperson</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Special Exceptions</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Audit Transparency</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Historical Data</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-secondary">arrow_outward</span>
              </div>
            </Link>
            <Link to="/admin/login" className="grid grid-cols-12 py-16 group portal-hover transition-all cursor-pointer px-6 reveal-node block relative z-10" style={{ transitionDelay: '500ms' }}>
              <div className="col-span-1 text-xl font-headline italic opacity-30 text-primary">05</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-bold text-primary">Administrator</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">System Governance</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Advanced Analytics</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60 text-primary">Role Configuration</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-secondary">arrow_outward</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-48 px-10 bg-primary text-background overflow-hidden" id="about">
        <div className="max-w-[1400px] mx-auto swiss-grid">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="text-6xl md:text-[9rem] font-bold leading-[0.9] mb-24 tracking-tighter text-background reveal-node">Academic Rigor.</h2>
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-10">
                <p className="text-2xl md:text-4xl font-light leading-relaxed mb-16 italic opacity-90 text-background reveal-node" style={{ transitionDelay: '100ms' }}>
                  AttendEase is a professional enterprise solution meticulously engineered to modernize institutional governance and eliminate administrative friction.
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-6 opacity-60 border-t border-background/20 pt-10 text-accent reveal-node" style={{ transitionDelay: '200ms' }}>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">React Framework</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Node.js Runtime</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Relational MySQL</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Prisma ORM</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">RESTful API</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Secure Cloud Storage</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">PDF Engine</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">SMTP Integration</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-end mt-24 lg:mt-0">
            <div className="aspect-[4/5] bg-background text-primary p-12 relative flex flex-col justify-between shadow-2xl border border-primary/10 reveal-node" style={{ transitionDelay: '300ms' }}>
              <div className="w-32 h-32 bg-surface mb-8 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 will-change-[filter]">
                <img alt="Project Lead" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO9_MyzujG8laCMgDeb9yFaMMA1leYP-6HIlWeH6rTV2YjB8gaaRG4LmAknICdUbFguNJCpgUxOUOoZiyCknD0AjTGkDF6V-hfA1F8iglFQPgdVQSex9CiEkETHC2cOKaDA5NFFpaYsQLkpbBqAZCYQovO9tP1LJFq_VQeI6nj4XWCpqFHr-dWD-jzMJUaFECI1hh3B6Axk5BHEKlM0AJS5oqVMJfb0QgDSttSRSoHpHx7APRmfP8W0jY6K5sWt4LdTqefk7-xwas" />
              </div>
              <div>
                <h4 className="text-4xl font-headline font-bold mb-4 text-primary">Siddharth R.</h4>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 text-secondary">School of Engineering</p>
                <p className="text-[11px] text-text-primary/70 leading-loose mb-12 italic">Class of 2025 • Dayananda Sagar University</p>
                <div className="flex gap-8">
                  <a className="text-[9px] font-bold tracking-widest uppercase hover:text-secondary transition-colors text-primary" href="https://github.com/SafwanShaikh10">GITHUB</a>
                  <a className="text-[9px] font-bold tracking-widest uppercase hover:text-secondary transition-colors text-primary" href="https://www.linkedin.com/in/safwan-shaikh-dsu/">LINKEDIN</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background border-t divider-slate py-24 px-10 reveal-node">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <p className="text-4xl font-headline font-bold tracking-tighter text-primary">AttendEase</p>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-secondary">Student Information &amp; Requests</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary">System</p>
                <ul className="text-[10px] space-y-4 uppercase tracking-[0.2em] font-bold text-primary">
                  <li><a className="hover:italic transition-all" href="#">Process</a></li>
                  <li><a className="hover:italic transition-all" href="#">Roles</a></li>
                  <li><a className="hover:italic transition-all" href="#">Tech Stack</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary">Institutional</p>
                <ul className="text-[10px] space-y-4 uppercase tracking-[0.2em] font-bold text-primary">
                  <li><a className="hover:italic transition-all" href="#">Guidelines</a></li>
                  <li><a className="hover:italic transition-all" href="#">Governance</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t divider-slate flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.3em] font-bold text-secondary/60">
            <p>© 2025 Dayananda Sagar University</p>
            <p>Designed for Academic Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
