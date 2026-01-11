import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function PlaceholderPage() {
  const { section } = useParams();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);
  
  const formatTitle = (section) => {
    return section
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center px-4 max-w-md">
        <div className="glass-morphism rounded-3xl p-12">
          <div className="text-6xl mb-6 opacity-60">🚀</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 neon-text">
            {formatTitle(section)}
          </h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            This page is coming soon. We're working hard to bring you this feature.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all neon-glow"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;