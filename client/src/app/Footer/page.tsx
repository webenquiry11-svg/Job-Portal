'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaPaperPlane, FaShieldAlt } from 'react-icons/fa';
import { HiOutlineMailOpen } from 'react-icons/hi';

const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState('');

  // Enhanced route protection
  const isDashboard = pathname?.toLowerCase().match(/\/(admin|employer|candidate|condidate|dashboard|privacy)/);
  if (isDashboard) return null;

  const brandColor = "#e49d04";

  return (
    <footer className="relative bg-[#f8f9fb] pt-20 pb-10 mt-auto overflow-hidden">
      {/* Premium Gradient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: brandColor }}></div>
      
      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Top Section: Branding & Newsletter CTA */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mb-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-sm font-semibold mb-4" style={{ color: brandColor }}>
              <HiOutlineMailOpen className="text-lg" />
              <span>Stay updated with the market</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Ready to find your <span style={{ color: brandColor }}>dream job?</span>
            </h2>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your professional email" 
                className="w-full sm:w-80 px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-[#e49d04]/10 focus:border-[#e49d04] outline-none transition-all duration-300 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              className="px-8 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              style={{ backgroundColor: brandColor }}
            >
              Get Started <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </div>

        {/* Middle Section: Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Company Identity */}
          <div className="lg:col-span-4">
            <div className="h-10 mb-8 flex items-center overflow-hidden">
              <img src="/Click4Jobs Logo.png" alt="Click4Jobs" className="h-[200px] w-auto hover:opacity-80 transition-opacity" />
            </div>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 pr-4">
              Click4Jobs is India's most trusted recruitment ecosystem, utilizing AI-driven matching to connect top-tier talent with industry leaders.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <FaLinkedinIn />, link: '#' },
                { icon: <FaTwitter />, link: '#' },
                { icon: <FaInstagram />, link: 'https://www.instagram.com/click4jobs.in/' },
                { icon: <FaFacebookF />, link: 'https://www.facebook.com/Click4Jobs.in' },
              ].map((social, i) => (
                <a 
                  key={i} 
                  // @ts-ignore
                  href={social.link}
                  className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group"
                  style={{ '--hover-bg': brandColor } as React.CSSProperties}
                  target={social.link !== '#' ? "_blank" : undefined}
                  rel={social.link !== '#' ? "noopener noreferrer" : undefined}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h4 className="text-gray-900 font-bold mb-8 relative inline-block">
              For Candidates
              <span className="absolute -bottom-2 left-0 w-8 h-1 rounded-full" style={{ backgroundColor: brandColor }}></span>
            </h4>
            <ul className="space-y-4">
              {['Browse Jobs', 'Candidate Profile', 'Job Alerts', 'Resume Builder'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-[2px] mr-0 group-hover:mr-2 transition-all duration-300" style={{ backgroundColor: brandColor }}></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-gray-900 font-bold mb-8 relative inline-block">
              For Employers
              <span className="absolute -bottom-2 left-0 w-8 h-1 rounded-full" style={{ backgroundColor: brandColor }}></span>
            </h4>
            <ul className="space-y-4">
              {['Post a Job', 'Search Talent', 'Pricing Plans', 'Enterprise'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-[2px] mr-0 group-hover:mr-2 transition-all duration-300" style={{ backgroundColor: brandColor }}></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3">
            <h4 className="text-gray-900 font-bold mb-8 relative inline-block">
              Get in Touch
              <span className="absolute -bottom-2 left-0 w-8 h-1 rounded-full" style={{ backgroundColor: brandColor }}></span>
            </h4>
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-[#e49d04]/30 transition-colors">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Headquarters</p>
                <p className="text-sm text-gray-700 font-medium">Ludhiana, Punjab, India</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-[#e49d04]/30 transition-colors">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Email Support</p>
                <p className="text-sm text-gray-700 font-medium">support@click4jobs.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Click4Jobs.</span>
            <span className="hidden md:inline">•</span>
            <span>Made with precision in India</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy & Terms</Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-50 text-green-600 border border-green-100">
              <FaShieldAlt className="text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Verified Secure</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;