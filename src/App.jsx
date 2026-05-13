import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
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
        {/* Rota Pública de Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas do App */}
        <Route path="/app" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
        <Route path="/app/voters" element={<AuthGuard><Layout><Voters /></Layout></AuthGuard>} />
        <Route path="/app/strategy" element={<AuthGuard><Layout><StrategyView /></Layout></AuthGuard>} />
        <Route path="/app/competitors" element={<AuthGuard><Layout><CompetitorsView /></Layout></AuthGuard>} />
        <Route path="/app/map" element={<AuthGuard><Layout><MapView /></Layout></AuthGuard>} />
        <Route path="/app/calendar" element={<AuthGuard><Layout><CalendarView /></Layout></AuthGuard>} />
        <Route path="/app/team" element={<AuthGuard><Layout><TeamView /></Layout></AuthGuard>} />
        <Route path="/app/messages" element={<AuthGuard><Layout><MessagesView /></Layout></AuthGuard>} />
        <Route path="/app/settings" element={<AuthGuard><Layout><SettingsView /></Layout></AuthGuard>} />
        <Route path="/app/admin" element={<AuthGuard><Layout><AdminView /></Layout></AuthGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
