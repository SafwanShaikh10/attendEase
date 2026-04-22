import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/auth';
import { useState, useEffect } from 'react';

const redirectMap = {
  STUDENT:      '/student/dashboard',
  CLASS_COORD:  '/classcoord/pending',
  YEAR_COORD:   '/yearcoord/pending',
  CHAIRPERSON:  '/chairperson/pending',
  ADMIN:        '/admin/dashboard'
};

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urlParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const urlError = urlParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [urlParams]);

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginUser(data.email, data.password);
      const { token, user: userData } = result.data || result;
      login(userData, token);
      const destination = redirectMap[userData.role] || '/';
      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Branding Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-16">
        <div>
          <Link to="/" className="text-background/40 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-background/60 transition-colors">
            ← Back to home
          </Link>
        </div>
        <div>

          <h1 className="font-headline text-[clamp(3rem,6vw,5rem)] font-black text-background leading-[0.95] tracking-tighter mb-8">
            Leave<br />Requests.<br /><em className="text-background/40">Handled.</em>
          </h1>
          <p className="text-background/50 text-sm font-light leading-relaxed max-w-xs">
            A structured, role-based system for OD, Medical, and Special OD applications — from submission to approval.
          </p>
        </div>
        <p className="text-[9px] text-background/20 uppercase tracking-[0.3em]">
          © 2025 AttendEase · DSU
        </p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="text-secondary text-[10px] font-bold uppercase tracking-[0.3em] hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </div>

          <div className="mb-12">
            <h2 className="font-headline text-4xl font-black text-primary tracking-tight">Sign in</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                Email Address
              </label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="w-full px-4 py-3 bg-surface border border-primary/15 text-primary placeholder-secondary/50 text-sm font-medium focus:outline-none focus:border-primary focus:bg-background transition-all"
                placeholder="you@dsu.edu.in"
              />
              {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="w-full px-4 py-3 bg-surface border border-primary/15 text-primary placeholder-secondary/50 text-sm font-medium focus:outline-none focus:border-primary focus:bg-background transition-all"
                placeholder="••••••••"
              />
              {errors.password && <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-primary text-background py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all flex items-center justify-between px-6 disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign in to Portal'}</span>
                <span className="w-8 h-[1.5px] bg-background/40 group-hover:w-12 transition-all"></span>
              </button>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-[10px] font-bold text-secondary hover:text-primary uppercase tracking-[0.15em] transition-colors">
                Forgot password?
              </Link>
            </div>

            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-[1px] bg-primary/10"></div>
              <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.25em]">OR</span>
              <div className="flex-1 h-[1px] bg-primary/10"></div>
            </div>

            <a
              href="/api/auth/google"
              className="w-full border border-primary/15 bg-surface text-primary py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-background transition-all group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
