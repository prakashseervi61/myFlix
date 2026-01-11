import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MovieDetail from './pages/MovieDetail';
import BrowsePage from './pages/BrowsePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage';
import LegalPage from './pages/LegalPage';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WatchlistPage from './pages/WatchlistPage';
import HomePage from './pages/HomePage';
import { AuthProvider } from './hooks/useAuth.jsx';
import { MovieProvider } from './contexts/MovieContext.jsx';
import { WatchlistProvider } from './contexts/WatchlistContext.jsx';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MovieProvider>
          <WatchlistProvider>
            <div className="min-h-screen bg-gray-900 text-white">
              {!isAuthPage && <Header />}
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />
                  <Route path="/cookies" element={<LegalPage type="cookies" />} />
                  <Route path="*" element={<PlaceholderPage />} />
                </Routes>
              </main>
              {!isAuthPage && <Footer />}
            </div>
          </WatchlistProvider>
        </MovieProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;