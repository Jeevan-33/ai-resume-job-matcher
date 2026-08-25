import { useEffect, useState } from 'react';
import api from '../api';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error('Error fetching jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Available Positions</h1>
        <p className="text-sm text-slate-400 mt-1">Current open requisitions registered in the platform database.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm py-8">Loading opportunities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-white">{job.title}</h2>
                  <span className="text-xs bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-semibold px-2.5 py-1 rounded-full">
                    {job.employment_type || 'Full-time'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-400 mb-3">{job.company}</p>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {job.description}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-800/80">
                <span>📍 {job.location || 'Remote'}</span>
                <span className="font-semibold text-slate-300">{job.salary_range || 'Competitive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}