import React from "react";
import { Github, Twitter, Instagram, Mail } from "lucide-react";

function Footer() {
  return (
    <footer 
      className="bg-[#0f1014] border-t border-gray-800 text-gray-400 py-8 md:py-10"
      aria-label="Site footer"
      role="contentinfo"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">myFlix</span>
          </div>
          
          <div className="flex gap-4" role="list" aria-label="Social media links">
            <FooterLink href="https://github.com" label="GitHub" icon={<Github className="w-5 h-5" />} />
            <FooterLink href="https://twitter.com" label="Twitter" icon={<Twitter className="w-5 h-5" />} />
            <FooterLink href="https://instagram.com" label="Instagram" icon={<Instagram className="w-5 h-5" />} />
          </div>
        </div>

        <div className="border-t border-gray-800 mb-8"></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider leading-tight">Browse</h3>
            <ul className="space-y-2" role="list">
              <FooterItem href="/movies">Movies</FooterItem>
              <FooterItem href="/series">TV Shows</FooterItem>
              <FooterItem href="/anime">Anime</FooterItem>
              <FooterItem href="/new-releases">New Releases</FooterItem>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider leading-tight">Support</h3>
            <ul className="space-y-2" role="list">
              <FooterItem href="/help">Help Center</FooterItem>
              <FooterItem href="/account">Account</FooterItem>
              <FooterItem href="/contact">Contact Us</FooterItem>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider leading-tight">Company</h3>
            <ul className="space-y-2" role="list">
              <FooterItem href="/about">About</FooterItem>
              <FooterItem href="/careers">Careers</FooterItem>
              <FooterItem href="/press">Press</FooterItem>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider leading-tight">Legal</h3>
            <ul className="space-y-2" role="list">
              <FooterItem href="/privacy">Privacy Policy</FooterItem>
              <FooterItem href="/terms">Terms of Use</FooterItem>
              <FooterItem href="/cookies">Cookie Preferences</FooterItem>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-800">
          <p className="text-xs sm:text-sm leading-relaxed">&copy; {new Date().getFullYear()} myFlix. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Mail className="w-4 h-4 text-gray-500" />
            <a 
              href="mailto:support@myflix.example" 
              className="text-xs sm:text-sm hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm leading-relaxed"
              aria-label="Email support"
            >
              support@myflix.example
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterItem({ href, children }) {
  return (
    <li role="listitem">
      <a 
        href={href}
        className="hover:text-white transition-colors text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-white/50 rounded-sm"
      >
        {children}
      </a>
    </li>
  );
}

function FooterLink({ href, label, icon }) {
  return (
    <a
      href={href}
      className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      role="listitem"
    >
      {icon}
    </a>
  );
}

export default Footer;