"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaPaperPlane, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState('');

  if (pathname?.toLowerCase().startsWith('/admin') || pathname?.toLowerCase().includes('privacy')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 relative overflow-hidden">
      {/* Subtle top gradient accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#0B0C10] via-[#e49d04] to-[#0B0C10]"></div>

      <div className="container mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6 z-10 flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex h-20">
              <div className="relative w-48 h-full group-hover:scale-105 transition-transform duration-300 origin-left z-50 hidden sm:block">
                <img src="/Click4Jobs Logo.png" alt="Click4Jobs" className="absolute top-1/2 left-0 -translate-y-1/2 h-[280px] w-auto max-w-none object-contain" />
              </div>
              <div className="relative h-full group-hover:scale-105 transition-transform duration-300 z-50 sm:hidden">
                <img src="/Fav Icon.png" alt="Click4Jobs" className="h-20 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Bridging the gap between talent and opportunity across India.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#e49d04] hover:border-[#0B0C10] transition-all duration-300"><FaFacebookF size={14} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#e49d04] hover:border-[#0B0C10] transition-all duration-300"><FaTwitter size={14} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#e49d04] hover:border-[#0B0C10] transition-all duration-300"><FaLinkedinIn size={14} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#e49d04] hover:border-[#0B0C10] transition-all duration-300"><FaInstagram size={14} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 z-10">
            <h4 className="text-sm font-bold text-[#121212] uppercase tracking-wider mb-6">Candidates</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><Link href="/#jobs-section" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Browse Jobs</Link></li>
              <li><Link href="/#categories-section" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Browse Categories</Link></li>
              <li><Link href="/Candidate/Dashboard" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Candidate Dashboard</Link></li>
              <li><Link href="/Candidate/Dashboard" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Saved Jobs</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="lg:col-span-2 z-10">
            <h4 className="text-sm font-bold text-[#121212] uppercase tracking-wider mb-6">Employers</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><Link href="/employer/dashboard" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Post a Job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Employer Dashboard</Link></li>
              <li><Link href="/Subscription/Pricing" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Pricing Plans</Link></li>
              <li><Link href="/#faq" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-4 z-10">
            <h4 className="text-sm font-bold text-[#121212] uppercase tracking-wider mb-6">Stay Connected</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium mb-8">
              <li className="flex items-center gap-3">
                  <FaEnvelope className="text-[#e49d04] flex-shrink-0 text-base" />
                  <span>helpdesk@click4jobs.in</span>
              </li>
              <li className="flex items-center gap-3">
                  <FaClock className="text-[#e49d04] flex-shrink-0 text-base" />
                  <span>Mon - Fri (9:00 AM to 6:00 PM IST)</span>
              </li>
            </ul>
            
            <div className="p-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center shadow-sm focus-within:ring-2 focus-within:ring-[#e49d04]/50 focus-within:border-[#e49d04] transition-all">
                <input 
                  type="email" 
                  placeholder="Subscribe to newsletter" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-gray-700 px-4 py-2 focus:outline-none text-sm placeholder-gray-400 font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => { 
                    if(email){ toast.success('Successfully subscribed to newsletter!'); setEmail(''); } 
                    else { toast.error('Please enter an email address'); } 
                  }} 
                  className="bg-[#0B0C10] text-[#e49d04] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E293B] transition-colors flex items-center gap-2 shrink-0"
                >
                  Subscribe
                </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4 z-10 relative">
          <p>&copy; {new Date().getFullYear()} Click4Jobs. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 font-medium">
            <Link href="/#about" className="hover:text-[#0B0C10] transition-colors">About Us</Link>
            <Link href="/#faq" className="hover:text-[#0B0C10] transition-colors">FAQs</Link>
            <Link href="/#trust-safety" className="hover:text-[#0B0C10] transition-colors">Trust & Safety</Link>
            <Link href="/privacy-policy" target="_blank" className="hover:text-[#0B0C10] transition-colors">Privacy Policy</Link>
            <Link href="/privacy-policy" target="_blank" className="hover:text-[#0B0C10] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
