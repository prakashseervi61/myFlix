import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Preview Modal State
  isPreviewModalOpen: false,
  previewMovie: null,
  openPreviewModal: (movie) => set({ isPreviewModalOpen: true, previewMovie: movie }),
  closePreviewModal: () => set({ isPreviewModalOpen: false }),

  // Sidebar State
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // Browse UI State
  browseState: { movies: [], page: 1, hasMore: true, scrollPosition: 0, genres: [], lastFilters: null },
  updateBrowseState: (updates) => set((state) => ({ browseState: { ...state.browseState, ...updates } })),

  tvBrowseState: { shows: [], page: 1, hasMore: true, scrollPosition: 0, genres: [], lastFilters: null },
  updateTvBrowseState: (updates) => set((state) => ({ tvBrowseState: { ...state.tvBrowseState, ...updates } })),

  searchPageState: { query: '', movies: [], page: 1, scrollPosition: 0, lastFilters: null, viewMode: 'grid' },
  updateSearchPageState: (updates) => set((state) => ({ searchPageState: { ...state.searchPageState, ...updates } })),

  homeScrollPosition: 0,
  setHomeScrollPosition: (pos) => set({ homeScrollPosition: pos }),

  watchlistScrollPosition: 0,
  setWatchlistScrollPosition: (pos) => set({ watchlistScrollPosition: pos }),
}));
