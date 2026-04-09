'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '../Auth/login/login';
import RegisterModal from '../Auth/register/register';
import { FaBriefcase, FaBars, FaTimes } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    google: any;
  }
}

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (profile) return; // Don't show prompt if already logged in

    const handleCredentialResponse = async (response: any) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/google/onetap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('profile', JSON.stringify(data));
          toast.success('Successfully logged in with Google!');
          if (data.result.role === 'employer') {
            router.push('/employer/dashboard');
          } else {
            router.push('/Condidate/Dashboard');
          }
        } else {
          toast.error(data.message || 'Google login failed');
        }
      } catch (error) {
        toast.error('An error occurred during Google login');
      }
    };

    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '', // Will be picked from your frontend .env
            callback: handleCredentialResponse,
            cancel_on_tap_outside: false,
            use_fedcm_for_prompt: false, // Disables strict FedCM API to allow localhost testing
          });
          
          // Catch the prompt notification to gracefully handle cooldowns and ad-blockers
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              const reason = notification.getNotDisplayedReason() || notification.getSkippedReason();
              console.log('Google One Tap was skipped or blocked by browser settings:', reason);
            }
          });
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [router]);

  if (pathname?.startsWith('/employer/dashboard') || pathname?.startsWith('/Condidate/Dashboard') || pathname?.startsWith('/dashboard') || pathname?.toLowerCase().startsWith('/admin') || pathname?.startsWith('/employer-profile') || pathname?.toLowerCase().includes('privacy')) {
    return null;
  }
    
  return (
    <div className="sticky top-0 z-50 transition-all duration-300">
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group h-14">
            <div className="relative w-40 h-full group-hover:scale-105 transition-transform duration-300 origin-left z-50">
              <img src="/Click4Jobs Logo.png" alt="Click4Jobs" className="absolute top-1/2 left-0 -translate-y-1/2 h-[200px] w-auto max-w-none object-contain" />
            </div>
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
              className="px-6 py-2.5 text-sm font-bold text-[#0B0C10] bg-[#e49d04] rounded-full hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all transform hover:-translate-y-0.5"
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
                  className="w-full px-6 py-3 text-sm font-bold text-[#0B0C10] bg-[#e49d04] rounded-full hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all"
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
