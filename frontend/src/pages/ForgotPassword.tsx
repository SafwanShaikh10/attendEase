import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict validation for eng********@dsu.edu.in
    const pattern = /^eng[a-zA-Z0-9]*@dsu\.edu\.in$/i;
    if (!pattern.test(email)) {
      setError('Invalid format. Use eng... @dsu.edu.in');
      return;
    }

    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Transmission failed. Try again.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary font-body flex flex-col">
      {/* Header */}
      <nav className="p-10 flex justify-between items-start z-50">
        <Link to="/" className="text-3xl font-brand italic font-bold tracking-tighter text-primary hover:opacity-70 transition-opacity">
          AttendEase
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-secondary border-l-[3px] border-primary pl-6 py-1">
          Recovery Portal
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left: Branding/Typography */}
          <div className="w-full lg:w-1/2 reveal-item" style={{ animationDelay: '200ms' }}>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8">
              Access<br/><span className="italic text-accent/80 text-[0.8em]">Recovery.</span>
            </h1>
            <p className="text-lg md:text-xl font-light italic text-text-secondary max-w-md leading-relaxed">
              Enter your registered university email to receive a secure password reset link.
            </p>
          </div>

          {/* Right: Recovery Form */}
          <div className="w-full lg:w-[450px] flex-shrink-0 reveal-item" style={{ animationDelay: '400ms' }}>
            <div className="bg-surface academic-border p-8 md:p-10 shadow-xl relative">
              <div className="absolute -top-3 -right-3 bg-primary text-background text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1.5">
                SECURE v.2.0
              </div>
              
                {!isSubmitted ? (
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary group-focus-within:text-primary transition-colors">
                        University Email
                      </label>
                      <input 
                        type="email" 
                        required
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

                  <div className="pt-6 flex flex-col gap-4">
                    <button type="submit" className="w-full bg-primary text-background py-4 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                      Send Reset Link
                    </button>
                    
                    <div className="flex justify-center items-center px-1 pt-2">
                      <Link to="/student/login" className="text-[8px] font-bold uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center space-y-6">
                  <div className="material-symbols-outlined text-6xl text-accent/40">mark_email_read</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold italic">Link Transmitted</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      If an account exists for <span className="text-primary font-bold">{email}</span>, a reset link will arrive shortly.
                    </p>
                  </div>
                  <Link to="/student/login" className="inline-block mt-8 text-[9px] font-black uppercase tracking-[0.3em] border-b border-primary pb-1 hover:border-accent hover:text-accent transition-all">
                    Return to Entry
                  </Link>
                </div>
              )}
            </div>
            
            {/* Bottom Note */}
            <div className="mt-8 flex items-center gap-4 opacity-20">
              <div className="h-[1px] flex-1 bg-primary"></div>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] whitespace-nowrap">Recovery Protocol Active</span>
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

export default ForgotPassword;
