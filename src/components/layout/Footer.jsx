import React from 'react';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 glass-morphism border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <button
              onClick={() => navigate('/')}
              className="text-3xl font-bold text-white hover:scale-105 transition-transform mb-4"
            >
              myFlix
            </button>
            <p className="text-white/60 text-lg mb-6 max-w-md">
              Your ultimate destination for discovering and enjoying the best movies and series from around the world.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center neon-glow">
                <span className="text-white font-bold">🎬</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center neon-glow">
                <span className="text-white font-bold">🍿</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center neon-glow">
                <span className="text-white font-bold">⭐</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <nav className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Movies', path: '/movies' },
                { name: 'Series', path: '/series' },
                { name: 'Anime', path: '/anime' },
                { name: 'New Releases', path: '/new-releases' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="block text-white/70 hover:text-white hover:neon-text transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <nav className="space-y-3">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Cookie Policy', path: '/cookies' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="block text-white/70 hover:text-white hover:neon-text transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            © {currentYear} myFlix. All rights reserved.
          </p>
          <p className="text-white/50 text-sm mt-4 sm:mt-0">
            Made with ❤️ for movie lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;