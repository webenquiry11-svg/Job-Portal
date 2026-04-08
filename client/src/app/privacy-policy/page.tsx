import React from 'react';
import Link from 'next/link';
import { FaShieldAlt, FaFileContract, FaLock, FaDatabase, FaUserShield, FaBalanceScale, FaCreditCard, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Hero Section */}
      <div className="bg-[#0B0C10] py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#e49d04] to-[#cc8c03]"></div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Legal & Privacy Center</h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
          Everything you need to know about how we protect your data and the terms of using Click4Jobs.
        </p>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-6 md:px-12 max-w-4xl -mt-10 relative z-10 space-y-8">
        
        {/* Privacy Policy Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="w-14 h-14 bg-[#0B0C10] rounded-2xl flex items-center justify-center text-[#e49d04] shadow-md">
              <FaShieldAlt size={28} />
            </div>
            <h2 className="text-3xl font-black text-[#121212]">Privacy Policy</h2>
          </div>
          
          <div className="space-y-8 text-gray-600 leading-relaxed">
            <p className="text-lg">
              Protecting your personal and professional data is our highest priority. Click4Jobs complies with all national data protection regulations to ensure your information remains secure.
            </p>

            <div>
              <h3 className="text-xl font-bold text-[#121212] mb-4 flex items-center gap-2"><FaDatabase className="text-[#e49d04]" /> Information We Collect</h3>
              <div className="space-y-4 ml-6 border-l-2 border-gray-100 pl-4">
                <p><strong className="text-[#121212]">Candidates:</strong> We collect your name, contact details, employment history, educational background, and location data to facilitate the matching process.</p>
                <p><strong className="text-[#121212]">Employers:</strong> We collect company details, billing information, and hiring metrics to maintain your account and process credit transactions securely.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#121212] mb-3 flex items-center gap-2"><FaUserShield className="text-[#e49d04]" /> How We Use Your Data</h3>
              <p>Your data is exclusively used to power the Click4Jobs AI matching algorithm. For candidates, your personal contact information remains hidden from employers until an employer specifically utilizes a Match Credit to unlock your profile.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#121212] mb-3 flex items-center gap-2"><FaLock className="text-[#e49d04]" /> Data Security & Third Parties</h3>
              <p>We utilize industry-standard 256-bit encryption to protect your data. We do not sell, rent, or lease our user lists to third-party marketers. Your data is only shared with verified employers on Click4Jobs when a legitimate hiring match is initiated.</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="w-14 h-14 bg-[#e49d04] rounded-2xl flex items-center justify-center text-[#0B0C10] shadow-md">
              <FaFileContract size={28} />
            </div>
            <h2 className="text-3xl font-black text-[#121212]">Terms & Conditions</h2>
          </div>
          
          <div className="space-y-8 text-gray-600 leading-relaxed">
            <p className="text-lg">
              By accessing and using Click4Jobs, both candidates and employers agree to the following terms, designed to maintain a high-quality, professional environment.
            </p>

            <div>
              <h3 className="text-xl font-bold text-[#121212] mb-3 flex items-center gap-2"><FaCheckCircle className="text-[#e49d04]" /> Account Integrity & Accuracy</h3>
              <p>All users must provide accurate, up-to-date information. Candidates found falsifying employment history or skills, and employers posting fraudulent job listings, will face immediate permanent suspension from the Click4Jobs platform.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#121212] mb-4 flex items-center gap-2"><FaCreditCard className="text-[#e49d04]" /> The Credit Economy (For Employers)</h3>
              <ul className="space-y-4 ml-6 border-l-2 border-gray-100 pl-4">
                <li><strong className="text-[#121212]">Purchasing & Usage:</strong> Match Credits are the digital currency of the platform. They are used to unlock candidate contact details and access premium features.</li>
                <li><strong className="text-[#121212]">Non-Refundable Policy:</strong> All credit purchases are final and non-refundable. Credits used to unlock a candidate's profile cannot be restored if the candidate ultimately declines an interview or job offer.</li>
                <li><strong className="text-[#121212]">Validity:</strong> Depending on the subscription tier chosen, unused credits may expire at the end of the billing cycle or roll over. Please refer to your specific plan details in your dashboard.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#121212] mb-3 flex items-center gap-2"><FaBalanceScale className="text-[#e49d04]" /> Fair Usage</h3>
              <p>Employers may not use Click4Jobs to harvest candidate data for third-party marketing or external databases. The platform is strictly for direct hiring purposes.</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#121212] font-bold hover:text-[#e49d04] transition-colors bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 hover:shadow-md">
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
