'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LoginModal from '../Auth/login/login';
import RegisterModal from '../Auth/register/register';
import { FaBriefcase, FaBars, FaTimes } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname?.startsWith('/employer/dashboard') || pathname?.startsWith('/Condidate/Dashboard') || pathname?.startsWith('/dashboard') || pathname?.toLowerCase().startsWith('/admin') || pathname?.startsWith('/employer-profile')) {
    return null;
  }
    
  return (
    <div className="sticky top-0 z-50 transition-all duration-300">
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#FACC15] p-2.5 rounded-xl shadow-lg shadow-[#FACC15]/20 group-hover:scale-105 transition-all duration-300">
               <FaBriefcase className="text-[#0B0C10] text-lg" />
            </div>
            <span className="text-2xl font-black text-[#121212] tracking-tight">
              Job<span className="text-[#FACC15]">Portal</span>
            </span>
          </Link>
          
          {/* Premium Pill-shaped Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-50/80 p-1.5 rounded-full border border-gray-100 shadow-inner">
            {[
              { name: 'Find Jobs', path: '/#jobs-section' },
              { name: 'Job Categories', path: '/#categories-section' },
              { name: 'Pricing', path: '/Subscription/Pricing' }
            ].map((item) => (
              <Link key={item.name} href={item.path} className="text-sm font-bold text-gray-600 hover:text-[#0B0C10] py-2 px-5 rounded-full hover:bg-white hover:shadow-sm transition-all duration-300">
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-sm font-bold text-gray-600 hover:text-[#0B0C10] px-2 py-2 transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-2.5 text-sm font-bold text-[#0B0C10] bg-[#FACC15] rounded-full hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20 transition-all transform hover:-translate-y-0.5"
            >
              Sign Up
            </button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#0B0C10] bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-all">
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-3">
              {[
                { name: 'Find Jobs', path: '/#jobs-section' },
                { name: 'Job Categories', path: '/#categories-section' },
                { name: 'Pricing', path: '/Subscription/Pricing' }
              ].map((item) => (
                <Link key={item.name} href={item.path} className="block text-base font-bold text-gray-600 hover:text-[#0B0C10] py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <button
                  onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }}
                  className="w-full text-center text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 px-5 py-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setShowRegisterModal(true); setIsMenuOpen(false); }}
                  className="w-full px-6 py-3 text-sm font-bold text-[#0B0C10] bg-[#FACC15] rounded-full hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20 transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </div>
  );
};

export default Navbar;
