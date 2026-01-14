import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Facebook, Instagram, Mail } from 'lucide-react';

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-gray-950 border-t border-white/5 pt-10 pb-6 text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 mb-8">
          
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                 <span className="font-bold text-white text-base sm:text-lg">m</span>
               </div>
               <span className="text-lg sm:text-xl font-bold text-white tracking-tight">myFlix</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 max-w-sm">
              Your premium destination for streaming entertainment.
            </p>
            <div className="flex gap-3">
              <SocialLink icon={Twitter} href="#" label="Twitter" />
              <SocialLink icon={Facebook} href="#" label="Facebook" />
              <SocialLink icon={Instagram} href="#" label="Instagram" />
              <SocialLink icon={Github} href="#" label="GitHub" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Browse</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/browse" label="Movies" />
              <FooterLink to="/browse?category=trending" label="Trending" />
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <FooterLink to="/profile" label="Profile" />
              <FooterLink to="/watchlist" label="Watchlist" />
              <FooterLink to="/login" label="Sign In" />
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <FooterLink to="/help" label="Help Center" />
              <FooterLink to="/terms" label="Terms of Service" />
              <FooterLink to="/privacy" label="Privacy Policy" />
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs sm:text-sm">
          <p>© {currentYear} myFlix. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-cyan-400 transition-colors">Privacy</button>
            <button className="hover:text-cyan-400 transition-colors">Terms</button>
            <button className="hover:text-cyan-400 transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterLink = ({ to, label }) => {
  const navigate = useNavigate();
  return (
    <li>
      <button 
        onClick={() => navigate(to)} 
        className="text-gray-400 hover:text-cyan-400 transition-colors text-left"
      >
        {label}
      </button>
    </li>
  );
};

const SocialLink = ({ icon: Icon, href, label }) => (
  <a 
    href={href} 
    aria-label={label}
    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-700 transition-all"
  >
    <Icon size={16} />
  </a>
);

export default Footer;