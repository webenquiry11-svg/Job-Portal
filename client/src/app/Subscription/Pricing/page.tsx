import React from 'react';
import Link from 'next/link';
import { FaEnvelope, FaClock, FaShieldAlt, FaCoins } from 'react-icons/fa';

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl space-y-12">
        
        {/* Pricing Header */}
        <div className="bg-[#0B0C10] p-10 md:p-16 rounded-3xl shadow-xl text-center relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#e49d04] to-[#cc8c03]"></div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Hire Verified Talent. Pay Only for Results.</h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Stop wasting budget on flat-fee job boards and unqualified clicks. Click4Jobs operates on a transparent, credit-based system. Use credits only when you post your jobs across India, and when you are ready to unlock, assess, and hire elite talent.
            </p>
        </div>

        {/* Why Choose Match Credits? */}
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-[#121212] mb-4 flex items-center gap-3"><FaCoins className="text-[#e49d04]" /> Zero Wasted Spend</h3>
              <p className="text-gray-600 leading-relaxed">Browsing AI-matched profiles is free. You only spend credits to reveal contact information or trigger technical audits.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-[#121212] mb-4 flex items-center gap-3"><FaClock className="text-[#e49d04]" /> Speed to Hire</h3>
              <p className="text-gray-600 leading-relaxed">Burn credits to activate our Priority Match protocol, pushing your open role to the top of the queue for the best candidates in your target zones.</p>
            </div>
        </div>

        {/* Contact / Grievance Redressal */}
        <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-black text-[#121212] mb-2">Contact Us</h2>
          <h3 className="text-xl font-bold text-[#e49d04] mb-8">Grievance Redressal & Support</h3>
          
          <div className="space-y-8 text-gray-600 leading-relaxed">
            <p>Whether you are an employer needing assistance with Match Credits or a candidate facing a technical issue, our support team is ready to help.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-[#121212] mb-2 flex items-center gap-2"><FaEnvelope className="text-[#e49d04]"/> Employer Support</h4>
                <p className="text-sm mb-3">For billing inquiries, ATS integration, or enterprise plans.</p>
                <a href="mailto:grievance@click4jobs.in" className="text-[#e49d04] font-bold hover:underline">grievance@click4jobs.in</a>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-[#121212] mb-2 flex items-center gap-2"><FaEnvelope className="text-[#e49d04]"/> Candidate Support</h4>
                <p className="text-sm mb-3">For profile verification issues or platform assistance.</p>
                <a href="mailto:grievance@click4jobs.in" className="text-[#e49d04] font-bold hover:underline">grievance@click4jobs.in</a>
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2"><FaShieldAlt /> Report a Listing</h4>
              <p className="text-sm text-red-900 mb-3">If you spot a fraudulent job post or suspicious activity, report it instantly.</p>
              <a href="mailto:grievance@click4jobs.in" className="text-red-700 font-bold hover:underline">grievance@click4jobs.in</a>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <FaClock className="text-[#e49d04] text-lg" />
              Support Hours: Monday - Friday (9:00 AM to 6:00 PM IST)
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <Link href="/" className="text-[#e49d04] font-bold hover:underline">&larr; Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}