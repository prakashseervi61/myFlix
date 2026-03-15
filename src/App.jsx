import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth.jsx';
import { MovieProvider } from './contexts/MovieContext.jsx';
import { TVProvider } from './contexts/TVContext.jsx';
import { WatchlistProvider } from './contexts/WatchlistContext.jsx';
import { PreviewModalProvider } from './contexts/PreviewModalContext.jsx';
import { BrowseProvider } from './contexts/BrowseContext.jsx';
import MoviePreviewModal from './components/ui/MoviePreviewModal.jsx';

/** Lazy-loaded pages for code splitting and faster initial load */
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const TVBrowsePage = lazy(() => import('./pages/TVBrowsePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const TVShowDetails = lazy(() => import('./pages/TVShowDetails'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-background p-4 md:p-8">
    <div className="max-w-[1280px] mx-auto space-y-8">
      <div className="w-full h-[400px] skeleton-loader opacity-20" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] skeleton-loader rounded-xl shadow-lg" />
        ))}
      </div>
    </div>
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
        <BrowseProvider>
          <MovieProvider>
            <TVProvider>
              <WatchlistProvider>
                <PreviewModalProvider>
                <div className="min-h-screen bg-background text-white flex flex-col">
                  {!isAuthPage && <Header />}
                  <main className="flex-1">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="/tvshows" element={<TVBrowsePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/movie/:id" element={<MovieDetail />} />
                        <Route path="/tv/:id" element={<TVShowDetails />} />
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
            </TVProvider>
          </MovieProvider>
        </BrowseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
