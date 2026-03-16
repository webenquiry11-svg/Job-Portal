import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaPaperPlane, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';


const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 pt-20 pb-10 border-t border-gray-100">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-bold text-[#121212] tracking-tight">
              Job<span className="text-[#0F172A]">Portal</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              Connecting talent with opportunity. Your dream job is just a click away. Join millions of job seekers today and build your future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-all duration-300 transform hover:-translate-y-1"><FaFacebookF size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-all duration-300 transform hover:-translate-y-1"><FaTwitter size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-all duration-300 transform hover:-translate-y-1"><FaLinkedinIn size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-all duration-300 transform hover:-translate-y-1"><FaInstagram size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-[#121212] mb-6 relative inline-block">
              For Candidates
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#0F172A] rounded-full"></span>
            </h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/jobs" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Browse Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Browse Companies</Link></li>
              <li><Link href="/Condidate/Dashboard" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Candidate Dashboard</Link></li>
              <li><Link href="/saved-jobs" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Saved Jobs</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-lg font-bold text-[#121212] mb-6 relative inline-block">
              For Employers
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#0F172A] rounded-full"></span>
            </h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/post-job" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Post a Job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Employer Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Pricing Plans</Link></li>
              <li><Link href="/resources" className="hover:text-[#0F172A] transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 bg-[#0F172A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>Recruiting Resources</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-bold text-[#121212] mb-6 relative inline-block">
              Stay Connected
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#0F172A] rounded-full"></span>
            </h4>
            <div className="space-y-4 mb-6 text-sm">
                <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-[#0F172A] mt-1 flex-shrink-0" />
                    <span>123 Job Street, Career City, JC 10101</span>
                </div>
                <div className="flex items-center gap-3">
                    <FaPhone className="text-[#0F172A] flex-shrink-0" />
                    <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                    <FaEnvelope className="text-[#0F172A] flex-shrink-0" />
                    <span>support@jobportal.com</span>
                </div>
            </div>
            <form className="flex flex-col space-y-3">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-gray-100 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F172A] border border-gray-200 placeholder-gray-400 text-sm transition-all"
                />
                <button type="button" className="absolute right-1.5 top-1.5 bg-[#0F172A] p-2 rounded-md text-white hover:bg-[#1E293B] transition-colors shadow-lg">
                  <FaPaperPlane size={12} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-[#121212] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#121212] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-[#121212] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
