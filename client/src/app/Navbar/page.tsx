'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '../Auth/login/login';
import RegisterModal from '../Auth/register/register';
import { FaBriefcase, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
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
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check Authentication State Dynamically
  useEffect(() => {
    const checkProfile = () => {
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          setUser(profile.result || profile.user || profile);
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      } else {
        setUser(null);
      }
    };
    checkProfile();
    window.addEventListener('storage', checkProfile);
    return () => window.removeEventListener('storage', checkProfile);
  }, [pathname]);

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (profile) return; // Don't show prompt if already logged in

    const handleCredentialResponse = async (response: any) => {
      try {
        const getApiUrl = () => {
          if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost') return 'http://localhost:5000';
            let url = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
            if (window.location.protocol === 'https:' && url.startsWith('http://')) url = url.replace('http://', 'https://');
            return url;
          }
          return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        };
        const res = await fetch(`${getApiUrl()}/auth/google/onetap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('profile', JSON.stringify(data));
          setUser(data.result || data.user || data);
          toast.success('Successfully logged in with Google!');
          if (data.result.role === 'employer') {
            router.push('/employer/dashboard');
          } else {
            router.push('/Candidate/Dashboard');
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
            use_fedcm_for_prompt: true, // Opt-in to FedCM to fix the GSI_LOGGER warning
          });
          
          window.google.accounts.id.prompt();
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/employer/dashboard') || pathname?.startsWith('/Candidate/Dashboard') || pathname?.startsWith('/dashboard') || pathname?.toLowerCase().startsWith('/admin') || pathname?.startsWith('/employer-profile') || pathname?.toLowerCase().includes('privacy')) {
    return null;
  }
    
  return (
    <div className={`fixed w-full z-40 transition-all duration-500 ${scrolled ? 'top-0 sm:top-4 sm:px-6 lg:px-8' : 'top-0'}`}>
      <nav className={`mx-auto max-w-7xl relative transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-2xl border-b sm:border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:rounded-full' : 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50'}`}>
        <div className={`px-6 md:px-8 flex justify-between items-center transition-all duration-500 ${scrolled ? 'py-2.5' : 'py-4'}`}>
          <Link href="/" className="flex items-center gap-2 group h-14">
            <div className="relative w-40 h-full group-hover:scale-105 transition-transform duration-300 origin-left z-50 hidden sm:block">
              <img src="/Click4Jobs Logo.png" alt="Click4Jobs" className="absolute top-1/2 left-0 -translate-y-1/2 h-[200px] w-auto max-w-none object-contain" />
            </div>
            <div className="relative h-full group-hover:scale-105 transition-transform duration-300 z-20 sm:hidden">
              <img src="/Fav Icon.png" alt="Click4Jobs" className="h-14 w-auto object-contain" />
            </div>
          </Link>
          
          {/* Animated Underline Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Find Jobs', path: '/#jobs-section' },
              { name: 'Job Categories', path: '/#categories-section' },
              { name: 'Pricing', path: '/Subscription/Pricing' }
            ].map((item) => (
              <Link key={item.name} href={item.path} className="text-sm font-bold text-[#121212]/70 hover:text-[#121212] transition-colors relative group py-2">
                {item.name}
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#e49d04] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04]/50"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0B0C10] text-[#e49d04] flex items-center justify-center text-sm font-bold overflow-hidden shadow-inner">
                     {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-[#121212] hidden sm:block">{user?.name?.split(' ')[0]}</span>
                  <FaChevronDown className={`text-gray-400 text-[10px] transition-transform duration-300 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-3 z-50 animate-fade-in-up origin-top-right">
                      <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-gray-50/50 mx-2 rounded-xl">
                        <p className="text-sm font-bold text-[#121212] truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        href={user.role === 'employer' ? '/employer/dashboard' : '/Candidate/Dashboard'}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#e49d04] transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { localStorage.removeItem('profile'); setUser(null); setIsProfileOpen(false); toast.success('Logged out successfully'); router.push('/'); }}
                        className="w-full text-left flex items-center px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => setShowLoginModal(true)} className="text-sm font-bold text-[#121212] hover:text-[#e49d04] px-2 py-2 transition-colors hidden sm:block relative group">
                  Sign In
                  <span className="absolute bottom-1 left-2 right-2 h-[2px] bg-[#e49d04] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
                </button>
                <button onClick={() => setShowRegisterModal(true)} className="px-6 py-2.5 text-sm font-bold text-white bg-[#121212] rounded-full hover:bg-[#e49d04] hover:text-[#121212] hover:shadow-[0_8px_20px_-6px_rgba(228,157,4,0.5)] hover:-translate-y-0.5 transition-all duration-300 hidden sm:block">
                  Create Account
                </button>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2.5 rounded-full transition-all duration-300 bg-gray-100 text-[#121212] hover:bg-gray-200`}>
              {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-3xl sm:rounded-[1.5rem] sm:mt-2 border border-gray-100 shadow-2xl animate-fade-in-up origin-top overflow-hidden">
            <div className="px-6 py-4 space-y-3">
              {[
                { name: 'Find Jobs', path: '/#jobs-section' },
                { name: 'Job Categories', path: '/#categories-section' },
                { name: 'Pricing', path: '/Subscription/Pricing' }
              ].map((item) => (
                <Link key={item.name} href={item.path} onClick={() => setIsMenuOpen(false)} className="block text-base font-bold text-gray-600 hover:text-[#0B0C10] py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-[#0B0C10] text-[#e49d04] flex items-center justify-center text-lg font-bold overflow-hidden shadow-sm">
                         {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#121212] truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <Link
                      href={user.role === 'employer' ? '/employer/dashboard' : '/Candidate/Dashboard'}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex justify-center px-6 py-3 text-sm font-bold text-[#0B0C10] bg-[#e49d04] rounded-full hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => { localStorage.removeItem('profile'); setUser(null); setIsMenuOpen(false); toast.success('Logged out successfully'); router.push('/'); }}
                      className="w-full text-center text-sm font-bold text-red-500 bg-red-50 border border-red-100 px-5 py-3 rounded-full hover:bg-red-100 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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