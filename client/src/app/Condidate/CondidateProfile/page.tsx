'use client';

import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaEdit, FaSave, FaFileAlt, FaPen } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CandidateProfile = ({ user, setUser }: { user?: any, setUser?: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    skills: '',
    experience: '',
    education: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'Candidate Name',
        headline: user.headline || 'Add a professional headline',
        email: user.email || '',
        phone: user.phone || 'Add phone number',
        location: user.location || 'Add location',
        about: user.about || 'Write a brief summary about your professional background and career goals.',
        skills: user.skills || 'React, TypeScript, Node.js', // Dummy default if empty
        experience: user.experience || 'Not specified',
        education: user.education || 'Not specified'
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
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
      if (coverFile) {
        formDataToSend.append('coverImage', coverFile);
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
        toast.success("Profile saved successfully!");
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
        <div 
          className="h-32 md:h-48 bg-gradient-to-r from-[#0F172A] to-slate-700 relative bg-cover bg-center"
          style={{ backgroundImage: (coverPreviewUrl || user?.coverImage) ? `url(${coverPreviewUrl || user?.coverImage})` : undefined }}
        >
           {isEditing && (
             <div className="absolute bottom-4 right-6">
                 <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all shadow-sm">
                     <FaPen /> Edit Cover
                     <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                 </label>
             </div>
           )}
        </div>
        
        {/* Main Info */}
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 -mt-12 sm:-mt-16 gap-4">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1.5 shadow-lg relative flex-shrink-0 group">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-[#0F172A] overflow-hidden relative">
                   {previewUrl || user?.profilePicture ? (
                     <img src={previewUrl || user?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     formData.name?.charAt(0).toUpperCase() || 'U'
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
                <input name="name" value={formData.name} onChange={handleChange} className="text-2xl font-bold text-[#121212] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-full max-w-sm mb-2 outline-none focus:ring-2 focus:ring-[#0F172A]" placeholder="Your Name" />
             ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-[#121212]">{formData.name}</h1>
             )}
             
             {isEditing ? (
                <input name="headline" value={formData.headline} onChange={handleChange} className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-full max-w-md outline-none focus:ring-2 focus:ring-[#0F172A]" placeholder="Professional Headline" />
             ) : (
                <p className="text-gray-500 font-medium text-sm md:text-base">{formData.headline}</p>
             )}
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-6">
             <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex-1 sm:flex-none"><FaMapMarkerAlt className="text-[#0F172A] flex-shrink-0" /> {isEditing ? <input name="location" value={formData.location} onChange={handleChange} className="bg-transparent border-b border-gray-300 focus:outline-none w-full sm:w-24 md:w-32" /> : <span className="truncate">{formData.location}</span>}</div>
             <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex-1 sm:flex-none"><FaEnvelope className="text-[#0F172A] flex-shrink-0" /> {isEditing ? <input name="email" value={formData.email} onChange={handleChange} className="bg-transparent border-b border-gray-300 focus:outline-none w-full sm:w-32 md:w-48" /> : <span className="truncate">{formData.email}</span>}</div>
             <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex-1 sm:flex-none"><FaPhone className="text-[#0F172A] flex-shrink-0" /> {isEditing ? <input name="phone" value={formData.phone} onChange={handleChange} className="bg-transparent border-b border-gray-300 focus:outline-none w-full sm:w-28" /> : <span className="truncate">{formData.phone}</span>}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-[#121212] mb-4 flex items-center gap-2"><FaUserCircle className="text-gray-400"/> About Me</h3>
             {isEditing ? (
                <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className={inputClass} placeholder="Tell companies about yourself..." />
             ) : (
                <p className="text-gray-600 leading-relaxed text-sm">{formData.about}</p>
             )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-[#121212] mb-6 flex items-center gap-2"><FaBriefcase className="text-gray-400"/> Professional Details</h3>
             <div className="space-y-6">
               <div>
                 <label className={labelClass}>Experience Level</label>
                 {isEditing ? (
                   <select name="experience" value={formData.experience} onChange={handleChange} className={inputClass}>
                     <option value="Entry Level">Entry Level</option>
                     <option value="Mid Level">Mid Level</option>
                     <option value="Senior Level">Senior Level</option>
                     <option value="Executive">Executive</option>
                   </select>
                 ) : (
                   <p className="text-[#121212] font-medium text-sm">{formData.experience}</p>
                 )}
               </div>
               <div>
                 <label className={labelClass}>Education</label>
                 {isEditing ? (
                   <input name="education" value={formData.education} onChange={handleChange} className={inputClass} placeholder="e.g., B.S. Computer Science" />
                 ) : (
                   <p className="text-[#121212] font-medium text-sm">{formData.education}</p>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-[#121212] mb-4 flex items-center gap-2"><FaGraduationCap className="text-gray-400"/> Skills</h3>
             {isEditing ? (
                <textarea name="skills" value={formData.skills} onChange={handleChange} rows={3} placeholder="React, Node.js, Design..." className={inputClass} />
             ) : (
                <div className="flex flex-wrap gap-2">
                   {formData.skills ? formData.skills.split(',').map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">{skill.trim()}</span>
                   )) : <span className="text-sm text-gray-500">No skills added yet.</span>}
                </div>
             )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-[#121212] mb-4 flex items-center gap-2"><FaFileAlt className="text-gray-400"/> Resume</h3>
             <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <FaFileAlt className="text-3xl text-gray-300 mx-auto mb-3 group-hover:text-[#0F172A] transition-colors" />
                <p className="text-sm font-bold text-[#121212] mb-1 truncate">My_Resume.pdf</p>
                <p className="text-xs text-gray-500 mb-4">Updated 2 days ago</p>
                <button className="text-xs font-bold text-[#0F172A] hover:underline">Replace Resume</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
