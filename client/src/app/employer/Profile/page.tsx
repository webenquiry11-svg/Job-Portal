'use client';

import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaUsers, FaEnvelope, FaPhone, FaCamera, FaPen, FaSave, FaCheckCircle, FaEye, FaEdit, FaPlus, FaTrash, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { useUpdateProfileMutation } from '@/features/authApi';
import toast from 'react-hot-toast';

const CompanyProfile = ({ user, setUser }: { user: any, setUser: any }) => {
  const [isPublicView, setIsPublicView] = useState(true);
  const [formData, setFormData] = useState({
    gstNumber: user?.gstNumber || '',
    companyName: user?.companyName || '',
    website: user?.website || '',
    tagline: user?.tagline || '',
    specialties: user?.specialties || '',
    location: user?.location || '',
    companySize: user?.companySize || '1-10 employees',
    industry: user?.industry || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gstVerificationStatus: user?.gstVerificationStatus || 'none',
    description: user?.description || '',
    followers: user?.followers || '789K',
    commitments: user?.commitments || [
        { title: 'Career growth and learning', desc: 'There is no one-size-fits-all career path: here everyone is empowered to own their growth journey. Our team comes from a variety of traditional and non-traditional tech backgrounds including career changers...' },
        { title: 'Diversity, equity, and inclusion', desc: 'We aspire to be an employer of choice for all and diversity helps power our collective impact.' },
        { title: 'Social impact', desc: 'Technologists have a unique role to play in advocating for how technology should benefit the common good.' }
    ],
  });

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [successMessage, setSuccessMessage] = useState('');
  const [requestGstVerification, { isLoading: isGstRequesting }] = useUpdateProfileMutation(); // Reusing updateProfile for now, will create a dedicated mutation later
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCommitmentChange = (index: number, field: string, value: string) => {
    const updatedCommitments = [...formData.commitments];
    updatedCommitments[index] = { ...updatedCommitments[index], [field]: value };
    setFormData({ ...formData, commitments: updatedCommitments });
  };

  const addCommitment = () => {
    setFormData({
      ...formData,
      commitments: [...formData.commitments, { title: '', desc: '' }]
    });
  };

  const removeCommitment = (index: number) => {
    const updatedCommitments = formData.commitments.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, commitments: updatedCommitments });
  };

  const handleRequestGSTVerification = async () => {
    if (!formData.gstNumber) {
      return toast.error("Please enter a GST Number before verifying.");
    }
    try {
      // Assuming you have a specific mutation for this, or reuse updateProfile for now
      const result = await requestGstVerification({ _id: user._id, gstNumber: formData.gstNumber, gstVerificationStatus: 'pending' }).unwrap();
      setUser(result.result); // Update local user state with new status
      toast.success("GST verification request sent successfully!");
    } catch (error) {
      console.error("Failed to request GST verification:", error);
      toast.error("Failed to send GST verification request.");
    }
  };
  const handleSubmit = async () => {
    try {
      const result = await updateProfile({ ...formData, _id: user._id }).unwrap();
      
      // Update local storage and parent state
      const updatedProfile = { result: result.result, token: result.token };
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      setUser(result.result);
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (isPublicView) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
        {/* Banner & Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 group">
          <div className="h-48 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-8 pb-8 pt-16 relative">
              <div className="absolute -top-12 left-8 p-1.5 bg-white rounded-2xl shadow-lg">
                  <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center text-4xl font-bold text-[#0F172A] relative overflow-hidden border border-gray-100">
                    {formData.companyName.charAt(0).toUpperCase()}
                  </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-4 ml-0 md:ml-36 mt-2 md:mt-0">
                  <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-[#121212]">{formData.companyName || 'Your Company Name'}</h1>
                      <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{formData.tagline || 'Global tech consultancy blending design, engineering and AI to help businesses thrive through innovation.'}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium pt-2">
                          <span>{formData.industry || 'Information Technology & Services'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{formData.location || 'San Francisco, CA'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{formData.followers} followers</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{formData.companySize}</span>
                      </div>
                      {formData.gstVerificationStatus === 'approved' && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-bold mt-3">
                          <FaCheckCircle /> Verified Account
                        </div>
                      )}
                  </div>
                  <button 
                      onClick={() => setIsPublicView(false)}
                      className="px-6 py-2.5 bg-[#121212] hover:bg-black text-white font-bold rounded-full transition-all shadow-lg shadow-slate-900/20 text-sm flex items-center gap-2 shrink-0"
                  >
                      <FaEdit /> Edit Profile
                  </button>
              </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="px-8 border-t border-gray-100 flex items-center gap-8 overflow-x-auto">
            {['Home', 'About', 'Posts', 'Jobs', 'Life', 'People'].map((tab, i) => (
                <button key={tab} className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${i === 1 ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-gray-500 hover:text-[#121212]'}`}>
                    {tab}
                </button>
            ))}
          </div>
        </div>

        {/* Public View Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* About / Overview */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-[#121212] mb-4">Overview</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {formData.description || 'We are a global technology consultancy that delivers extraordinary impact by blending design, engineering and AI expertise.\n\nFor 30 years, our commitment to design-led thinking, engineering excellence and innovation means we prioritize people, build teams with strong technical foundations and embed AI into every step of the process – not just as a tool but as a mindset.'}
                    </p>
                </div>

                {/* Commitments Section (Mocked based on request) */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-[#121212] mb-6">Commitments</h3>
                    <div className="space-y-6">
                        {formData.commitments.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-[#0F172A]">
                                    <FaBuilding />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#121212] text-base">{item.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Details Column */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="space-y-5">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Website</h4>
                            <a href={formData.website} target="_blank" className="text-[#0F172A] font-semibold hover:underline text-sm truncate block">{formData.website || 'http://www.thoughtworks.com'}</a>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Industry</h4>
                            <p className="text-[#121212] font-semibold text-sm">{formData.industry || 'Information Technology & Services'}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Company Size</h4>
                            <p className="text-[#121212] font-semibold text-sm">{formData.companySize}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Headquarters</h4>
                            <p className="text-[#121212] font-semibold text-sm">{formData.location}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Specialties</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {formData.specialties || 'Agile Development, Management Consulting, Data Science, Product Innovation, Customer Experience'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      {/* Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 group">
        <div className="h-48 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute bottom-4 right-6">
                <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all">
                    <FaPen /> Edit Cover
                </button>
            </div>
        </div>
        
        <div className="px-8 pb-8 pt-16 relative">
            <div className="absolute -top-16 left-8 p-1.5 bg-white rounded-3xl shadow-lg">
                <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl font-bold text-[#0F172A] relative overflow-hidden group/avatar cursor-pointer">
                {formData.companyName.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl mb-1" />
                        <span className="text-white text-[10px] font-bold">Change Logo</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 ml-36 md:ml-36">
                <div>
                    <h1 className="text-3xl font-bold text-[#121212]">{formData.companyName || 'Your Company Name'}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed mt-1">{formData.tagline || 'Add a tagline to describe your company'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><FaBuilding className="text-[#0F172A]" /> {formData.industry || 'Tech Industry'}</span>
                        <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-[#0F172A]" /> {formData.location || 'Location'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {successMessage && (
                        <span className="text-green-600 text-sm font-bold flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg animate-fade-in-up">
                            <FaCheckCircle /> Saved
                        </span>
                    )}
                    <button 
                        onClick={() => setIsPublicView(true)}
                        className="px-4 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl transition-all text-sm flex items-center gap-2 hover:bg-slate-50 hover:text-[#121212]"
                    >
                        <FaEye /> View as Public
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isLoading ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#121212] mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#0F172A] rounded-full"></span>
                    Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
                        <div className="relative">
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="e.g. TechCorp" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tagline</label>
                        <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="e.g. Global tech consultancy..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website</label>
                        <div className="relative group">
                            <FaGlobe className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#0F172A] transition-colors" />
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="https://..." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</label>
                        <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="e.g. Software Development" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Size</label>
                        <div className="relative group">
                            <FaUsers className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#0F172A] transition-colors" />
                            <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium appearance-none cursor-pointer">
                                <option>1-10 employees</option>
                                <option>11-50 employees</option>
                                <option>51-200 employees</option>
                                <option>201-500 employees</option>
                                <option>501+ employees</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Followers Count</label>
                        <input type="text" name="followers" value={formData.followers} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium" placeholder="e.g. 10K" />
                    </div>
                </div>
                
                <div className="mt-6 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">About Company</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium resize-none min-h-[150px]" placeholder="Tell potential candidates about your mission, vision, and culture..."></textarea>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Specialties</label>
                    <textarea name="specialties" value={formData.specialties} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 focus:border-[#0F172A] transition-all text-sm font-medium resize-none min-h-[100px]" placeholder="e.g. Agile Development, AI, Cloud Computing..."></textarea>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Commitments</label>
                        <button onClick={addCommitment} className="text-xs font-bold text-[#0F172A] hover:text-[#1E293B] flex items-center gap-1">
                            <FaPlus size={10} /> Add New
                        </button>
                    </div>
                    <div className="space-y-6">
                        {formData.commitments.map((item: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                <button onClick={() => removeCommitment(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaTrash size={12} />
                                </button>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                                        <input type="text" value={item.title} onChange={(e) => handleCommitmentChange(index, 'title', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 text-sm" placeholder="Commitment Title" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                                        <textarea value={item.desc} onChange={(e) => handleCommitmentChange(index, 'desc', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/50 text-sm resize-none min-h-[80px]" placeholder="Description"></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Contact */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full">
                <h3 className="text-lg font-bold text-[#121212] mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#FACC15] rounded-full"></span>
                    Contact Details
                </h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                            <FaEnvelope className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#FACC15] transition-colors" />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="contact@company.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                        <div className="relative group">
                            <FaPhone className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#FACC15] transition-colors" />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                        <div className="relative group">
                            <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#FACC15] transition-colors" />
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="San Francisco, CA" />
                        </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">GST Number</label>
                      <div className="flex items-center gap-3">
                          <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="Enter GST Number" />
                          {formData.gstVerificationStatus === 'none' && (
                            <button onClick={handleRequestGSTVerification} disabled={isGstRequesting} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                              {isGstRequesting ? 'Requesting...' : 'Verify'}
                            </button>
                          )}
                          {formData.gstVerificationStatus === 'pending' && (
                            <span className="px-3 py-2 bg-amber-50 text-amber-600 text-sm font-bold rounded-xl flex items-center gap-2">
                              <FaHourglassHalf /> Pending
                            </span>
                          )}
                          {formData.gstVerificationStatus === 'approved' && (
                            <span className="px-3 py-2 bg-green-50 text-green-600 text-sm font-bold rounded-xl flex items-center gap-2">
                              <FaCheckCircle /> Verified
                            </span>
                          )}
                          {formData.gstVerificationStatus === 'rejected' && (
                            <span className="px-3 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                              <FaTimesCircle /> Rejected
                            </span>
                          )}
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
