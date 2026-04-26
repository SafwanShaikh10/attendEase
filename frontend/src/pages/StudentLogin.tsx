import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pattern = /^eng.*@dsu\.edu\.in$/i;
    if (!pattern.test(email)) {
      setError('Please use a valid engineering email (eng... @dsu.edu.in)');
      return;
    }
    setError('');
    // Proceed with login logic
  };

  return (
    <div className="min-h-screen bg-background text-primary font-body flex flex-col">
      {/* Header */}
      <nav className="p-10 flex justify-between items-start z-50">
        <Link to="/" className="text-3xl font-headline italic font-bold tracking-tighter text-primary hover:opacity-70 transition-opacity">
          AttendEase
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-secondary border-l-[3px] border-primary pl-6 py-1">
          Student Portal
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left: Branding/Typography */}
          <div className="w-full lg:w-1/2 reveal-item" style={{ animationDelay: '200ms' }}>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8">
              Identity<br/><span className="italic text-accent/80 text-[0.8em]">Verification.</span>
            </h1>
            <p className="text-lg md:text-xl font-light italic text-text-secondary max-w-md leading-relaxed">
              Access your personalized leave management dashboard. Secure authentication required.
            </p>
          </div>

          {/* Right: Login Form */}
          <div className="w-full lg:w-[450px] flex-shrink-0 reveal-item" style={{ animationDelay: '400ms' }}>
            <div className="bg-surface academic-border p-8 md:p-10 shadow-xl relative">
              <div className="absolute -top-3 -right-3 bg-primary text-background text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1.5">
                Auth v.2.0
              </div>
              
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary group-focus-within:text-primary transition-colors">
                    University Email / USN
                  </label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. eng21cs001@dsu.edu.in"
                    className={`w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-primary/10'} focus:border-primary py-3 text-base outline-none transition-all placeholder:text-primary/10 font-medium`}
                  />
                  {error && (
                    <p className="text-[8px] font-bold text-red-500 uppercase tracking-tighter mt-1">{error}</p>
                  )}
                </div>

                <div className="space-y-1.5 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary group-focus-within:text-primary transition-colors">
                    Security Credential
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-primary/10 focus:border-primary py-3 text-base outline-none transition-all placeholder:text-primary/10"
                  />
                </div>

                <div className="pt-6 flex flex-col gap-4">
                  <button className="w-full bg-primary text-background py-4 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                    Authorize Access
                  </button>

                  <div className="flex items-center gap-4 py-2">
                    <div className="h-[1px] flex-1 bg-primary/10"></div>
                    <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">Or Continue With</span>
                    <div className="h-[1px] flex-1 bg-primary/10"></div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={credentialResponse => {
                        console.log(credentialResponse);
                      }}
                      onError={() => {
                        console.log('Login Failed');
                      }}
                      theme="outline"
                      shape="square"
                      width="100%"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center px-1 pt-2">
                    <Link to="/forgot-password" className="text-[8px] font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                      Forgot?
                    </Link>
                    <Link to="/" className="text-[8px] font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                      Back to Gateway
                    </Link>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Bottom Note */}
            <div className="mt-8 flex items-center gap-4 opacity-20">
              <div className="h-[1px] flex-1 bg-primary"></div>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] whitespace-nowrap">Secure Session</span>
              <div className="h-[1px] flex-1 bg-primary"></div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-10 text-[9px] font-bold uppercase tracking-[0.3em] text-text-secondary/50 flex justify-between">
        <div>© 2026 AttendEase Intelligence</div>
        <div className="italic">Dayananda Sagar University Proprietary</div>
      </footer>
    </div>
  );
};

export default StudentLogin;
