'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaUsers, FaEnvelope, FaPhone, FaCamera, FaPen, FaSave, FaCheckCircle, FaEye, FaEdit, FaPlus, FaTrash, FaHourglassHalf, FaTimesCircle, FaSpinner, FaBriefcase, FaTimes, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useUpdateProfileMutation } from '@/features/authApi';
import { useGetCompanyByIdQuery, useGetJobsByEmployerQuery } from '@/features/jobapi';
import { useGetMessagesQuery, useSendMessageMutation, useMarkAsSeenMutation } from '@/features/chatApi';
import toast from 'react-hot-toast';

const CompanyProfile = ({ user, setUser }: { user: any, setUser: any }) => {
  const [isPublicView, setIsPublicView] = useState(false);
  const [activePublicTab, setActivePublicTab] = useState('About');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [chatUser, setChatUser] = useState<any>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
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
    commitments: user?.commitments || [
        { title: 'Career growth and learning', desc: 'There is no one-size-fits-all career path: here everyone is empowered to own their growth journey. Our team comes from a variety of traditional and non-traditional tech backgrounds including career changers...' },
        { title: 'Diversity, equity, and inclusion', desc: 'We aspire to be an employer of choice for all and diversity helps power our collective impact.' },
        { title: 'Social impact', desc: 'Technologists have a unique role to play in advocating for how technology should benefit the common good.' }
    ],
  });

  const { data: companyData } = useGetCompanyByIdQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const { data: jobs = [], isLoading: isLoadingJobs } = useGetJobsByEmployerQuery(user?._id, { skip: !user?._id });
  const profileViews = companyData?.profileViews ?? user?.profileViews ?? 0;

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [successMessage, setSuccessMessage] = useState('');
  const [requestGstVerification, { isLoading: isGstRequesting }] = useUpdateProfileMutation(); // Reusing updateProfile for now, will create a dedicated mutation later
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

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
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
      let result;
      if (profileFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('_id', user._id);
        formDataToSend.append('profilePicture', profileFile);
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'commitments') {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, String(value));
          }
        });
        result = await updateProfile(formDataToSend).unwrap();
      } else {
        result = await updateProfile({ ...formData, _id: user._id }).unwrap();
      }
      
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
          <div className="h-48 bg-gradient-to-r from-[#0B0C10] via-[#1F2833] to-[#2A3441] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-8 pb-8 pt-16 relative">
              <div className="absolute -top-12 left-8 p-1.5 bg-white rounded-2xl shadow-lg">
                  <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center text-4xl font-bold text-[#0B0C10] relative overflow-hidden border border-gray-100">
                    {previewUrl || user?.profilePicture ? (
                        <img src={previewUrl || getImageUrl(user?.profilePicture)} alt="Profile" className="w-full h-full object-contain bg-white" />
                    ) : (
                        formData.companyName.charAt(0).toUpperCase() || 'C'
                    )}
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
                          <span>{companyData?.followersCount || 0} followers</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{profileViews} Views</span>
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
                          className="w-full lg:w-auto justify-center px-6 py-2.5 bg-[#0B0C10] hover:bg-[#1F2833] text-[#FACC15] font-bold rounded-full transition-all shadow-lg shadow-black/20 text-sm flex items-center gap-2 shrink-0"
                  >
                      <FaEdit /> Edit Profile
                  </button>
              </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 border-t border-gray-100 flex items-center gap-8 overflow-x-auto">
            {['About', 'Jobs', 'People'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActivePublicTab(tab)}
                  className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activePublicTab === tab ? 'border-[#FACC15] text-[#0B0C10]' : 'border-transparent text-gray-500 hover:text-[#0B0C10]'}`}
                >
                    {tab}
                </button>
            ))}
          </div>
        </div>

        {/* Public View Content */}
        <div className={`grid grid-cols-1 ${activePublicTab === 'About' ? 'lg:grid-cols-3' : ''} gap-8`}>
            {/* Main Content Column */}
            <div className={`${activePublicTab === 'About' ? 'lg:col-span-2' : ''} space-y-6`}>
                {activePublicTab === 'About' && (
                  <>
                    {/* About / Overview */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-[#121212] mb-4">Overview</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {formData.description || 'We are a global technology consultancy that delivers extraordinary impact by blending design, engineering and AI expertise.\n\nFor 30 years, our commitment to design-led thinking, engineering excellence and innovation means we prioritize people, build teams with strong technical foundations and embed AI into every step of the process – not just as a tool but as a mindset.'}
                        </p>
                    </div>

                    {/* Commitments Section */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-[#121212] mb-6">Commitments</h3>
                        <div className="space-y-6">
                            {formData.commitments.map((item: any, i: number) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-[#0B0C10]">
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
                  </>
                )}

                {activePublicTab === 'Jobs' && (
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold text-[#121212] mb-6">Open Positions ({jobs.length})</h3>
                      {isLoadingJobs ? (
                        <div className="flex items-center justify-center py-8">
                          <FaSpinner className="animate-spin text-2xl text-gray-300" />
                        </div>
                      ) : jobs.length > 0 ? (
                        <div className="space-y-4">
                          {jobs.map((job: any) => (
                            <div key={job._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-[#121212]">{job.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{job.location} • {job.workMode} • ${job.salaryMin}-${job.salaryMax}</p>
                              </div>
                              <button 
                                onClick={() => setSelectedJob(job)}
                                className="px-5 py-2 bg-white border border-gray-200 text-[#0B0C10] text-sm font-bold rounded-xl hover:bg-[#FACC15] hover:border-[#FACC15] shadow-sm transition-colors whitespace-nowrap"
                              >
                                View Details
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No open positions at the moment.</p>
                      )}
                  </div>
                )}

                {activePublicTab === 'People' && (
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold text-[#121212] mb-6">People Also Following</h3>
                      {companyData?.sampleFollowers && companyData.sampleFollowers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {companyData.sampleFollowers.map((follower: any) => (
                            <div key={follower._id} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#0B0C10] overflow-hidden flex-shrink-0">
                                {follower.profilePicture ? (
                              <img src={getImageUrl(follower.profilePicture)} alt={follower.name} className="w-full h-full object-contain bg-white" />
                                ) : (
                                  follower.name?.charAt(0).toUpperCase() || 'U'
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-[#121212] text-sm truncate">{follower.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{follower.headline || 'Job Seeker'}</p>
                              </div>
                              <button onClick={() => setChatUser(follower)} className="px-4 py-2 bg-[#0B0C10] text-[#FACC15] rounded-xl text-xs font-bold hover:bg-[#1F2833] shadow-md shadow-black/10 transition-all">
                                Message
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No followers yet.</p>
                      )}
                  </div>
                )}
            </div>

            {/* Sidebar Details Column */}
            {activePublicTab === 'About' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="space-y-5">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Website</h4>
                            <a href={formData.website} target="_blank" className="text-[#0B0C10] font-semibold hover:text-[#EAB308] hover:underline text-sm truncate block">{formData.website || 'http://www.thoughtworks.com'}</a>
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
            )}
        </div>
        {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      {/* Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 group">
        <div className="h-48 bg-gradient-to-r from-[#0B0C10] via-[#1F2833] to-[#2A3441] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute bottom-4 right-6">
                <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all">
                    <FaPen /> Edit Cover
                </button>
            </div>
        </div>
        
        <div className="px-6 sm:px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-end">
                <div className="p-1.5 bg-white rounded-3xl shadow-lg -mt-12 sm:-mt-16 flex-shrink-0 z-10">
                    <div onClick={() => profileInputRef.current?.click()} className="w-24 h-24 sm:w-32 sm:h-32 bg-[#0B0C10] rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold text-[#FACC15] relative overflow-hidden group/avatar cursor-pointer border-4 border-white shadow-xl bg-white">
                    {previewUrl || user?.profilePicture ? (
                        <img src={previewUrl || getImageUrl(user?.profilePicture)} alt="Profile" className="w-full h-full object-contain p-1" />
                    ) : (
                        formData.companyName.charAt(0).toUpperCase() || 'C'
                    )}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <FaCamera className="text-white text-2xl mb-1" />
                            <span className="text-white text-[10px] font-bold">Change Logo</span>
                        </div>
                        <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                </div>

                <div className="flex-1 w-full pt-2 md:pt-0 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#121212]">{formData.companyName || 'Your Company Name'}</h1>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed mt-1">{formData.tagline || 'Add a tagline to describe your company'}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md"><FaBuilding className="text-[#0B0C10]" /> {formData.industry || 'Tech Industry'}</span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md"><FaMapMarkerAlt className="text-[#0B0C10]" /> {formData.location || 'Location'}</span>
                            {companyData && <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md"><FaUsers className="text-[#0B0C10]" /> {companyData?.followersCount || 0} Followers</span>}
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md"><FaEye className="text-[#0B0C10]" /> {profileViews} Views</span>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 w-full xl:w-auto mt-2 sm:mt-0">
                        {successMessage && (
                            <span className="text-green-600 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 bg-green-50 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg animate-fade-in-up whitespace-nowrap">
                                <FaCheckCircle className="shrink-0" /> <span className="hidden sm:inline">Saved</span>
                            </span>
                        )}
                        <button 
                            onClick={() => setIsPublicView(true)}
                            title="View as Public"
                            className="flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl transition-all text-sm flex items-center gap-1.5 sm:gap-2 hover:bg-slate-50 hover:text-[#0B0C10]"
                        >
                            <FaEye className="text-lg sm:text-base shrink-0" /> 
                            <span className="hidden lg:inline whitespace-nowrap">View as Public</span>
                            <span className="hidden sm:inline lg:hidden whitespace-nowrap">Public</span>
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isLoading}
                            title="Save Changes"
                            className="flex-1 sm:flex-none justify-center px-3 sm:px-6 py-2.5 sm:py-3 bg-[#FACC15] hover:bg-[#EAB308] text-[#0B0C10] font-bold rounded-xl transition-all shadow-lg shadow-[#FACC15]/20 text-sm flex items-center gap-1.5 sm:gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isLoading ? <FaSpinner className="animate-spin text-lg sm:text-base shrink-0" /> : <FaSave className="text-lg sm:text-base shrink-0" />}
                            <span className="hidden lg:inline whitespace-nowrap">{isLoading ? 'Saving...' : 'Save Changes'}</span>
                            <span className="hidden sm:inline lg:hidden whitespace-nowrap">{isLoading ? 'Saving...' : 'Save'}</span>
                        </button>
                    </div>
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
                    <span className="w-1 h-6 bg-[#0B0C10] rounded-full"></span>
                    Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
                        <div className="relative">
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="e.g. TechCorp" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tagline</label>
                        <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="e.g. Global tech consultancy..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website</label>
                        <div className="relative group">
                            <FaGlobe className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#0B0C10] transition-colors" />
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="https://..." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</label>
                        <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="e.g. Software Development" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Size</label>
                        <div className="relative group">
                            <FaUsers className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#0B0C10] transition-colors" />
                            <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium appearance-none cursor-pointer">
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
                        <input type="text" name="followers" value={companyData?.followersCount || '0'} readOnly className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium" placeholder="e.g. 10K" />
                    </div>
                </div>
                
                <div className="mt-6 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">About Company</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium resize-none min-h-[150px]" placeholder="Tell potential candidates about your mission, vision, and culture..."></textarea>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Specialties</label>
                    <textarea name="specialties" value={formData.specialties} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-[#FACC15] transition-all text-sm font-medium resize-none min-h-[100px]" placeholder="e.g. Agile Development, Data Science..."></textarea>
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
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
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
                            <button onClick={handleRequestGSTVerification} disabled={isGstRequesting} className="px-4 py-2 bg-[#FACC15] text-[#0B0C10] text-sm font-bold rounded-xl hover:bg-[#EAB308] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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

            {companyData?.sampleFollowers && companyData.sampleFollowers.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Recent Followers</h4>
                <div className="space-y-4">
                  {companyData.sampleFollowers.map((follower: any) => (
                    <div key={follower._id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#0F172A] overflow-hidden flex-shrink-0">
                        {follower.profilePicture ? (
                      <img src={getImageUrl(follower.profilePicture)} alt={follower.name} className="w-full h-full object-contain bg-white" />
                        ) : (
                          follower.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[#121212] text-sm truncate">{follower.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{follower.headline || 'Job Seeker'}</p>
                      </div>
                      <button onClick={() => setChatUser(follower)} className="px-3 py-1.5 bg-[#0B0C10] text-[#FACC15] rounded-lg text-xs font-bold hover:bg-[#1F2833] transition-colors">
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
      {chatUser && <ChatBox currentUser={user} otherUser={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
}

const JobDetailsModal = ({ job, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        <div className="p-6 md:px-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-bold text-[#121212] flex items-center gap-3">
            <div className="bg-[#FACC15] p-2 rounded-xl shadow-md">
              <FaBriefcase className="text-[#0B0C10] text-sm" />
            </div>
            Job Details Preview
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar hide-scrollbar flex-1 bg-white">
          <h3 className="text-3xl font-bold text-[#0B0C10]">{job.title}</h3>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
            <span className="text-gray-700">{job.employerId?.companyName || job.employerId?.name || 'Company'}</span> • <span>{job.workMode}</span> • <span>{job.location}</span>
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {job.skills && job.skills.length > 0 ? job.skills.map((s: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-[#121212]">{s}</span>
            )) : <span className="text-sm text-gray-400 italic">No skills specified</span>}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Experience</p>
              <p className="font-bold text-[#121212] text-base">{job.experience || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Salary ({job.salaryType})</p>
              <p className="font-bold text-[#121212] text-base">${job.salaryMin || '0'} - ${job.salaryMax || '0'}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">Job Description</p>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
          </div>
          
          {job.screeningQuestion && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Screening Question</p>
              <p className="font-semibold text-[#121212] text-sm">{job.screeningQuestion}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-3xl">
          <button onClick={onClose} className="px-8 py-3 bg-[#0B0C10] text-[#FACC15] font-black rounded-xl hover:bg-[#1F2833] shadow-lg shadow-black/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
             Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};

const ChatBox = ({ currentUser, otherUser, onClose }: any) => {
  const [messageText, setMessageText] = useState('');
  const { data: messages = [] } = useGetMessagesQuery(
    { user1: currentUser._id, user2: otherUser._id },
    { pollingInterval: 3000, skip: !otherUser._id }
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();  const [markAsSeen] = useMarkAsSeenMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;    
    try {
      await sendMessage({ senderId: currentUser._id, receiverId: otherUser._id, message: messageText }).unwrap();
      setMessageText('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    if (otherUser && currentUser?._id && messages.length > 0) {
      const hasUnread = messages.some((msg: any) => String(msg.senderId) === String(otherUser._id) && !msg.seen);
      if (hasUnread) {
        markAsSeen({ senderId: otherUser._id, receiverId: currentUser._id });
      }
    }
  }, [otherUser, currentUser, messages, markAsSeen]);

  return (
    <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-80 bg-white sm:rounded-2xl rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col h-[60vh] sm:h-[400px] animate-fade-in-up">
      <div className="bg-[#0B0C10] p-4 flex items-center justify-between text-[#FACC15] shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
            {otherUser.profilePicture ? <img src={getImageUrl(otherUser.profilePicture)} alt="" className="w-full h-full rounded-full object-contain bg-white"/> : (otherUser.name?.charAt(0) || 'U')}
            </div>
            <div className="font-bold text-sm truncate">{otherUser.name || otherUser.companyName}</div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white p-1"><FaTimes /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
        {messages.map((msg: any) => {
          const isMine = String(msg.senderId) === String(currentUser._id);          
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] shadow-sm ${isMine ? 'bg-[#FACC15] text-[#0B0C10] rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                {msg.message}
                {isMine && (
                  <div className="text-right text-[10px] mt-1.5 -mb-1 flex items-center justify-end gap-1.5 opacity-70">
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.seen ? (
                      <FaCheckDouble className="inline text-blue-400" />
                    ) : (
                      <FaCheck className="inline" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50" />
        <button onClick={handleSend} disabled={isSending} className="px-4 py-2 bg-[#0B0C10] text-[#FACC15] font-bold rounded-xl text-sm hover:bg-[#1F2833] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
