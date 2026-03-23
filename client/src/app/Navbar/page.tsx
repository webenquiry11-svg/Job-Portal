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

  if (pathname?.startsWith('/employer/dashboard') || pathname?.startsWith('/Condidate/Dashboard') || pathname?.startsWith('/dashboard') || pathname?.toLowerCase().startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#0F172A] p-2 rounded-xl shadow-lg shadow-slate-900/20 group-hover:bg-[#1E293B] transition-all duration-300">
               <FaBriefcase className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold text-[#121212] tracking-tight">
              Job<span className="text-[#0F172A]">Portal</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {['Find Jobs', 'Companies', 'Salaries'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-gray-600 hover:text-[#0F172A] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0F172A] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-sm font-semibold text-gray-600 hover:text-[#0F172A] transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0F172A] rounded-full hover:bg-[#1E293B] shadow-lg shadow-slate-900/30 transition-all hover:scale-105 active:scale-95"
            >
              Sign Up
            </button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-[#0F172A] p-2 rounded-md">
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-4">
              {['Find Jobs', 'Companies', 'Salaries'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} className="block text-sm font-medium text-gray-600 hover:text-[#0F172A] transition-colors py-2">
                  {item}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <button
                  onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }}
                  className="w-full text-center text-sm font-semibold text-gray-600 hover:text-[#0F172A] transition-colors px-4 py-2.5 border border-gray-200 rounded-full"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setShowRegisterModal(true); setIsMenuOpen(false); }}
                  className="w-full px-6 py-2.5 text-sm font-semibold text-white bg-[#0F172A] rounded-full hover:bg-[#1E293B] shadow-lg shadow-slate-900/30 transition-all"
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
    </>
  );
};

export default Navbar;
