'use client';

import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaTimes } from 'react-icons/fa';
import { useLoginMutation } from '@/features/authApi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [login, { isLoading }] = useLoginMutation();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') return 'http://localhost:5000';
      let url = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      if (window.location.protocol === 'https:' && url.startsWith('http://')) url = url.replace('http://', 'https://');
      return url;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  };

  useEffect(() => {
    const prefillEmail = localStorage.getItem('prefillEmail');
    if (prefillEmail) {
      setFormData(prev => ({ ...prev, email: prefillEmail }));
      localStorage.removeItem('prefillEmail');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      localStorage.setItem('profile', JSON.stringify({ ...result }));
      toast.success('Login successful! Welcome back.');
      setTimeout(() => {
        onClose();
        if (result?.result?.role === 'employer') {
          window.location.href = '/employer/dashboard';
        } else {
          window.location.href = '/Candidate/Dashboard';
        } 
      }, 1500);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error?.data?.message || error?.error || 'Invalid credentials');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetData.email }) });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'OTP sent to your email.');
        setOtpSent(true);
      } else { toast.error(data.message || 'Failed to send OTP'); }
    } catch (err) { toast.error('Server error'); }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resetData) });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successfully. Please login.');
        setIsForgotPassword(false); setOtpSent(false); setFormData({ ...formData, email: resetData.email });
      } else { toast.error(data.message || 'Failed to reset password'); }
    } catch (err) { toast.error('Server error'); }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}/auth/google`;
  };

  // Common Styles matching register.tsx
  const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const btnPrimary = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#e49d04]/20 text-sm font-bold text-[#0B0C10] bg-[#e49d04] hover:bg-[#cc8c03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e49d04] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const socialBtn = "w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors z-10">
          <FaTimes size={24} />
        </button>

        {isForgotPassword ? (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#121212]">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-2">{otpSent ? 'Enter the OTP and your new password.' : 'Enter your email to receive an OTP.'}</p>
            </div>
            {!otpSent ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                <div><label htmlFor="resetEmail" className={labelClass}>Email address</label><input id="resetEmail" type="email" placeholder="john@example.com" required className={inputClass} value={resetData.email} onChange={e => setResetData({...resetData, email: e.target.value})} /></div>
                <div className="pt-2"><button type="submit" className={btnPrimary}>Send OTP</button></div>
                <div className="text-center mt-4"><button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-bold text-gray-500 hover:text-[#0F172A] transition-colors">Back to Login</button></div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                <div><label className={labelClass}>Email address</label><input type="email" disabled className={`${inputClass} opacity-50 cursor-not-allowed`} value={resetData.email} /></div>
                <div><label className={labelClass}>6-Digit OTP</label><input type="text" required maxLength={6} className={`${inputClass} text-center tracking-[0.5em] font-bold text-lg`} value={resetData.otp} onChange={e => setResetData({...resetData, otp: e.target.value})} /></div>
                <div><label className={labelClass}>New Password</label><input type="password" required placeholder="••••••••" className={inputClass} value={resetData.newPassword} onChange={e => setResetData({...resetData, newPassword: e.target.value})} /></div>
                <div className="pt-2"><button type="submit" className={btnPrimary}>Reset Password</button></div>
                <div className="text-center mt-4"><button type="button" onClick={() => {setOtpSent(false); setIsForgotPassword(false);}} className="text-sm font-bold text-gray-500 hover:text-[#0F172A] transition-colors">Cancel</button></div>
              </form>
            )}
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#121212]">Welcome Back</h2>
              <p className="text-sm text-gray-500 mt-2">Please sign in to your account.</p>
            </div>

        <div className="space-y-4">
          <button type="button" onClick={handleGoogleLogin} className={socialBtn}>
            <FcGoogle className="mr-3" size={22} />
            Continue with Google
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
          <p className="text-xs text-center text-gray-400 uppercase font-medium tracking-wider">or sign in with email</p>
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={labelClass}>Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="john@example.com" required className={inputClass} value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className={labelClass}>Password</label>
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-semibold text-[#0F172A] hover:text-[#1E293B]">Forgot password?</button>
            </div>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required className={inputClass} value={formData.password} onChange={handleChange} />
          </div>
          
          <div className="pt-2">
            <button type="submit" className={btnPrimary} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <button type="button" onClick={() => { onClose(); setTimeout(() => document.getElementById('nav-signup-btn')?.click(), 100); }} className="font-bold text-[#0F172A] hover:text-[#1E293B] transition-colors">
            Sign up
            </button>
        </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
