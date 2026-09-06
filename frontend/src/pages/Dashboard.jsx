import { useState } from 'react';
import api, { getErrorMessage } from '../api';
import LearningPlan from '../components/LearningPlan';
import { alertError, badge, btn, card } from '../ui';

const FIT_STYLES = {
  'Strong Fit': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Good Fit': 'text-sky-700 bg-sky-50 border-sky-200',
  'Partial Fit': 'text-amber-700 bg-amber-50 border-amber-200',
  'Low Fit': 'text-slate-600 bg-slate-100 border-slate-300',
};

function FitBadge({ label }) {
  const style = FIT_STYLES[label] || FIT_STYLES['Low Fit'];
  return (
    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${style}`}>
      {label}
    </span>
  );
}

function SkillChip({ skill, tone = 'neutral' }) {
  const toneClass =
    tone === 'matched'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : tone === 'missing'
        ? 'bg-amber-50 border-amber-200 text-amber-700'
        : 'bg-slate-50 border-slate-200 text-slate-600';
  return (
    <span className={`text-xs font-medium border px-2.5 py-1 rounded-lg ${toneClass}`}>
      {skill}
    </span>
  );
}

function ScoreDial({ score }) {
  return (
    <div className="text-right shrink-0">
      <span className="text-3xl font-black text-slate-900">{Math.round(score)}%</span>
      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
        Fit Score
      </span>
    </div>
  );
}

function MatchCard({ match, resumeId }) {
  const meta = [match.employment_type, match.experience_level, match.location]
    .filter(Boolean)
    .join(' · ');

  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [showPlan, setShowPlan] = useState(false);

  const hasGap = match.missing_skills.length > 0;

  const handleGeneratePlan = async () => {
    setShowPlan(true);
    if (plan) return; // already generated for this card
    setPlanLoading(true);
    setPlanError('');
    try {
      const res = await api.get(`/plans/gap/${resumeId}/${match.job_id}`);
      setPlan(res.data);
    } catch (error) {
      setPlanError(getErrorMessage(error, 'Could not generate a plan for these skills.'));
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 hover:border-indigo-300 p-5 rounded-xl transition-all duration-200 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-base text-slate-900">{match.job_title}</h3>
            <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
              {match.company}
            </span>
            <FitBadge label={match.fit_label} />
          </div>
          {meta && <p className="text-xs text-slate-400">{meta}</p>}
          {match.salary_range && (
            <p className="text-xs font-semibold text-slate-500">{match.salary_range}</p>
          )}
        </div>
        <ScoreDial score={match.match_score} />
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{match.gap_summary}</p>

      {match.matched_skills.length > 0 && (
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
            You have ({match.matched_skills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {match.matched_skills.map((s) => (
              <SkillChip key={s} skill={s} tone="matched" />
            ))}
          </div>
        </div>
      )}

      {match.missing_skills_detail.length > 0 && (
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
            Missing ({match.missing_skills_detail.length})
          </p>
          <ul className="space-y-1">
            {match.missing_skills_detail.map((item) => (
              <li key={item.skill} className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-amber-600">{item.skill}</span>
                <span className="text-slate-300"> — </span>
                {item.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasGap && (
        <div className="pt-1">
          {!showPlan ? (
            <button onClick={handleGeneratePlan} className={btn.secondary}>
              Generate Plan for Missing Skills
            </button>
          ) : (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Plan to Close This Gap
                </h4>
                <button
                  onClick={() => setShowPlan(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Hide
                </button>
              </div>
              {planLoading && (
                <p className="text-xs text-slate-400">Building your plan…</p>
              )}
              {planError && (
                <div role="alert" className={alertError}>
                  {planError}
                </div>
              )}
              {plan && <LearningPlan plan={plan} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [matchesData, setMatchesData] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Please select a PDF file first.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setMatchesData(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumeData(response.data);
    } catch (error) {
      setErrorMsg(getErrorMessage(error, 'Upload failed. Please try a different PDF.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFindMatches = async () => {
    if (!resumeData || !resumeData.id) return;

    setIsMatching(true);
    setErrorMsg('');
    try {
      const response = await api.get(`/matches/${resumeData.id}`);
      setMatchesData(response.data);
    } catch (error) {
      setErrorMsg(getErrorMessage(error, 'Failed to calculate matches.'));
    } finally {
      setIsMatching(false);
    }
  };

  const skills = matchesData?.detected_skills || resumeData?.skills || [];
  const bestMatch = matchesData?.best_match || null;
  const bestMatchPreview = resumeData?.best_match || null;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-2xl shadow-lg shadow-indigo-200">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <h1 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Candidate Intelligence Dashboard
        </h1>
        <p className="relative mt-2 text-indigo-100 max-w-2xl text-sm md:text-base">
          Upload your resume in PDF format to extract your contact details, skills, and
          summary, then see exactly which real roles you fit best - and what to learn next.
        </p>
      </div>

      {errorMsg && (
        <div role="alert" className={alertError}>
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Resume Details */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div className={`p-6 ${card}`}>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              Upload Resume
            </h2>

            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors rounded-xl p-6 text-center bg-slate-50">
              <input
                type="file"
                id="file-upload"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  📄
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {file ? file.name : 'Choose a PDF file'}
                </span>
                <span className="text-xs text-slate-400">PDF up to 10MB</span>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`${btn.primary} mt-4 w-full`}
            >
              {isUploading ? 'Parsing Resume...' : 'Analyze Document'}
            </button>
          </div>

          {/* Resume Analysis Card */}
          {resumeData && (
            <div className={`p-6 space-y-5 ${card}`}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {resumeData.candidate_name ? resumeData.candidate_name : 'Resume Analysis'}
                </h3>
                <span className={badge.indigo}>Resume #{resumeData.id}</span>
              </div>

              <div className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between gap-3">
                  <span className="text-slate-400 shrink-0">Email</span>
                  <span className="font-medium text-slate-800 text-right break-all">
                    {resumeData.contact_email || 'Not detected'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <span className="text-slate-400 shrink-0">Phone</span>
                  <span className="font-medium text-slate-800 text-right">
                    {resumeData.contact_phone || 'Not detected'}
                  </span>
                </div>
              </div>

              {resumeData.summary && (
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                    Professional Summary
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{resumeData.summary}</p>
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                    Highlighted Skills ({skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <SkillChip key={s} skill={s} />
                    ))}
                  </div>
                </div>
              )}

              {bestMatchPreview && !matchesData && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Best Fit Right Now
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {bestMatchPreview.job_title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{bestMatchPreview.company}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-slate-900">
                        {Math.round(bestMatchPreview.match_score)}%
                      </span>
                    </div>
                  </div>
                  <FitBadge label={bestMatchPreview.fit_label} />
                  <p className="text-xs text-slate-400 pt-1">
                    Compared against {resumeData.jobs_considered} open roles. Click "Find
                    Matching Jobs" to see the full ranked list and skill gaps.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Matching Engine & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 ${card}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Job Matching</h2>
                <p className="text-sm text-slate-500">
                  Score your resume against every open role, ranked best-fit first.
                </p>
              </div>
              <button
                onClick={handleFindMatches}
                disabled={!resumeData || isMatching}
                className={`${btn.success} whitespace-nowrap`}
              >
                {isMatching ? 'Evaluating Models...' : 'Find Matching Jobs'}
              </button>
            </div>

            {!matchesData ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {resumeData
                  ? "Click 'Find Matching Jobs' to run the evaluation."
                  : 'Upload a resume on the left to begin role scoring.'}
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Skill gap insights */}
                {matchesData.skill_gap_summary.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      What You're Lagging Behind On
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      The skills that show up most often across your top matches - learning
                      these would unlock the most opportunities.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchesData.skill_gap_summary.map((gap) => (
                        <span key={gap.skill} className={badge.amber}>
                          {gap.skill}
                          <span className="ml-1.5 text-amber-500">×{gap.frequency}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Best match highlight */}
                {bestMatch && (
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                      Best Match of {matchesData.jobs_considered} Roles Considered
                    </p>
                    <MatchCard match={bestMatch} resumeId={matchesData.resume_id} />
                  </div>
                )}

                {/* Full ranked list */}
                <div>
                  {matchesData.matches.length > 1 && (
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                      All Matches, Ranked
                    </p>
                  )}
                  <div className="space-y-4">
                    {matchesData.matches.slice(1, 15).map((match) => (
                      <MatchCard key={match.job_id} match={match} resumeId={matchesData.resume_id} />
                    ))}
                  </div>
                  {matchesData.matches.length > 15 && (
                    <p className="text-center text-xs text-slate-400 pt-4">
                      Showing top 15 of {matchesData.matches.length} matches.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
