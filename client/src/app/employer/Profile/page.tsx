'use client';

import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaEdit, FaSave, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CompanyProfile = ({ user, setUser }: { user?: any, setUser?: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    companySize: '',
    website: '',
    yourRole: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || user.name || 'Company Name',
        industry: user.industry || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        description: user.description || 'Write a brief summary about your company.',
        companySize: user.companySize || '1-10 employees',
        website: user.website || '',
        yourRole: user.yourRole || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      if (!user?._id) {
        toast.error("Error: User ID is missing. Please try logging in again.");
        setIsSaving(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('_id', user?._id);
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      if (profileFile) {
        formDataToSend.append('profilePicture', profileFile);
      }

      const response = await fetch(`${API_URL}/auth/update`, {
        method: 'PATCH',
        body: formDataToSend,
      });
      const dataRes = await response.json();
      if (response.ok) {
        setIsEditing(false);
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        localStorage.setItem('profile', JSON.stringify({ ...profile, result: dataRes.result, token: dataRes.token || profile.token }));
        if (setUser) setUser(dataRes.result);
        toast.success("Company profile saved successfully!");
      } else {
        console.error("Backend Error:", dataRes);
        toast.error(`Upload Failed: ${dataRes.message}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-[#0F172A] to-[#1E293B] relative"></div>
        
        {/* Main Info */}
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 -mt-12 sm:-mt-16 gap-4">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1.5 shadow-lg relative flex-shrink-0 group">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-[#0F172A] overflow-hidden relative">
                   {previewUrl || user?.profilePicture ? (
                     <img src={previewUrl || user?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     formData.companyName?.charAt(0).toUpperCase() || 'C'
                   )}
                   {isEditing && (
                     <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <FaEdit className="text-white text-xl md:text-2xl mb-1" />
                       <span className="text-white text-[10px] md:text-xs font-medium">Change</span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                     </label>
                   )}
                </div>
             </div>
             <button 
                onClick={() => isEditing && !isSaving ? handleSave() : (!isSaving && setIsEditing(true))} 
                disabled={isSaving}
                className={`px-6 py-2.5 bg-[#0F172A] text-white text-sm font-bold rounded-full hover:bg-[#1E293B] shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 self-start sm:self-auto ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {isEditing ? <><FaSave /> {isSaving ? 'Saving...' : 'Save Profile'}</> : <><FaEdit /> Edit Profile</>}
             </button>
          </div>

          <div className="space-y-1">
             {isEditing ? (
                <input name="companyName" value={formData.companyName} onChange={handleChange} className="text-2xl font-bold text-[#121212] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-full max-w-sm mb-2 outline-none focus:ring-2 focus:ring-[#0F172A]" placeholder="Company Name" />
             ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-[#121212]">{formData.companyName}</h1>
             )}
             
             {isEditing ? (
                <input name="industry" value={formData.industry} onChange={handleChange} className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-full max-w-md outline-none focus:ring-2 focus:ring-[#0F172A]" placeholder="Industry (e.g. Technology)" />
             ) : (
                <p className="text-gray-500 font-medium text-sm md:text-base">{formData.industry || 'Update your industry'}</p>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-[#121212] mb-4 flex items-center gap-2"><FaBuilding className="text-gray-400"/> About Company</h3>
             {isEditing ? (
                <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className={inputClass} placeholder="Tell candidates about your company culture and goals..." />
             ) : (
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{formData.description}</p>
             )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-[#121212] mb-6 flex items-center gap-2"><FaUserCircle className="text-gray-400"/> Details</h3>
             <div className="space-y-4">
               <div><label className={labelClass}>Company Size</label>{isEditing ? <select name="companySize" value={formData.companySize} onChange={handleChange} className={inputClass}><option>1-10 employees</option><option>11-50 employees</option><option>51-200 employees</option><option>201-500 employees</option><option>501+ employees</option></select> : <p className="text-[#121212] font-medium text-sm">{formData.companySize}</p>}</div>
               <div><label className={labelClass}>Website</label>{isEditing ? <input name="website" value={formData.website} onChange={handleChange} className={inputClass} placeholder="https://..." /> : <p className="text-[#121212] font-medium text-sm">{formData.website || 'N/A'}</p>}</div>
               <div><label className={labelClass}>Location</label>{isEditing ? <input name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="City, Country" /> : <p className="text-[#121212] font-medium text-sm">{formData.location || 'N/A'}</p>}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;