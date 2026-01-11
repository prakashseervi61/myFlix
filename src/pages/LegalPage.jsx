import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function LegalPage({ type }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);
  const content = {
    privacy: {
      title: 'Privacy Policy',
      text: 'Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information when you use our service.'
    },
    terms: {
      title: 'Terms of Use',
      text: 'By using our service, you agree to these terms. Please read them carefully before using our platform.'
    },
    cookies: {
      title: 'Cookie Preferences',
      text: 'We use cookies to enhance your experience. You can manage your cookie preferences and learn about how we use cookies here.'
    }
  };

  const { title, text } = content[type] || content.privacy;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:neon-text transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
        
        <div className="glass-morphism rounded-3xl p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 neon-text">{title}</h1>
          <div className="text-white/70 leading-relaxed">
            <p className="mb-6 text-lg">{text}</p>
            <p className="text-sm text-white/50">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalPage;