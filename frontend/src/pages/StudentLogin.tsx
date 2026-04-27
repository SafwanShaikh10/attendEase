import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pattern = /^eng[a-zA-Z0-9]*@dsu\.edu\.in$/i;
    if (!pattern.test(email)) {
      setError('Please use a valid engineering email (eng... @dsu.edu.in)');
      return;
    }
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
        navigate('/student/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="bg-background text-primary min-h-screen flex items-center justify-center p-gutter font-body-md">
      <div className="w-full max-w-md reveal-item">
        {/* Header Section */}
        <div className="text-center mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface-variant mb-xs tracking-widest uppercase opacity-60">Dayananda Sagar University</h2>
          <h1 className="text-4xl md:text-5xl font-brand font-black tracking-tighter text-primary leading-none">AttendEase</h1>
        </div>

        {/* Login Container */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-[0_30px_60px_-15px_rgba(0,6,28,0.05)] overflow-hidden">
          {/* Form Content */}
          <div className="p-lg">
            <div className="mb-lg border-b border-outline-variant/30 pb-4">
              <h3 className="font-label-lg text-label-lg text-primary uppercase tracking-[0.2em]">Sign In</h3>
            </div>

            <form className="space-y-md" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="email">Institutional Email</label>
                <input
                  className={`w-full bg-surface-container-lowest border ${error && email ? 'border-error' : 'border-outline-variant'} text-on-surface font-body-md text-body-md rounded px-sm py-[12px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline`}
                  id="email"
                  placeholder="student@dsu.edu.in"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                  <Link className="font-label-md text-label-md text-primary hover:text-primary-container" to="/forgot-password">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded px-sm py-[12px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Area */}
              {error && (
                <div className="bg-error-container text-on-error-container p-sm rounded border border-error/20 flex items-start gap-xs">
                  <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>error</span>
                  <p className="font-caption text-caption text-error">{error}</p>
                </div>
              )}

              <button className="w-full bg-primary text-on-primary font-label-lg text-label-lg rounded py-[14px] hover:bg-primary-container transition-colors shadow-sm mt-lg" type="submit">
                Sign In
              </button>

              <div className="mt-lg relative flex items-center justify-center">
                <div className="absolute w-full border-t border-outline-variant/30"></div>
                <span className="bg-surface-container-lowest px-sm font-caption text-caption text-on-surface-variant relative">OR</span>
              </div>

              <div className="flex justify-center mt-lg w-full">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      console.log(credentialResponse);
                      navigate('/student/dashboard');
                    }}
                    onError={() => {
                      setError('Google Login Failed');
                    }}
                    theme="outline"
                    shape="rectangular"
                    width="384"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-lg text-center flex justify-center items-center gap-md">
          <Link className="font-caption text-caption text-on-surface-variant hover:text-primary" to="/privacy">Privacy Policy</Link>
          <span className="text-outline-variant">•</span>
          <Link className="font-caption text-caption text-on-surface-variant hover:text-primary" to="/help">Help Center</Link>
          <span className="text-outline-variant">•</span>
          <Link className="font-caption text-caption text-on-surface-variant hover:text-primary" to="/">Gateway</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
