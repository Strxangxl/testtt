import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FullScreenLoader from './components/FullScreenLoader.jsx';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader message="Securing your urgent note space..." />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <DashboardPage /> : <AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
