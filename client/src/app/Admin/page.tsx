'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaUserShield, FaLock, FaEnvelope } from 'react-icons/fa';
import { useLoginMutation } from '@/features/authApi';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return 'http://localhost:5000';
    let url = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    if (window.location.protocol === 'https:' && url.startsWith('http://')) url = url.replace('http://', 'https://');
    return url.replace(/\/$/, ''); // Removes trailing slashes
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
};

export default function AdminGate() {
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
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
  
  // Utilizing your existing Redux login hook for seamless auth integration
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  useEffect(() => {
    // Ping database to check if we need to initialize the first admin
    fetch(`${getApiUrl()}/auth/check-admin`)
      .then(res => {
        if (!res.ok) throw new Error('API Route not found (Backend might need a restart)');
        return res.json();
      })
      .then(data => setHasAdmin(data.hasAdmin))
      .catch(err => {
        console.error(err);
        setHasAdmin(false); // Fallback to allow initialization if network fails
        toast.error('Failed to verify secure database status');
      });
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/auth/setup-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Admin Initialization Complete! Please log in.');
        setHasAdmin(true);
        setPassword(''); // Clear password for security
      } else {
        toast.error(data.message || 'Setup failed');
      }
    } catch (err) {
      toast.error('Network Error during setup');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      if (result.result?.role === 'admin') {
        localStorage.setItem('profile', JSON.stringify({ ...result }));
        toast.success('Admin Login successful!');
        router.push('/Admin/Dashboard'); // Redirect to your existing Admin Dashboard
      } else {
        toast.error('Access Denied. You are not an admin.');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Invalid credentials');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/admin-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent to your admin email.');
        setOtpSent(true);
        setNewEmail(email); // Pre-fill new email with current
      } else {
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
      const res = await fetch(`${getApiUrl()}/auth/admin-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldEmail: email, otp, newEmail, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Credentials updated successfully! Please login.');
        setIsForgotPassword(false);
        setOtpSent(false);
        setEmail(newEmail);
        setPassword('');
        setOtp('');
        setNewPassword('');
      } else {
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

  if (hasAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e49d04]"></div></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e49d04] via-[#0B0C10] to-[#e49d04]"></div>
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#0B0C10] rounded-2xl flex items-center justify-center text-[#e49d04] mb-4 shadow-lg">
             <FaUserShield size={28} />
          </div>
          <h2 className="text-3xl font-black text-[#121212] tracking-tight">{isForgotPassword ? 'Reset Credentials' : hasAdmin ? 'Admin Portal' : 'Initialize Admin'}</h2>
          <p className="text-sm text-gray-500 mt-2">{isForgotPassword ? 'Verify OTP to update your master email and password.' : hasAdmin ? 'Secure access for authorized personnel only.' : 'No admin found. Set up the master credentials.'}</p>
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
          <form onSubmit={hasAdmin ? handleLogin : handleSetup} className="space-y-6">
          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3.5 text-gray-400" />
            <input type="email" placeholder="Admin Email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3.5 left-3.5 text-gray-400" />
            <input type="password" placeholder="Secure Password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {hasAdmin && (
             <div className="flex justify-end"><button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-[#e49d04] hover:text-[#cc8c03]">Forgot password?</button></div>
          )}
          <button type="submit" disabled={isLoggingIn} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#0B0C10] hover:bg-[#1E293B] focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5">
            {hasAdmin ? (isLoggingIn ? 'Verifying...' : 'Secure Login') : 'Create Master Admin'}
          </button>
        </form>
        )}
        
      </div>
    </div>
  );
}