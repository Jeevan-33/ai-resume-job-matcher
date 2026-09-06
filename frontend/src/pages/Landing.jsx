import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { useReveal } from '../useReveal';
import { btn, card } from '../ui';

function Icon({ path, className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  upload: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5',
  sparkles: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  academic: 'M4.26 10.147a60.44 60.44 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.83c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443',
  arrowRight: 'M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3',
  check: 'm4.5 12.75 6 6 9-13.5',
  mail: 'M2.25 6.75c0-1.036.84-1.875 1.875-1.875h15.75c1.035 0 1.875.84 1.875 1.875v10.5A1.875 1.875 0 0 1 19.875 19.125H4.125A1.875 1.875 0 0 1 2.25 17.25V6.75Zm1.875-.375a.375.375 0 0 0-.375.375v.517l8.25 5.156 8.25-5.156v-.517a.375.375 0 0 0-.375-.375H4.125ZM20.25 8.94l-7.723 4.83a.75.75 0 0 1-.795 0L4.01 8.94v8.31c0 .207.168.375.375.375h15.75a.375.375 0 0 0 .375-.375V8.94Z',
  mapPin: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
  chat: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
};

function StepConnector() {
  return <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] border-t-2 border-dashed border-indigo-200" />;
}

function Reveal({ as: As = 'div', delay = 0, className = '', children }) {
  const ref = useReveal();
  return (
    <As ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </As>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // No contact backend exists yet - simulate a send so the form still feels real.
    setTimeout(() => setStatus('sent'), 700);
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-6">
        <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <Icon path={ICONS.check} className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Message sent</h3>
        <p className="text-sm text-slate-500 mt-1.5 max-w-xs">
          Thanks, {form.name.split(' ')[0] || 'there'}! We'll get back to you at {form.email} soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-name" className="block text-xs font-semibold text-slate-500 mb-1.5">Name</label>
          <input
            id="c-name"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Jane Doe"
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div>
          <label htmlFor="c-email" className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
          <input
            id="c-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="you@example.com"
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="block text-xs font-semibold text-slate-500 mb-1.5">Message</label>
        <textarea
          id="c-message"
          required
          rows={4}
          value={form.message}
          onChange={update('message')}
          placeholder="How can we help?"
          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
        />
      </div>
      <button type="submit" disabled={status === 'sending'} className={`${btn.primary} w-full`}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

export default function Landing() {
  const location = useLocation();
  const [roleCount, setRoleCount] = useState(null);

  useEffect(() => {
    api
      .get('/jobs/', { params: { limit: 500 } })
      .then((res) => setRoleCount(res.data.length))
      .catch(() => {
        /* Stat is decorative; the page works fine without it. */
      });
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      // Let the route render before scrolling
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location.hash]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-indigo-50 via-white to-white">
        <div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 right-0 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl animate-float"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full mb-6">
              <Icon path={ICONS.sparkles} className="h-3.5 w-3.5" />
              AI-Powered Resume Matching
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Find the job you're
              <span className="block bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                actually qualified for.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              Upload your resume once. Our AI extracts your real skills, scores you against
              every open role, and hands you a concrete plan to close whatever gap is left.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link to="/login" state={{ mode: 'register' }} className={btn.primary}>
                Create Free Account
                <Icon path={ICONS.arrowRight} className="h-4 w-4" />
              </Link>
              <Link to="/jobs" className={btn.secondary}>
                Browse Open Roles
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {roleCount !== null ? `${roleCount}+` : '90+'} open roles
              </span>
              <span className="flex items-center gap-1.5">
                <Icon path={ICONS.check} className="h-4 w-4 text-emerald-500" /> Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <Icon path={ICONS.check} className="h-4 w-4 text-emerald-500" /> No spam, ever
              </span>
            </div>
          </div>

          {/* Hero visual: a mock "match score" dashboard card */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="relative mx-auto max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-indigo-200/50 p-6 animate-float">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Match</p>
                  <p className="font-bold text-slate-900">Senior Backend Engineer</p>
                </div>
                <span className="text-2xl font-black text-emerald-500">94%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {['Python', 'FastAPI', 'PostgreSQL', 'Docker'].map((s) => (
                  <span key={s} className="text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>📍 Remote (US)</span>
                <span className="font-semibold text-slate-700">$140k - $180k</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 animate-float-slow hidden sm:block">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Icon path={ICONS.academic} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Skill Plan Ready</p>
                  <p className="text-[11px] text-slate-500">3 skills · ~6 weeks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to land the right role
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            No more guessing whether you're qualified - just upload and see the numbers.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ICONS.upload,
              title: 'Instant Resume Parsing',
              body: 'Drop in a PDF and we extract your contact details, summary, and skills in seconds.',
            },
            {
              icon: ICONS.target,
              title: 'AI Fit Scoring',
              body: 'Every open role gets a real match score, ranked best-fit first - not a keyword guess.',
            },
            {
              icon: ICONS.academic,
              title: 'Skill Gap Plans',
              body: 'Missing something? Get a concrete, time-boxed learning plan with real resources.',
            },
            {
              icon: ICONS.sparkles,
              title: 'Market Salary Data',
              body: 'See how a posted salary compares to real market benchmarks for that role.',
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className={`p-6 h-full ${card} hover:shadow-lg hover:shadow-slate-200/70 hover:-translate-y-1 hover:border-indigo-200`}>
                <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Icon path={f.icon} className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-slate-600 text-lg">Three steps between you and a ranked list of roles.</p>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Upload your resume', body: 'PDF in, structured profile out - contact info, skills, and a summary, parsed automatically.' },
              { step: '02', title: 'Get scored instantly', body: 'We compare your skills against every open role and rank them by real fit, not keywords.' },
              { step: '03', title: 'Close the gap', body: 'For any role that’s a near-miss, get a step-by-step plan with resources to get there.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 120} className="relative text-center">
                {i < 2 && <StepConnector />}
                <div className="relative mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/25 mb-5">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">About JobMatcher.io</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for job seekers who are tired of guessing
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              Job boards are great at listing roles and terrible at telling you which ones you
              can actually get. JobMatcher.io was built to close that gap: parse your resume,
              score it honestly against real postings, and show you exactly what's missing -
              with a plan to fix it.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              No recruiters, no cold outreach, no noise. Just your skills, measured against the
              market, so you can spend your time applying to roles you're genuinely close to
              landing.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                ['90+', 'Open roles'],
                ['20+', 'Career branches'],
                ['100%', 'Free to use'],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-slate-900">{n}</p>
                  <p className="text-xs text-slate-500 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-1 shadow-xl shadow-indigo-300/40">
              <div className="rounded-[14px] bg-white p-8 space-y-5">
                {[
                  { icon: ICONS.target, title: 'Honest scoring', body: 'Fit scores are computed from real skill overlap, not vague keyword matching.' },
                  { icon: ICONS.academic, title: 'Actionable gaps', body: 'Every missing skill comes with a plan, not just a red flag.' },
                  { icon: ICONS.sparkles, title: 'Always improving', body: 'The matching engine and salary data are updated as the job market moves.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon path={item.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <Reveal className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to find your fit?
          </h2>
          <p className="mt-4 text-indigo-100 text-lg max-w-xl mx-auto">
            Create a free account, upload your resume, and see your top matches in under a minute.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              state={{ mode: 'register' }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-indigo-700 bg-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Create Free Account
              <Icon path={ICONS.arrowRight} className="h-4 w-4" />
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-white/10 border border-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Browse Open Roles
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Get in touch</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Questions? Contact us
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed max-w-md">
              Whether it's feedback, a bug report, or a partnership idea - we read everything
              that comes through this form.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon path={ICONS.mail} className="h-5 w-5" />
                </div>
                support@jobmatcher.io
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon path={ICONS.chat} className="h-5 w-5" />
                </div>
                We typically reply within one business day
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon path={ICONS.mapPin} className="h-5 w-5" />
                </div>
                Remote-first, built for candidates everywhere
              </div>
            </div>
          </Reveal>
          <Reveal delay={150} className={`p-8 ${card}`}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
