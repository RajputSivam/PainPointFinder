const SOURCE_COLORS = {
  Reddit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  YouTube: 'bg-red-500/20 text-red-400 border-red-500/30',
  Trustpilot: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  StackExchange: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NewsAPI: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HackerNews: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  GitHub: 'bg-slate-600/20 text-slate-300 border-slate-600/30',
  GoogleNews: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  AppStore: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Amazon: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
  ProductHunt: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  BingNews: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  PlayStore: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
};

const SourceBreakdownBar = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Fetched from</p>
      <div className="flex flex-wrap gap-2">
        {entries.map(([source, count]) => (
          <span
            key={source}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              SOURCE_COLORS[source] || 'bg-slate-700/50 text-slate-400 border-slate-600'
            }`}
          >
            {source} ({count})
          </span>
        ))}
      </div>
    </div>
  );
};

export default SourceBreakdownBar;
