
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AppProviders from './components/providers/AppProviders';
import { Toaster } from 'react-hot-toast';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useWalletReady } from './hooks/useWalletReady';

import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import InvestmentsPage from './pages/InvestmentsPage';
import AdminPage from './pages/AdminPage';
import CreateListingPage from './pages/CreateListingPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  const location = useLocation();
  const walletReady = useWalletReady();
  const isLoginScreen = location.pathname === '/' && !walletReady;

  return (
    <AppProviders>
      <div className={`App app-modern${isLoginScreen ? ' app-login-only' : ''}`}>
        <Toaster />
        {!isLoginScreen && <Header />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<PropertyDetailPage />} />
          <Route path="/list-property" element={<CreateListingPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        {!isLoginScreen && <Footer />}
      </div>
    </AppProviders>
  );
}

export default App;
