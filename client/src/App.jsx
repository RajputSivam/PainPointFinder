import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import SupportChat from './components/SupportChat.jsx';
import { SupportChatProvider } from './context/SupportChatContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import Trends from './pages/Trends.jsx';
import Settings from './pages/Settings.jsx';

const App = () => {
  const location = useLocation();
  const state = location.state || {};

  return (
    <SupportChatProvider>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Dashboard initialProblems={state.problems || []} initialKeyword={state.keyword || ''} />}
          />
          <Route path="/history" element={<History />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <SupportChat />
      </div>
    </SupportChatProvider>
  );
};

export default App;
