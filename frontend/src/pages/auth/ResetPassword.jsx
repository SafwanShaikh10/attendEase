import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-headline text-2xl font-black text-primary mb-2">Invalid Link</h2>
          <p className="text-secondary text-sm mb-6">This password reset link is invalid or missing. Please request a new one.</p>
          <Link to="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
            New<br />Password<br /><em className="text-background/40">.</em>
          </h1>
          <p className="text-background/50 text-sm font-light leading-relaxed max-w-xs">
            Choose a strong password that you haven't used before. Minimum 8 characters.
          </p>
        </div>
        <p className="text-[9px] text-background/20 uppercase tracking-[0.3em]">
          © 2025 AttendEase · DSU
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {success ? (
            /* ── Success State ── */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-headline text-3xl font-black text-primary tracking-tight mb-3">Password Reset</h2>
              <p className="text-secondary text-sm leading-relaxed mb-8">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-10">
                <h2 className="font-headline text-4xl font-black text-primary tracking-tight mb-2">Choose New Password</h2>
                <p className="text-secondary text-sm font-light">Your new password must be at least 8 characters.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-4 py-3 bg-surface border border-primary/15 text-primary placeholder-secondary/50 text-sm font-medium focus:outline-none focus:border-primary focus:bg-background transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-[10px] text-red-500 font-bold">{8 - password.length} more characters needed</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-surface border border-primary/15 text-primary placeholder-secondary/50 text-sm font-medium focus:outline-none focus:border-primary focus:bg-background transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || password.length < 8 || password !== confirmPassword}
                    className="group w-full bg-primary text-background py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all flex items-center justify-between px-6 disabled:opacity-50"
                  >
                    <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
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

export default ResetPassword;
