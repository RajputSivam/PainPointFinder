import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, login, register, submitComplaint } from '../services/api.js';
import { useSupportChat } from '../context/SupportChatContext.jsx';

const API_KEY_FIELDS = [
  { key: 'reddit_client_id', label: 'Reddit Client ID', envKey: 'REDDIT_CLIENT_ID' },
  { key: 'reddit_client_secret', label: 'Reddit Client Secret', envKey: 'REDDIT_CLIENT_SECRET' },
  { key: 'youtube_api_key', label: 'YouTube API Key', envKey: 'YOUTUBE_API_KEY' },
  { key: 'news_api_key', label: 'NewsAPI Key', envKey: 'NEWS_API_KEY' },
  { key: 'apify_api_token', label: 'Apify API Token', envKey: 'APIFY_API_TOKEN' },
  { key: 'openai_api_key', label: 'OpenAI API Key', envKey: 'OPENAI_API_KEY' },
];

const Settings = () => {
  const navigate = useNavigate();
  const { openChat } = useSupportChat();
  const [apiKeys, setApiKeys] = useState({});
  const [complaintText, setComplaintText] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('apiKeys');
    if (stored) setApiKeys(JSON.parse(stored));

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }

    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(({ data }) => {
          setName(data.name || '');
          setEmail(data.email || '');
        })
        .catch(() => {});
    }
  }, []);

  const handleSaveKeys = () => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKeyChange = (key, value) => {
    setApiKeys((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = async () => {
    setError('');
    setSuccess('');
    try {
      const { data } = await updateProfile(name, email);
      localStorage.setItem('user', JSON.stringify(data));
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please log in first.');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const fn = authMode === 'login' ? login : register;
      const payload = authMode === 'login' ? [email, password] : [name, email, password];
      const { data } = await fn(...payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(authMode === 'login' ? 'Logged in successfully' : 'Account created successfully');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    setComplaintLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await submitComplaint(complaintText.trim());
      setSuccess(data.message || 'Complaint submitted successfully');
      setComplaintText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setComplaintLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">API Keys</h2>
        <p className="text-slate-500 text-sm mb-4">
          Stored locally for reference. Server keys are configured in the root .env file.
        </p>
        <div className="space-y-4">
          {API_KEY_FIELDS.map(({ key, label, envKey }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-1">
                {label} <span className="text-slate-600">({envKey})</span>
              </label>
              <input
                type="password"
                value={apiKeys[key] || ''}
                onChange={(e) => handleKeyChange(key, e.target.value)}
                placeholder={`Enter ${label}`}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSaveKeys}
          className="mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors text-sm"
        >
          {saved ? 'Saved!' : 'Save API Keys'}
        </button>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleProfileSave}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Update Profile
          </button>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${authMode === 'login' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${authMode === 'register' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            {authMode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Support</h2>
        <p className="text-slate-400 text-sm mb-4">
          Need help? Chat with our AI assistant or submit a formal complaint below.
        </p>
        <p className="text-slate-300 text-sm mb-4">
          Email:{' '}
          <a href="mailto:support@painpointfinder.com" className="text-violet-400 hover:text-violet-300">
            support@painpointfinder.com
          </a>
        </p>
        <button
          type="button"
          onClick={openChat}
          className="mb-6 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors text-sm"
        >
          Open Support Chat
        </button>
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Describe your issue</label>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              rows={4}
              placeholder="Tell us what went wrong or what you need help with..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={complaintLoading || !complaintText.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
          >
            {complaintLoading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl border border-red-500/30 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Settings;
