const scoreColor = (score) => {
  if (score >= 70) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const barColor = (score) => {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const ValidatedOpportunityCard = ({ opportunity, rank }) => {
  const score = opportunity.score || 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2">
          <span className="text-slate-500 text-sm font-bold">#{rank}</span>
          <p className="text-slate-200 text-sm font-medium leading-snug">{opportunity.title}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${scoreColor(score)}`}>
          {score}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${barColor(score)}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span>
          👥 {(opportunity.userCount || 0).toLocaleString()} users
        </span>
        <span>🏢 {opportunity.competitorCount || 0} competitors</span>
        <span
          className={
            opportunity.trend === 'Growing'
              ? 'text-emerald-400'
              : opportunity.trend === 'Declining'
                ? 'text-red-400'
                : 'text-amber-400'
          }
        >
          📈 {opportunity.trend || 'Stable'}
        </span>
      </div>
    </div>
  );
};

export default ValidatedOpportunityCard;
