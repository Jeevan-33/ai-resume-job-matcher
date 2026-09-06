import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';
import Modal from './Modal';
import LearningPlan from './LearningPlan';
import { alertError, badge, btn } from '../ui';

function formatUsd(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function JobDetailModal({ jobId, onClose }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    // Deferred a tick so the reset itself isn't a synchronous setState call
    // in the effect body (that pattern cascades renders) - imperceptible to
    // the user but keeps the fetch-on-open behavior instant.
    const timer = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setErrorMsg('');
      setJob(null);
      setPlan(null);
      setPlanError('');

      api
        .get(`/jobs/${jobId}`)
        .then((res) => {
          if (!cancelled) setJob(res.data);
        })
        .catch((error) => {
          if (!cancelled) setErrorMsg(getErrorMessage(error, 'Could not load this job.'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    setPlanError('');
    try {
      const res = await api.get(`/plans/job/${jobId}`);
      setPlan(res.data);
    } catch (error) {
      setPlanError(getErrorMessage(error, 'Could not generate a plan for this role.'));
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <Modal open={!!jobId} onClose={onClose} widthClass="max-w-2xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            {job && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{job.company}</p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {loading && <div className="text-slate-400 text-sm py-8 text-center">Loading role details…</div>}

        {errorMsg && (
          <div role="alert" className={alertError}>
            {errorMsg}
          </div>
        )}

        {job && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs">
              {job.employment_type && <span className={badge.indigo}>{job.employment_type}</span>}
              {job.experience_level && <span className={badge.neutral}>{job.experience_level}</span>}
              {job.location && <span className={badge.neutral}>📍 {job.location}</span>}
            </div>

            {/* Salary section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  This Posting
                </p>
                <p className="text-lg font-black text-slate-900">{job.salary_range || 'Not disclosed'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Market Average - {job.market_salary.occupation}
                </p>
                <p className="text-lg font-black text-emerald-600">
                  {formatUsd(job.market_salary.median_annual)}
                  <span className="text-xs font-medium text-slate-400"> / yr median</span>
                </p>
                <a
                  href={job.market_salary.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-indigo-600 hover:underline transition-colors"
                >
                  Source: {job.market_salary.source}, {job.market_salary.period}
                </a>
              </div>
            </div>

            {/* Required skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                  Required Skills ({job.skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span key={skill} className={badge.neutral}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full description */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Full Description
              </p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Plan generation */}
            <div className="border-t border-slate-200 pt-5">
              {!plan && (
                <button
                  onClick={handleGeneratePlan}
                  disabled={planLoading}
                  className={`${btn.primary} w-full`}
                >
                  {planLoading ? 'Building your plan…' : 'Generate Learning Plan for This Role'}
                </button>
              )}

              {planError && (
                <div role="alert" className={`${alertError} mt-3`}>
                  {planError}
                </div>
              )}

              {plan && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    How to Prepare for {job.title}
                  </h3>
                  <LearningPlan plan={plan} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
