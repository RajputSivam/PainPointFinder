import StatCard from './StatCard.jsx';
import ValidatedOpportunityCard from './ValidatedOpportunityCard.jsx';

const formatDiscussants = (count) => {
  if (!count) return '—';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
};

const ValidationReport = ({ report, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Validation Report</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Validation Report</h2>
        <p className="text-slate-500 text-sm">
          Find problems first, then click Finalize to generate your validation report.
        </p>
      </div>
    );
  }

  const oppScore = report.opportunityScore || 0;
  const successProb = report.successProbability || 0;
  const marketSat = report.marketSaturation || 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Validation Report</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label="Opportunity Score"
          value={`${oppScore}%`}
          colorClass={oppScore > 70 ? 'text-emerald-400' : 'text-white'}
        />
        <StatCard
          label="Market Saturation"
          value={`${marketSat}%`}
          colorClass={marketSat >= 50 && marketSat <= 70 ? 'text-amber-400' : 'text-white'}
        />
        <StatCard
          label="Active Discussants"
          value={formatDiscussants(report.activeDiscussants)}
          colorClass="text-violet-400"
        />
        <StatCard
          label="Success Probability"
          value={`${successProb}%`}
          colorClass={successProb > 70 ? 'text-emerald-400' : 'text-white'}
        />
      </div>

      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Top Validated Opportunities
      </h3>
      <div className="space-y-3">
        {(report.topOpportunities || []).map((opp, index) => (
          <ValidatedOpportunityCard key={index} opportunity={opp} rank={index + 1} />
        ))}
      </div>
    </div>
  );
};

export default ValidationReport;
