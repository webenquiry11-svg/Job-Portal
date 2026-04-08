"use client";

import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaPaperPlane, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();

  if (pathname?.startsWith('/Admin')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 relative overflow-hidden">
      {/* Subtle top gradient accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B0C10] via-[#FACC15] to-[#0B0C10]"></div>

      <div className="container mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6 z-10">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex">
              <div className="bg-[#FACC15] p-2.5 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                <FaBriefcase className="text-[#0B0C10] text-xl" />
              </div>
              <span className="text-2xl font-black text-[#121212] tracking-tight">
                Click4<span className="text-[#FACC15]">Jobs</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Connecting top talent with world-class opportunities. Build your career or build your team with our industry-leading hiring platform.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#FACC15] hover:border-[#0B0C10] transition-all duration-300"><FaFacebookF size={14} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#FACC15] hover:border-[#0B0C10] transition-all duration-300"><FaTwitter size={14} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#FACC15] hover:border-[#0B0C10] transition-all duration-300"><FaLinkedinIn size={14} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-[#0B0C10] hover:text-[#FACC15] hover:border-[#0B0C10] transition-all duration-300"><FaInstagram size={14} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 z-10">
            <h4 className="text-sm font-bold text-[#121212] uppercase tracking-wider mb-6">Candidates</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><Link href="/jobs" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Browse Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Browse Companies</Link></li>
              <li><Link href="/Condidate/Dashboard" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Candidate Dashboard</Link></li>
              <li><Link href="/saved-jobs" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Saved Jobs</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="lg:col-span-2 z-10">
            <h4 className="text-sm font-bold text-[#121212] uppercase tracking-wider mb-6">Employers</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><Link href="/post-job" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Post a Job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Employer Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Pricing Plans</Link></li>
              <li><Link href="/resources" className="hover:text-[#0B0C10] hover:translate-x-1 inline-block transition-all">Recruiting Resources</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-4 z-10">
            <h4 className="text-sm font-bold text-[#121212] uppercase tracking-wider mb-6">Stay Connected</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium mb-8">
              <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-[#FACC15] mt-0.5 flex-shrink-0 text-base" />
                  <span>123 Innovation Drive, Tech City, CA 94043</span>
              </li>
              <li className="flex items-center gap-3">
                  <FaEnvelope className="text-[#FACC15] flex-shrink-0 text-base" />
                  <span>support@click4jobs.com</span>
              </li>
            </ul>
            
            <div className="p-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center shadow-sm focus-within:ring-2 focus-within:ring-[#FACC15]/50 focus-within:border-[#FACC15] transition-all">
                <input 
                  type="email" 
                  placeholder="Subscribe to newsletter" 
                  className="w-full bg-transparent text-gray-700 px-4 py-2 focus:outline-none text-sm placeholder-gray-400 font-medium"
                />
                <button type="button" className="bg-[#0B0C10] text-[#FACC15] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E293B] transition-colors flex items-center gap-2 shrink-0">
                  Subscribe
                </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4 z-10 relative">
          <p>&copy; {new Date().getFullYear()} Click4Jobs. All rights reserved.</p>
          <div className="flex space-x-6 font-medium">
            <Link href="/privacy" className="hover:text-[#0B0C10] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0B0C10] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-[#0B0C10] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
