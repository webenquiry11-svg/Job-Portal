'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaEnvelope, FaUserShield, FaArrowLeft, FaKey } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const router = useRouter();
  
  // UI State
  const [view, setView] = useState<'login' | 'forgotMenu' | 'otp' | 'update'>('login');
  const [forgotType, setForgotType] = useState<'email' | 'password' | null>(null);
  
  // Data State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Persisted Admin Credentials
  const [adminCreds, setAdminCreds] = useState({
    email: 'ayushsharma.starpublicity@gmail.com',
    password: 'Admin@123'
  });

  useEffect(() => {
    const stored = localStorage.getItem('adminCredentials');
    if (stored) {
      setAdminCreds(JSON.parse(stored));
    } else {
      localStorage.setItem('adminCredentials', JSON.stringify({
        email: 'ayushsharma.starpublicity@gmail.com',
        password: 'Admin@123'
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (formData.email === adminCreds.email && formData.password === adminCreds.password) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        toast.success('Admin login successful!');
        router.push('/Admin/Dashboard'); 
      } else {
        toast.error('Invalid admin credentials.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRequestOtp = async (type: 'email' | 'password') => {
    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/auth/admin/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminCreds.email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForgotType(type);
        setView('otp');
        toast.success(`Verification code sent to ${adminCreds.email}`);
      } else {
        toast.error(data.message || data.error || 'Failed to send verification code.');
      }
    } catch (err) { toast.error('Server error.'); } 
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/auth/admin/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminCreds.email, otp })
      });
      if (res.ok) {
        setView('update');
        toast.success('Identity verified!');
      } else {
        toast.error('Invalid verification code.');
      }
    } catch (err) { toast.error('Server error.'); } 
    finally { setIsLoading(false); }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCreds = { ...adminCreds };
    if (forgotType === 'email') updatedCreds.email = newValue;
    if (forgotType === 'password') updatedCreds.password = newValue;

    setAdminCreds(updatedCreds);
    localStorage.setItem('adminCredentials', JSON.stringify(updatedCreds));

    toast.success(`Admin ${forgotType} updated successfully!`);
    setView('login');
    setNewValue('');
    setOtp('');
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative animate-fade-in-up">
        
        {view !== 'login' && (
          <button onClick={() => setView('login')} className="absolute top-6 left-6 text-gray-400 hover:text-[#0F172A] transition-colors">
            <FaArrowLeft size={18} />
          </button>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
            <FaUserShield className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-[#121212]">
            {view === 'login' && 'Admin Portal'}
            {view === 'forgotMenu' && 'Account Recovery'}
            {view === 'otp' && 'Security Verification'}
            {view === 'update' && `Update ${forgotType === 'email' ? 'Email' : 'Password'}`}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {view === 'login' && 'Sign in to access the administrator dashboard.'}
            {view === 'forgotMenu' && 'What would you like to update?'}
            {view === 'otp' && 'Enter the 6-digit code sent to your email.'}
            {view === 'update' && `Enter your new admin ${forgotType}.`}
          </p>
        </div>

        {view === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#0F172A] transition-colors" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="admin@domain.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#0F172A] transition-colors" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="••••••••" />
              </div>
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full mt-6 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 text-sm disabled:opacity-70 flex justify-center items-center">
              {isLoading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>

            <div className="text-center mt-6">
              <button type="button" onClick={() => setView('forgotMenu')} className="text-sm font-bold text-gray-500 hover:text-[#0F172A] transition-colors underline-offset-4 hover:underline">
                Forgot Anything?
              </button>
            </div>
          </form>
        )}

        {view === 'forgotMenu' && (
          <div className="space-y-4">
             <button onClick={() => handleRequestOtp('email')} disabled={isLoading} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-[#0F172A] hover:bg-slate-50 transition-all group text-left">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-[#0F172A] mr-4"><FaEnvelope /></div>
                <div>
                  <h4 className="font-bold text-[#121212]">Change Email</h4>
                  <p className="text-xs text-gray-500">Update your primary admin email</p>
                </div>
             </button>
             <button onClick={() => handleRequestOtp('password')} disabled={isLoading} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-[#0F172A] hover:bg-slate-50 transition-all group text-left">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-[#0F172A] mr-4"><FaKey /></div>
                <div>
                  <h4 className="font-bold text-[#121212]">Forgot Password</h4>
                  <p className="text-xs text-gray-500">Reset your admin password</p>
                </div>
             </button>
          </div>
        )}

        {view === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A] text-center tracking-[0.5em] font-bold text-2xl" placeholder="••••••" />
            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] transition-all shadow-lg text-sm">
               {isLoading ? 'Verifying...' : 'Verify Identity'}
            </button>
          </form>
        )}

        {view === 'update' && (
          <form onSubmit={handleUpdate} className="space-y-6">
            <input type={forgotType === 'email' ? 'email' : 'text'} value={newValue} onChange={(e) => setNewValue(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A] text-sm font-medium" placeholder={`Enter new ${forgotType}`} />
            <button type="submit" className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 text-sm">
               Save Changes
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default AdminLogin;