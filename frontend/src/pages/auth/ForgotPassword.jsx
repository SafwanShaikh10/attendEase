import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
            Forgot<br />Password<br /><em className="text-background/40">?</em>
          </h1>
          <p className="text-background/50 text-sm font-light leading-relaxed max-w-xs">
            No worries. Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>
        <p className="text-[9px] text-background/20 uppercase tracking-[0.3em]">
          © 2025 AttendEase · DSU
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <div className="lg:hidden mb-8">
            <Link to="/login" className="text-secondary text-[10px] font-bold uppercase tracking-[0.3em] hover:text-primary transition-colors">
              ← Back to login
            </Link>
          </div>

          {sent ? (
            /* ── Success State ── */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-headline text-3xl font-black text-primary tracking-tight mb-3">Check Your Email</h2>
              <p className="text-secondary text-sm leading-relaxed mb-8">
                If an account exists for <strong className="text-primary">{email}</strong>, we've sent a password reset link. It expires in 15 minutes.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary border border-primary/10 hover:border-primary/30 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-10">
                <Link to="/login" className="hidden lg:flex items-center gap-2 text-secondary text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors mb-6">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
                <h2 className="font-headline text-4xl font-black text-primary tracking-tight mb-2">Reset Password</h2>
                <p className="text-secondary text-sm font-light">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-surface border border-primary/15 text-primary placeholder-secondary/50 text-sm font-medium focus:outline-none focus:border-primary focus:bg-background transition-all"
                      placeholder="you@dsu.edu.in"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="group w-full bg-primary text-background py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all flex items-center justify-between px-6 disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                    <span className="w-8 h-[1.5px] bg-background/40 group-hover:w-12 transition-all"></span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
