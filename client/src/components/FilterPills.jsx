const DOMAINS = ['All', 'Education', 'Healthcare', 'Finance', 'Technology', 'Daily Life', 'Business'];

const FilterPills = ({ activeDomain, onDomainChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {DOMAINS.map((domain) => (
        <button
          key={domain}
          type="button"
          onClick={() => onDomainChange(domain)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeDomain === domain
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          {domain}
        </button>
      ))}
    </div>
  );
};

export default FilterPills;
