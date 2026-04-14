'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaLock, FaEnvelope } from 'react-icons/fa';
import { useLoginMutation } from '@/features/authApi';
import toast from 'react-hot-toast';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return 'http://localhost:5000';
    let url = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    if (window.location.protocol === 'https:' && url.startsWith('http://')) url = url.replace('http://', 'https://');
    return url.replace(/\/$/, '').replace(/\/api$/, ''); // Removes trailing slashes and /api
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, '');
};

export default function AdminGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();
  
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  // Direct API Fetcher
  const fetchAdminApi = async (action: string, options?: RequestInit) => {
    const baseUrl = getApiUrl();
    return await fetch(`${baseUrl}/api/admin-system/${action}`, options);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      if (result.result.role === 'admin') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        toast.success('Admin authentication successful');
        router.push('/Admin/Dashboard');
      } else {
        toast.error('Unauthorized. Master Admin access only.');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid master credentials');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetchAdminApi('forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res && res.ok) {
        toast.success('OTP sent to your admin email.');
        setOtpSent(true);
        setNewEmail(email); // Pre-fill new email with current
      } else {
        const data = await res?.json().catch(() => ({}));
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      toast.error('Network Error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetchAdminApi('reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldEmail: email, otp, newEmail, newPassword })
      });
      
      if (res && res.ok) {
        toast.success('Credentials updated successfully! Please login.');
        setIsForgotPassword(false);
        setOtpSent(false);
        setEmail(newEmail);
        setPassword('');
        setOtp('');
        setNewPassword('');
      } else {
        const data = await res?.json().catch(() => ({}));
        toast.error(data.message || 'Failed to reset credentials.');
      }
    } catch (err) {
      toast.error('Network Error.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Input Styling
  const inputClass = "mt-1 w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0B0C10] via-[#e49d04] to-[#0B0C10]"></div>
      
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-[#0B0C10] rounded-2xl flex items-center justify-center text-[#e49d04] mb-4 shadow-lg">
             <FaUserShield size={28} />
          </div>
          <h2 className="text-3xl font-black text-[#121212] tracking-tight">{isForgotPassword ? 'Reset Credentials' : 'Admin Portal'}</h2>
          <p className="text-sm text-gray-500 mt-2">{isForgotPassword ? 'Verify OTP to update your master email and password.' : 'Secure access for authorized personnel only.'}</p>
        </div>

        {isForgotPassword ? (
          <form onSubmit={otpSent ? handleResetPassword : handleForgotPassword} className="space-y-6">
            {!otpSent ? (
              <>
                <div className="relative">
                  <FaEnvelope className="absolute top-3.5 left-3.5 text-gray-400" />
                  <input type="email" placeholder="Enter Current Admin Email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type="submit" disabled={isProcessing} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#0B0C10] hover:bg-[#1E293B] focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50">
                  {isProcessing ? 'Sending OTP...' : 'Send OTP'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-bold text-gray-500 hover:text-[#121212] transition-colors">Back to Login</button>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <input type="text" placeholder="Enter 6-digit OTP" required maxLength={6} className={inputClass + " text-center tracking-[0.5em] font-bold text-lg"} value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
                <div className="relative">
                  <FaEnvelope className="absolute top-3.5 left-3.5 text-gray-400" />
                  <input type="email" placeholder="New Admin Email (Optional)" required className={inputClass} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="relative">
                  <FaLock className="absolute top-3.5 left-3.5 text-gray-400" />
                  <input type="password" placeholder="New Secure Password" required className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <button type="submit" disabled={isProcessing} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#0B0C10] hover:bg-[#1E293B] focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50">
                  {isProcessing ? 'Updating...' : 'Update Credentials'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => { setOtpSent(false); setIsForgotPassword(false); }} className="text-sm font-bold text-gray-500 hover:text-[#121212] transition-colors">Cancel Reset</button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <FaEnvelope className="absolute top-3.5 left-3.5 text-gray-400" />
              <input type="email" placeholder="Admin Email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <FaLock className="absolute top-3.5 left-3.5 text-gray-400" />
              <input type="password" placeholder="Secure Password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex justify-end"><button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-[#e49d04] hover:text-[#cc8c03]">Forgot password?</button></div>
            <button type="submit" disabled={isLoggingIn} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#0B0C10] hover:bg-[#1E293B] focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50">
              {isLoggingIn ? 'Verifying...' : 'Secure Login'}
            </button>
          </form>
        )}
        
      </div>
    </div>
  );
}