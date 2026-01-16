import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth.jsx';
import { MovieProvider } from './contexts/MovieContext.jsx';
import { WatchlistProvider } from './contexts/WatchlistContext.jsx';
import { PreviewModalProvider } from './contexts/PreviewModalContext.jsx';
import MoviePreviewModal from './components/ui/MoviePreviewModal.jsx';

/** Lazy-loaded pages for code splitting and faster initial load */
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
            <PreviewModalProvider>
              <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                {!isAuthPage && <Header />}
                <main className="flex-1">
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </main>
                {!isAuthPage && <Footer />}
                <MoviePreviewModal />
              </div>
            </PreviewModalProvider>
          </WatchlistProvider>
        </MovieProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
