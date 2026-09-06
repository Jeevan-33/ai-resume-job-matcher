import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { getErrorMessage } from '../api';
import { useAuth } from '../auth-context';
import { btn, input, alertError } from '../ui';

function CheckItem({ children }) {
  return (
    <li className="flex items-center gap-3 text-sm text-indigo-50">
      <span className="h-5 w-5 shrink-0 rounded-full bg-white/15 flex items-center justify-center text-white text-[11px]">
        ✓
      </span>
      {children}
    </li>
  );
}

export default function Login() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.mode === 'register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, loading, signIn, register } = useAuth();
  const navigate = useNavigate();

  // Where to land after signing in: back where they came from, else the profile
  const redirectTo = location.state?.from || '/profile';

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const switchMode = () => {
    setIsRegister((prev) => !prev);
    setErrorMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister) {
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('The two passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ email, password, fullName });
      } else {
        await signIn(email, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMsg(
        getErrorMessage(
          error,
          isRegister
            ? 'Could not create your account. Please try again.'
            : 'Incorrect email or password.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between bg-gradient-to-br from-indigo-600 to-blue-700 p-12 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float-slow" aria-hidden="true" />
        <div className="absolute bottom-0 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" aria-hidden="true" />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-black">
            AI
          </div>
          <span className="font-bold text-lg text-white tracking-tight">JobMatcher.io</span>
        </Link>

        <div className="relative animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-white leading-tight max-w-sm">
            Your next role, scored honestly against your real skills.
          </h2>
          <ul className="mt-8 space-y-3">
            <CheckItem>Instant resume parsing from a PDF</CheckItem>
            <CheckItem>AI fit scoring across every open role</CheckItem>
            <CheckItem>A concrete plan to close any skill gap</CheckItem>
          </ul>
        </div>

        <p className="relative text-xs text-indigo-100">
          © {new Date().getFullYear()} JobMatcher.io. Free for candidates, always.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-sm animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {isRegister
              ? 'Sign up to upload resumes and match jobs.'
              : 'Sign in to access your dashboard.'}
          </p>

          {errorMsg && (
            <div role="alert" className={`${alertError} mb-6`}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 mb-1.5">
                  Full Name <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={input}
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
                placeholder="••••••••"
                minLength={isRegister ? 8 : undefined}
                required
              />
              {isRegister && (
                <p className="text-xs text-slate-400 mt-1.5">At least 8 characters.</p>
              )}
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={input}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button type="submit" disabled={submitting} className={`${btn.primary} w-full mt-2`}>
              {submitting
                ? isRegister
                  ? 'Creating account…'
                  : 'Signing in…'
                : isRegister
                  ? 'Sign Up'
                  : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-indigo-600 hover:text-indigo-700 font-semibold ml-1 transition-colors"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
