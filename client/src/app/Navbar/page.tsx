'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LoginModal from '../Auth/login/login';
import RegisterModal from '../Auth/register/register';
import { FaBriefcase } from 'react-icons/fa';

const Navbar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:bg-blue-700 transition-all duration-300">
               <FaBriefcase className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
              Job<span className="text-blue-600 group-hover:text-gray-900 transition-colors duration-300">Portal</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {['Find Jobs', 'Companies', 'Salaries'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </>
  );
};

export default Navbar;
