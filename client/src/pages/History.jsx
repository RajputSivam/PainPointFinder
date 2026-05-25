import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteHistory, getSearchById } from '../services/api.js';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await getHistory();
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleView = async (id) => {
    try {
      const { data } = await getSearchById(id);
      navigate('/', {
        state: {
          problems: data.problems,
          keyword: data.history.keyword,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load search');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete search');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Search History</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No search history yet. Run a search on the Dashboard.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="px-6 py-4 font-medium">Keyword</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Problems Found</th>
                  <th className="px-6 py-4 font-medium">Top Score</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-white font-medium">{item.keyword}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-300">{item.problemCount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          item.topScore > 70
                            ? 'text-emerald-400'
                            : item.topScore > 50
                              ? 'text-amber-400'
                              : 'text-slate-400'
                        }`}
                      >
                        {item.topScore ? `${item.topScore}%` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(item._id)}
                          className="px-3 py-1.5 bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 rounded-lg text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
