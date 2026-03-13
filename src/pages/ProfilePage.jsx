import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useWatchlist } from '../contexts/WatchlistContext.jsx';
import { User, Mail, Calendar, Film, Clock, Heart, Settings, LogOut } from 'lucide-react';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const watchlistContext = useWatchlist();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-[#20151A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-[#C1372C] text-white rounded-full font-bold hover:bg-[#a82e25] transition-all shadow-lg shadow-black/30 active:scale-95"
          >
            Access Account
          </button>
        </div>
      </div>
    );
  }
  
  const { watchlist = [], watchedMovies = [], continueWatching = [] } = watchlistContext || {};

  const stats = [
    { label: 'Movies in Watchlist', value: watchlist.length, icon: Heart },
    { label: 'Movies Watched', value: watchedMovies.length, icon: Film },
    { label: 'Continue Watching', value: continueWatching.length, icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-[#5E4A65] border border-[#C0927C]/20 rounded-full flex items-center justify-center text-white shadow-xl">
            <User size={48} className="text-[#C1372C]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center sm:text-left">{user.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-[#C0927C] mt-2">
              <span className="flex items-center gap-2"><Mail size={16} /> {user.email}</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span className="flex items-center gap-2"><Calendar size={16} /> Member since {new Date(parseInt(user.id)).toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#5E4A65] border border-[#C0927C]/10 p-5 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#20151A]/50 rounded-lg"><stat.icon className="text-[#C1372C]" size={24}/></div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-[#C0927C]">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-[#C0927C]/10 mb-6">
          <nav className="flex gap-4">
            <TabButton label="Overview" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton label="Settings" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </div>

        {activeTab === 'overview' && <OverviewTab watchlist={watchlist} />}
        {activeTab === 'settings' && <SettingsTab user={user} onLogout={handleLogout} />}
      </div>
    </div>
  );
}

const TabButton = ({ label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(label.toLowerCase())}
    className={`px-1 py-2 font-black tracking-wider uppercase text-xs transition-colors ${
      activeTab === label.toLowerCase()
        ? 'text-[#C1372C] border-b-2 border-[#C1372C]'
        : 'text-[#C0927C] hover:text-white'
    }`}
  >
    {label}
  </button>
);

const OverviewTab = ({ watchlist }) => (
  <div className="glass-morphism p-6 rounded-lg">
    <h2 className="text-xl font-bold text-white mb-4">Recently Added to Watchlist</h2>
    {watchlist.length > 0 ? (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {watchlist.slice(0, 6).map(movie => (
          <div key={movie.id} className="aspect-[2/3] rounded-md overflow-hidden bg-[#2A1F25] border border-white/5">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Film size={32} className="text-[#C0927C]/30" /></div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400">Your watchlist is empty.</p>
    )}
  </div>
);

const SettingsTab = ({ user, onLogout }) => (
  <div className="space-y-6">
    <div className="glass-morphism p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
      <div className="space-y-4">
        <InfoField label="Display Name" value={user.name} />
        <InfoField label="Email Address" value={user.email} />
      </div>
    </div>
    <div className="glass-morphism p-6 rounded-lg border border-white/5">
      <h2 className="text-xl font-bold text-[#C1372C] mb-4">Danger Zone</h2>
      <button onClick={onLogout} className="flex items-center gap-2 px-6 py-2 bg-[#C1372C] text-white rounded-xl font-bold hover:bg-[#a82e25] transition-all active:scale-95 shadow-lg shadow-[#C1372C]/10">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-widest text-[#C0927C] mb-1.5">{label}</label>
    <input type="text" value={value} readOnly className="w-full bg-[#20151A]/50 text-[#C0927C] border border-[#C0927C]/20 rounded-xl px-4 py-3 focus:outline-none" />
  </div>
);

export default ProfilePage;