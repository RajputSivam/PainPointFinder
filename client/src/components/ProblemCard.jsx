const sourceColors = {
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

const ProblemCard = ({ problem }) => {
  const badgeClass = sourceColors[problem.source] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <p className="text-slate-200 text-sm leading-relaxed mb-3">{problem.text}</p>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
            {problem.source}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            {problem.domain}
          </span>
        </div>
        <div className="flex items-center gap-1 text-orange-400 text-sm font-medium">
          <span role="img" aria-label="fire">
            🔥
          </span>
          <span>{problem.mentionCount || 1}</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;
