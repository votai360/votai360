import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Voters } from './pages/Voters';
import { MapView } from './pages/MapView';
import { CalendarView } from './pages/CalendarView';
import { MessagesView } from './pages/MessagesView';
import { StrategyView } from './pages/StrategyView';
import { SettingsView } from './pages/SettingsView';
import { TeamView } from './pages/TeamView';
import { CompetitorsView } from './pages/CompetitorsView';
import { ConfigProvider } from './store/ConfigContext';
import { AdminView } from './pages/AdminView';
import { AuthGuard } from './components/layout/AuthGuard';

function App() {
  return (
    <ConfigProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas */}
        <Route path="/" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
        <Route path="/voters" element={<AuthGuard><Layout><Voters /></Layout></AuthGuard>} />
        <Route path="/strategy" element={<AuthGuard><Layout><StrategyView /></Layout></AuthGuard>} />
        <Route path="/competitors" element={<AuthGuard><Layout><CompetitorsView /></Layout></AuthGuard>} />
        <Route path="/map" element={<AuthGuard><Layout><MapView /></Layout></AuthGuard>} />
        <Route path="/calendar" element={<AuthGuard><Layout><CalendarView /></Layout></AuthGuard>} />
        <Route path="/team" element={<AuthGuard><Layout><TeamView /></Layout></AuthGuard>} />
        <Route path="/messages" element={<AuthGuard><Layout><MessagesView /></Layout></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Layout><SettingsView /></Layout></AuthGuard>} />
        <Route path="/admin" element={<AuthGuard><Layout><AdminView /></Layout></AuthGuard>} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
