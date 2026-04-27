
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const RoleLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const getRoleInfo = () => {
    const path = location.pathname;
    if (path.includes('coordinator')) return { name: 'Class Coordinator', theme: 'accent' };
    if (path.includes('year-coordinator')) return { name: 'Year-wise Coordinator', theme: 'primary' };
    if (path.includes('chairperson')) return { name: 'Chairperson', theme: 'primary' };
    if (path.includes('admin')) return { name: 'Administrator', theme: 'accent' };
    return { name: 'Student', theme: 'primary' };
  };

  const role = getRoleInfo();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        // Verify role match
        if (data.data.user.role.toLowerCase() !== role.name.replace(/ /g, '_').toLowerCase() && role.name !== 'Student') {
          // Warning: In a real system, you'd enforce this on the backend
          console.warn('Role mismatch detected');
        }
        alert(`Login Successful as ${data.data.user.role}!`);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Left Panel - Aesthetic Branding */}
      <div className="hidden md:flex md:w-1/2 bg-surface p-12 flex-col justify-between relative overflow-hidden border-r divider-slate">
        <div className="reveal-item" style={{ animationDelay: '200ms' }}>
          <Link to="/" className="text-2xl font-headline italic font-bold tracking-tighter text-primary">AttendEase</Link>
          <div className="mt-32">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent mb-4">Role-Based Access</p>
            <h1 className="text-7xl font-bold tracking-tighter leading-none mb-8">
              {role.name.split(' ').map((word, i) => (
                <React.Fragment key={i}>{word}<br /></React.Fragment>
              ))}
              Portal.
            </h1>
          </div>
        </div>

        <div className="reveal-item" style={{ animationDelay: '400ms' }}>
          <p className="text-sm font-medium text-text-secondary max-w-xs leading-relaxed italic mb-8">
            Access authorized institutional governance tools and administrative dashboards.
          </p>
          <div className="w-16 h-[1px] bg-primary opacity-20"></div>
        </div>

        {/* Decorative Bleed Text */}
        <div className="absolute -bottom-10 -left-10 text-[15rem] font-bold text-primary opacity-[0.02] select-none pointer-events-none italic">
          {role.name.split(' ')[0].toUpperCase()}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md reveal-item" style={{ animationDelay: '300ms' }}>
          <div className="mb-12 md:hidden">
            <Link to="/" className="text-2xl font-headline italic font-bold tracking-tighter text-primary">AttendEase</Link>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold tracking-tighter mb-4 italic">Sign In</h2>
            <p className="text-text-secondary text-sm font-medium tracking-wide">Enter your professional credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Professional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface academic-border p-4 outline-none focus:border-accent transition-colors font-medium text-primary"
                placeholder="name@dsu.edu.in"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Secure Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold uppercase tracking-[0.1em] text-accent hover:underline">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface academic-border p-4 outline-none focus:border-accent transition-colors font-medium text-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs font-bold uppercase tracking-wider leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full bg-primary text-background py-5 font-bold uppercase tracking-[0.3em] text-[10px] transition-all hover:bg-accent relative overflow-hidden group shadow-lg"
            >
              <span className={`relative z-10 transition-transform duration-300 block ${isHovered ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                Verify Identity
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                Proceed to System
              </span>
            </button>
          </form>

          <div className="mt-16 pt-8 border-t divider-slate flex flex-col gap-6">
             <Link to="/student/login" className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-accent transition-colors flex items-center gap-3">
              <span className="w-4 h-[1px] bg-current"></span>
              Switch to Student Portal
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <div className="absolute bottom-8 right-8 text-[9px] font-black uppercase tracking-[0.2em] opacity-20 hover:opacity-100 transition-opacity cursor-help">
          System Support
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;
