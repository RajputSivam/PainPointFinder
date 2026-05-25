const SearchBar = ({
  keyword,
  setKeyword,
  onFind,
  onFinalize,
  loading,
  finalizing,
  hasProblems,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <p className="text-slate-400 text-sm mb-1">Discover real problems. Validate before you build.</p>
      <h1 className="text-2xl font-bold text-white mb-4">PainPointFinder</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onFind()}
          placeholder="Enter a keyword or niche (e.g. remote work tools)"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={onFind}
          disabled={loading || !keyword.trim()}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Finding...' : 'Find Problems'}
        </button>
        <button
          type="button"
          onClick={onFinalize}
          disabled={finalizing || !hasProblems}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {finalizing ? 'Finalizing...' : 'Finalize'}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
