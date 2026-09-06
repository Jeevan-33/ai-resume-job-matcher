import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import JobDetailModal from '../components/JobDetailModal';
import { alertError, badge, cardHover, input } from '../ui';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [openJobId, setOpenJobId] = useState(null);

  useEffect(() => {
    api
      .get('/jobs/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {
        /* Filter chips are a nice-to-have; the search box still works without them. */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const params = { limit: 200 };
    if (search.trim()) params.search = search.trim();
    if (activeCategory) params.category = activeCategory;

    const timeout = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setErrorMsg('');
      api
        .get('/jobs/', { params })
        .then((res) => {
          if (!cancelled) setJobs(res.data);
        })
        .catch((error) => {
          if (!cancelled) setErrorMsg(getErrorMessage(error, 'Could not load job listings.'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250); // debounce so every keystroke doesn't fire a request

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Positions</h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading...' : `${jobs.length} open role${jobs.length === 1 ? '' : 's'} across engineering, data, sales, and more.`}
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, skill, or keyword..."
          className={`sm:w-72 ${input}`}
        />
      </div>

      {/* Career branch filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
              activeCategory === null
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-white border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'
            }`}
          >
            All Branches
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <div role="alert" className={alertError}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm py-8">Loading opportunities...</div>
      ) : jobs.length === 0 ? (
        <div className="text-slate-400 text-sm py-12 text-center">
          No roles match your filters. Try a different keyword or branch.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const skills = job.skills || [];
            const visibleSkills = skills.slice(0, 6);
            const extraCount = skills.length - visibleSkills.length;

            return (
              <button
                key={job.id}
                onClick={() => setOpenJobId(job.id)}
                className={`text-left p-6 flex flex-col justify-between ${cardHover}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    <span className={`${badge.indigo} whitespace-nowrap`}>
                      {job.employment_type || 'Full-time'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-3">{job.company}</p>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {visibleSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {visibleSkills.map((skill) => (
                        <span key={skill} className={badge.neutral}>
                          {skill}
                        </span>
                      ))}
                      {extraCount > 0 && (
                        <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5">
                          +{extraCount} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span>📍 {job.location || 'Remote'}</span>
                  <span className="font-semibold text-slate-700">{job.salary_range || 'Competitive'}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {openJobId && <JobDetailModal jobId={openJobId} onClose={() => setOpenJobId(null)} />}
    </div>
  );
}
