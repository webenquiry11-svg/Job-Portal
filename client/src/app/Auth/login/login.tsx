'use client';

import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft, FaTimes } from 'react-icons/fa';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      localStorage.setItem('profile', JSON.stringify({ ...result }));
      toast.success('Login successful! Welcome back.');
      console.log('Login success:', result);
      setTimeout(() => {
        onClose();
        if (result?.result?.role === 'employer') {
          router.push('/employer/dashboard');
        } else {
          router.push('/Condidate/Dashboard');
        } 
      }, 1500);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error?.data?.message || error?.error || 'Invalid credentials');
    }
  };

  // Common Styles matching register.tsx
  const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const btnPrimary = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-slate-900/20 text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";
  const socialBtn = "w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors z-10">
          <FaTimes size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#121212]">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-2">Please sign in to your account.</p>
        </div>

        <div className="space-y-4">
          <button className={socialBtn}>
            <FcGoogle className="mr-3" size={22} />
            Sign in with Google
          </button>
          <button className={socialBtn}>
            <FaMicrosoft className="mr-3 text-blue-600" size={22} />
            Sign in with Microsoft
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
                <a href="#" className="text-xs font-semibold text-[#0F172A] hover:text-[#1E293B]">Forgot password?</a>
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
            <button className="font-bold text-[#0F172A] hover:text-[#1E293B] transition-colors">
            Sign up
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
