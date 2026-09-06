// Shared Tailwind class strings so every page's buttons, cards, and inputs
// stay pixel-consistent instead of drifting as pages are edited independently.

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm',
  secondary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-300 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
  ghost:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900',
  success:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm',
  danger:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 shadow-sm shadow-rose-600/20 transition-all duration-200 hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed',
};

export const card =
  'bg-white border border-slate-200 rounded-2xl shadow-sm shadow-slate-200/60 transition-shadow duration-200';

export const cardHover =
  'bg-white border border-slate-200 rounded-2xl shadow-sm shadow-slate-200/60 transition-all duration-200 hover:shadow-lg hover:shadow-slate-300/50 hover:border-indigo-200 hover:-translate-y-1';

export const input =
  'w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all';

export const badge = {
  neutral: 'text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full',
  indigo: 'text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full',
  emerald: 'text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full',
  amber: 'text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full',
  sky: 'text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-700 px-2.5 py-1 rounded-full',
  rose: 'text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full',
};

export const alertError =
  'bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm';

export const alertSuccess =
  'bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm';

export const sectionLabel = 'text-[11px] uppercase font-bold tracking-wider text-slate-400';
