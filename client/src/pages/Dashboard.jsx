import { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import FilterPills from '../components/FilterPills.jsx';
import ProblemCard from '../components/ProblemCard.jsx';
import ValidationReport from '../components/ValidationReport.jsx';
import SourceBreakdownBar from '../components/SourceBreakdownBar.jsx';
import { findProblems, finalizeProblems } from '../services/api.js';

const PAGE_SIZE = 10;

const Dashboard = ({ initialProblems = [], initialKeyword = '' }) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [problems, setProblems] = useState(initialProblems);
  const [activeDomain, setActiveDomain] = useState('All');
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [report, setReport] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [sourceBreakdown, setSourceBreakdown] = useState(null);

  const filteredProblems = useMemo(() => {
    if (activeDomain === 'All') return problems;
    return problems.filter((p) => p.domain === activeDomain);
  }, [problems, activeDomain]);

  const visibleProblems = filteredProblems.slice(0, page * PAGE_SIZE);
  const hasMore = visibleProblems.length < filteredProblems.length;

  const handleFind = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setReport(null);
    setPage(1);
    setSourceBreakdown(null);

    try {
      const { data } = await findProblems(keyword, activeDomain);
      setProblems(data.problems || []);
      setSourceBreakdown(data.sourceBreakdown || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find problems. Check your API keys.');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (problems.length === 0) return;
    setFinalizing(true);
    setError('');

    try {
      const problemIds = problems.map((p) => p._id);
      const { data } = await finalizeProblems(keyword, problemIds);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize problems.');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onFind={handleFind}
        onFinalize={handleFinalize}
        loading={loading}
        finalizing={finalizing}
        hasProblems={problems.length > 0}
      />

      <FilterPills activeDomain={activeDomain} onDomainChange={setActiveDomain} />

      {sourceBreakdown && !loading && <SourceBreakdownBar breakdown={sourceBreakdown} />}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Discovered Problems
            {filteredProblems.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">({filteredProblems.length})</span>
            )}
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : filteredProblems.length === 0 ? (
            <p className="text-slate-500 text-sm">Search for a keyword to discover real-world problems.</p>
          ) : (
            <>
              <div className="space-y-3">
                {visibleProblems.map((problem) => (
                  <ProblemCard key={problem._id} problem={problem} />
                ))}
              </div>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="mt-4 w-full py-2.5 text-sm font-medium text-violet-400 hover:text-violet-300 border border-slate-700 hover:border-slate-600 rounded-xl transition-colors"
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>

        <ValidationReport report={report} loading={finalizing} />
      </div>
    </div>
  );
};

export default Dashboard;
