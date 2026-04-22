import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterSystem = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* ── Hero Section ── */}
      <section className="min-h-screen relative flex items-center pb-48 px-10 pt-24">
        <div className="w-full max-w-[1600px] mx-auto swiss-grid">
          <div className="col-span-12 lg:col-span-11">
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] mb-16 border-l-[3px] border-primary pl-6">
              Dayananda Sagar University
            </p>
            <h1 className="text-[clamp(4.5rem,14vw,14rem)] font-black overlap-text z-10 relative text-primary mt-12">
              Leave<br />Requests.
            </h1>
            <div className="mt-12 swiss-grid">
              <div className="col-start-1 lg:col-start-6 col-span-12 lg:col-span-6">
                <h2 className="text-6xl md:text-8xl font-black mb-12 italic text-accent opacity-80">Handled.</h2>
                <p className="text-xl md:text-2xl text-text-secondary max-w-xl leading-relaxed font-light mb-16 italic">
                  A structured, role-based system for managing OD, Medical, and Special OD requests — from submission to approval.
                </p>
                <div className="flex flex-wrap gap-12 border-t divider-charcoal pt-12">
                  <button
                    onClick={handleEnterSystem}
                    className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] bg-transparent border-none cursor-pointer p-0"
                  >
                    <span className="w-12 h-[1.5px] bg-primary group-hover:w-20 transition-all"></span>
                    Enter the System
                  </button>
                  <a className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]" href="#journey">
                    <span className="w-12 h-[1.5px] bg-primary group-hover:w-20 transition-all"></span>
                    See How It Works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-48 px-10 bg-primary" id="journey">
        <div className="max-w-[1400px] mx-auto">
          <div className="swiss-grid items-start">
            <div className="col-span-12 lg:col-span-4 mb-24 lg:mb-0">
              <h2 className="text-7xl font-black leading-tight mb-12 text-background">How It<br />Works</h2>
              <p className="text-background/60 text-[11px] border-l-2 border-background/40 pl-6 max-w-[240px] uppercase tracking-widest leading-loose font-bold">
                Every request travels through a structured path.
              </p>
            </div>
            <div className="col-span-12 lg:col-start-6 lg:col-span-7">
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="dot dot-red"></div>
                  <div className="dot dot-yellow"></div>
                  <div className="dot dot-green"></div>
                  <span className="ml-4 text-[10px] uppercase tracking-widest text-background/40 font-mono">
                    workflow.sh — 80×24
                  </span>
                </div>
                <div className="p-8 md:p-12 text-sm md:text-base leading-relaxed text-background/90 font-mono">
                  <div className="mb-8">
                    <span className="text-terminal-green">attendEase@dsu:~$</span>{' '}
                    <span className="text-background">trace --request-flow</span>
                  </div>
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="text-background/40 whitespace-nowrap">STEP_01</div>
                      <div>
                        <div className="text-terminal-blue font-bold">/user/submit</div>
                        <div className="text-xs uppercase tracking-tighter opacity-60">Student</div>
                        <div className="mt-1 opacity-80 text-sm">{'POST { reason, letter, proof_attachment }'}</div>
                      </div>
                    </div>
                    <div className="pl-8 border-l border-background/10 py-2">
                      <span className="text-background/20">|</span>
                    </div>
                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="text-background/40 whitespace-nowrap">STEP_02</div>
                      <div>
                        <div className="text-terminal-blue font-bold">/coord/division/review</div>
                        <div className="text-xs uppercase tracking-tighter opacity-60">Class Coordinator</div>
                        <div className="mt-1 opacity-80 text-sm">Status: PENDING_VALIDATION</div>
                      </div>
                    </div>
                    <div className="pl-8 border-l border-background/10 py-2">
                      <span className="text-background/20">|</span>
                    </div>
                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="text-background/40 whitespace-nowrap">STEP_03</div>
                      <div>
                        <div className="text-terminal-blue font-bold">/coord/year/final_approval</div>
                        <div className="text-xs uppercase tracking-tighter opacity-60">Year Coordinator</div>
                        <div className="mt-1 opacity-80 text-sm">Permission: OD &amp; MEDICAL AUTHORIZED</div>
                      </div>
                    </div>
                    <div className="pl-8 border-l border-background/10 py-2">
                      <span className="text-background/20">|</span>
                    </div>
                    {/* Step 4 */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="text-background/40 whitespace-nowrap">STEP_04</div>
                      <div>
                        <div className="text-terminal-blue font-bold">/authority/chairperson/special_od</div>
                        <div className="text-xs uppercase tracking-tighter opacity-60">Chairperson</div>
                        <div className="mt-1 opacity-80 text-sm">{"Conditional: IF request_type == 'SPECIAL_OD'"}</div>
                      </div>
                    </div>
                    <div className="pl-8 border-l border-background/10 py-2">
                      <span className="text-background/20">|</span>
                    </div>
                    {/* Step 5 */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="text-background/40 whitespace-nowrap">STEP_05</div>
                      <div>
                        <div className="text-terminal-green font-bold">/system/db/commit</div>
                        <div className="text-xs uppercase tracking-tighter opacity-60">Approved</div>
                        <div className="mt-1 opacity-80 text-sm">RUN: sync_excel.py &amp; notify_student.sh</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex items-center gap-2">
                    <span className="text-terminal-green">attendEase@dsu:~$</span>
                    <span className="w-2 h-5 bg-background/80 animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Portals ── */}
      <section className="py-48 px-10" id="portals">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b divider-charcoal pb-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter">Portals</h2>
            <p className="text-right max-w-[260px] text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary pb-4 leading-relaxed">
              Each role has a dedicated experience designed for efficiency and clarity.
            </p>
          </div>
          <div className="divide-y divider-charcoal">
            {/* Student */}
            <div
              onClick={handleEnterSystem}
              className="grid grid-cols-12 py-16 group hover:bg-primary/5 cursor-pointer px-6 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:z-10 bg-background"
            >
              <div className="col-span-1 text-xl font-headline italic opacity-30">01</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-black">Student</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Submit &amp; Track</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Upload Proofs</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Balance Check</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </div>
            </div>
            {/* Class Coord */}
            <div
              onClick={handleEnterSystem}
              className="grid grid-cols-12 py-16 group hover:bg-primary/5 cursor-pointer px-6 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:z-10 bg-background"
            >
              <div className="col-span-1 text-xl font-headline italic opacity-30">02</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-black">Class Coord.</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Review &amp; Approve</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Export Excel</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">24h Reminders</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </div>
            </div>
            {/* Year Coord */}
            <div
              onClick={handleEnterSystem}
              className="grid grid-cols-12 py-16 group hover:bg-primary/5 cursor-pointer px-6 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:z-10 bg-background"
            >
              <div className="col-span-1 text-xl font-headline italic opacity-30">03</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-black">Year Coord.</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Final OD/Med Approver</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Review All Divisions</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Task Delegation</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </div>
            </div>
            {/* Chairperson */}
            <div
              onClick={handleEnterSystem}
              className="grid grid-cols-12 py-16 group hover:bg-primary/5 cursor-pointer px-6 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:z-10 bg-background"
            >
              <div className="col-span-1 text-xl font-headline italic opacity-30">04</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-black">Chairperson</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Special OD Authority</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Audit Trail Access</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Read-only Records</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </div>
            </div>
            {/* Admin */}
            <div
              onClick={handleEnterSystem}
              className="grid grid-cols-12 py-16 group hover:bg-primary/5 cursor-pointer px-6 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:z-10 bg-background"
            >
              <div className="col-span-1 text-xl font-headline italic opacity-30">05</div>
              <div className="col-span-4 text-3xl md:text-5xl font-headline font-black">Admin</div>
              <div className="col-span-5 hidden md:flex items-center gap-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">System Governance</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Analytics Dashboard</span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-60">Role Management</span>
              </div>
              <div className="col-span-7 md:col-span-2 flex justify-end items-center">
                <span className="material-symbols-outlined text-3xl opacity-20 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About / Tech ── */}
      <section className="py-48 px-10 bg-primary text-background overflow-hidden" id="about">
        <div className="max-w-[1400px] mx-auto swiss-grid">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="text-6xl md:text-[9rem] font-black leading-[0.9] mb-24 tracking-tighter">Beyond Manual.</h2>
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-10">
                <p className="text-2xl md:text-4xl font-light leading-relaxed mb-16 italic opacity-90">
                  AttendEase is a production-grade enterprise application designed to replace archaic paper-based and
                  manual email threads.
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-6 opacity-40 border-t border-background/20 pt-10">
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">React 18</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Node.js</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">MySQL</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Prisma</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Express</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Google Drive API</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">PDFKit</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Nodemailer</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-end mt-24 lg:mt-0">
            <div className="aspect-[4/5] bg-background text-primary p-12 relative flex flex-col justify-between shadow-2xl">
              <div className="w-32 h-32 bg-surface mb-8 overflow-hidden sepia-[0.3] grayscale hover:grayscale-0 transition-all duration-700">
                <img
                  alt="Lead Architect"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3apIXn4w3wbncKpYPCnoJdgttwNWBIJE5utk2PBwf0q4BlKFS6nPrx5m7p20mjYyUzs41ZPf8d_nXWZ2u2cDMHbIPI4-Zvqr0etsmBjYtHZ_ikkeTqlAgmZykENRj1xthjL9r70dE5Q7dOQrFoaderulzdVeg73uSzVgVvSdeqbvdyoSno00Qp3DrNjkyfQ0fc5P7hTe-baOjtzGK7D4glkPqG08-wEKxRNd7cSDI0wx5mH0jCVk3NJ84ZG1TqdK_gwUGLwQ3uxE"
                />
              </div>
              <div className="space-y-5">
                <h4 className="text-4xl font-headline font-black">Safwan M Shaikh</h4>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent">
                  Department of Artificial Intelligence And Machine Learning
                </p>
                <p className="text-[11px] text-text-secondary leading-loose italic">
                  Class of 2027 • Dayananda Sagar University
                </p>
                <div className="flex gap-8 pt-2">
                  <a className="text-[9px] font-black tracking-widest uppercase hover:text-accent transition-colors" href="https://github.com/SafwanShaikh10" target="_blank" rel="noopener noreferrer">
                    GITHUB
                  </a>
                  <a className="text-[9px] font-black tracking-widest uppercase hover:text-accent transition-colors" href="https://www.linkedin.com/in/safwan-shaikh-dsu/" target="_blank" rel="noopener noreferrer">
                    LINKEDIN
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-background border-t divider-charcoal py-24 px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <p className="text-4xl font-headline font-black tracking-tighter text-primary">AttendEase</p>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary">
                Student Information &amp; Requests
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent">System</p>
                <ul className="text-[10px] space-y-4 uppercase tracking-[0.2em] font-bold list-none p-0">
                  <li><a className="hover:italic transition-all" href="#journey">Process</a></li>
                  <li><a className="hover:italic transition-all" href="#portals">Roles</a></li>
                  <li><a className="hover:italic transition-all" href="#about">About</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent">Legal</p>
                <ul className="text-[10px] space-y-4 uppercase tracking-[0.2em] font-bold list-none p-0">
                  <li><a className="hover:italic transition-all" href="#">Privacy</a></li>
                  <li><a className="hover:italic transition-all" href="#">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t divider-charcoal flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.3em] font-bold text-text-secondary opacity-60">
            <p>© 2025 Dayananda Sagar University</p>
            <p>Built with care for DSU students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
