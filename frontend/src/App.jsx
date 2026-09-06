import { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Landing from './pages/Landing';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { AuthProvider } from './auth';
import { useAuth } from './auth-context';
import { initialsFor } from './utils';

function navLinkClass(active) {
  return `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    active
      ? 'bg-indigo-50 text-indigo-700 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  }`;
}

function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Close on outside click / Escape so the menu never gets stuck open
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative ml-2" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-black">
          {initialsFor(user)}
        </span>
        <span className="hidden sm:block max-w-[9rem] truncate text-sm font-medium text-slate-700">
          {user?.full_name || user?.email}
        </span>
        <span className="text-slate-400 text-[10px]">▼</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-scale-in origin-top-right"
        >
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.full_name || 'Candidate Account'}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            View Profile
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            role="menuitem"
            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
            AI
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            JobMatcher<span className="text-indigo-600">.io</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/jobs" className={navLinkClass(isActive('/jobs'))}>
            Browse Jobs
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={navLinkClass(isActive('/dashboard'))}>
              Dashboard
            </Link>
          )}

          {loading ? (
            <div className="ml-3 h-9 w-24 rounded-lg bg-slate-100 animate-pulse" />
          ) : isAuthenticated ? (
            <ProfileMenu user={user} />
          ) : (
            <>
              <Link
                to="/login"
                className="ml-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                state={{ mode: 'register' }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm">
              AI
            </div>
            <span className="font-bold text-slate-900">
              JobMatcher<span className="text-indigo-600">.io</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            AI-powered resume parsing and job matching for candidates who want a real answer,
            not a guess.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/jobs" className="text-slate-600 hover:text-indigo-600 transition-colors">Browse Jobs</Link></li>
            <li><Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</Link></li>
            <li><Link to="/#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors">How it Works</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/#about" className="text-slate-600 hover:text-indigo-600 transition-colors">About</Link></li>
            <li><Link to="/#contact" className="text-slate-600 hover:text-indigo-600 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="text-slate-600 hover:text-indigo-600 transition-colors">Sign In</Link></li>
            <li><Link to="/login" state={{ mode: 'register' }} className="text-slate-600 hover:text-indigo-600 transition-colors">Create Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} JobMatcher.io. All rights reserved.
      </div>
    </footer>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-slate-400 text-sm py-12 text-center">Loading…</div>;
  }
  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function Shell() {
  const location = useLocation();
  const isFullBleed = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navigation />
      <main className={`flex-1 w-full ${isFullBleed ? '' : 'max-w-7xl mx-auto p-6 md:p-8'}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
