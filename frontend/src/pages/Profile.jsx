import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../auth-context';
import { initialsFor } from '../utils';
import { alertError, badge, btn, card } from '../ui';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

function Stat({ label, value, hint }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="text-3xl font-black text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">
        {label}
      </div>
      {hint && <div className="text-xs text-slate-400 mt-2">{hint}</div>}
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 break-all">{children}</span>
    </div>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/users/me/profile')
      .then((res) => {
        if (!cancelled) setProfile(res.data);
      })
      .catch((error) => {
        if (!cancelled) setErrorMsg(getErrorMessage(error, 'Could not load your profile.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  // Fall back to the basic user from the auth context if the detail call failed
  const details = profile || user;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Identity card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 shadow-lg shadow-indigo-200">
        <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black">
            {initialsFor(details)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
              {details?.full_name || 'Your Account'}
            </h1>
            <p className="text-indigo-100 text-sm mt-1 break-all">{details?.email}</p>
            <span className="inline-block mt-3 text-xs font-semibold bg-white/15 text-white border border-white/25 px-3 py-1 rounded-full">
              Candidate Account
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start sm:self-center px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold rounded-xl text-sm transition-all duration-200 whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className={alertError}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm py-8 text-center">Loading your details…</div>
      ) : (
        <>
          {/* Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              label="Resumes Uploaded"
              value={profile?.resume_count ?? 0}
              hint={
                profile?.last_resume_at
                  ? `Last upload ${formatDate(profile.last_resume_at)}`
                  : 'No resumes yet'
              }
            />
            <Stat label="Applications Sent" value={profile?.application_count ?? 0} />
            <Stat label="Skills Detected" value={profile?.skills?.length ?? 0} />
          </div>

          {/* Account details */}
          <div className={`p-6 ${card}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Account Details
            </h2>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Full name">{details?.full_name || 'Not provided'}</DetailRow>
              <DetailRow label="Email address">{details?.email}</DetailRow>
              <DetailRow label="Account ID">
                <span className={badge.indigo}>#{details?.id}</span>
              </DetailRow>
              <DetailRow label="Member since">{formatDate(details?.created_at)}</DetailRow>
              <DetailRow label="Account type">Candidate</DetailRow>
            </div>
          </div>

          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <div className={`p-6 ${card}`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Skills From Your Resumes
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className={badge.neutral}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next step */}
          <div className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${card}`}>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {profile?.resume_count ? 'Keep matching' : 'Upload your first resume'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Head to the dashboard to parse a resume and score it against open roles.
              </p>
            </div>
            <Link to="/dashboard" className={`${btn.primary} whitespace-nowrap text-center`}>
              Go to Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
