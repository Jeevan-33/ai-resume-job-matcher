import { useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsUploading(true);
    setMatches([]);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setParsedData(response.data);
    } catch (error) {
      console.error(error);
      alert('Upload failed. Please confirm you are logged in.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFindMatches = async () => {
    if (!parsedData || !parsedData.id) return;

    setIsMatching(true);
    try {
      const response = await api.get(`/matches/${parsedData.id}`);
      setMatches(response.data);
    } catch (error) {
      console.error(error);
      alert('Failed to calculate matches.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Candidate Intelligence Dashboard
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl text-sm md:text-base">
          Upload your resume in PDF format to parse key qualifications and trigger automated semantic matching across open roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Resume Details */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              Upload Resume
            </h2>

            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors rounded-xl p-6 text-center bg-slate-950/50">
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
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl">
                  📄
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  {file ? file.name : 'Choose a PDF file'}
                </span>
                <span className="text-xs text-slate-500">PDF up to 10MB</span>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              {isUploading ? 'Parsing Resume...' : 'Analyze Document'}
            </button>
          </div>

          {/* Parsed Info Card */}
          {parsedData && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Document Summary
              </h3>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-slate-200">{parsedData.contact_email || 'Not detected'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-medium text-slate-200">{parsedData.contact_phone || 'Not detected'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Resume ID</span>
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/50">
                    #{parsedData.id}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Matching Engine & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">AI Job Matching</h2>
                <p className="text-sm text-slate-400">
                  Compare resume token distribution against active job postings.
                </p>
              </div>
              <button
                onClick={handleFindMatches}
                disabled={!parsedData || isMatching}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 whitespace-nowrap"
              >
                {isMatching ? 'Evaluating Models...' : 'Find Matching Jobs'}
              </button>
            </div>

            {/* Match Listings */}
            <div className="mt-6 space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  {parsedData 
                    ? "Click 'Find Matching Jobs' to run the evaluation." 
                    : 'Upload a resume on the left to begin role scoring.'}
                </div>
              ) : (
                matches.map((match) => {
                  const score = match.match_score;
                  const isHighMatch = score >= 50;

                  return (
                    <div
                      key={match.job_id}
                      className="bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 p-5 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{match.job_title}</h3>
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                            {match.company}
                          </span>
                        </div>
                        {match.job_description && (
                          <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">
                            {match.job_description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right">
                          <span
                            className={`text-2xl font-black ${
                              isHighMatch ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {score}%
                          </span>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Fit Score
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}