import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20">
            AI
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            JobMatcher<span className="text-indigo-400">.io</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/') 
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Browse Jobs
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard') 
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            className="ml-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}