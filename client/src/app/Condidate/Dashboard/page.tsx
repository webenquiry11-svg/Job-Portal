'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaBriefcase, 
  FaBookmark, 
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaChevronLeft,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner, 
  FaEye,
  FaTimes,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaGlobe,
  FaUsers,
  FaBuilding,
  FaPlus,
  FaCheck,
  FaCommentDots,
  FaCheckDouble
} from 'react-icons/fa';
import { MdDashboard, MdMenu, MdMessage, MdSettings } from 'react-icons/md';
import CandidateProfile from '../../Condidate/CondidateProfile/page';
import toast from 'react-hot-toast';
import { 
  useGetAllJobsQuery, 
  useGetCompanyByIdQuery, 
  useGetJobsByEmployerQuery, 
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useApplyForJobMutation
} from '@/features/jobapi';
import { useToggleFollowCompanyMutation, useUpdateProfileMutation } from '@/features/authApi';
import { useGetMessagesQuery, useSendMessageMutation, useMarkAsSeenMutation, useGetConversationsQuery, useGetUnreadMessageCountQuery } from '@/features/chatApi';

const CandidateDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterWorkMode, setFilterWorkMode] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState<any>(null);
  const [selectedMessageUser, setSelectedMessageUser] = useState<any>(null);

  const { data: allJobs = [], isLoading: isLoadingJobs } = useGetAllJobsQuery({});
  const { data: notifications = [] } = useGetNotificationsQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();

  const { data: unreadChatData } = useGetUnreadMessageCountQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const unreadMessageCount = unreadChatData?.count || 0;

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedUser = JSON.parse(profile);
        const userData = parsedUser.result || parsedUser; 
        if (userData.role !== 'seeker') {
          router.push('/');
        } else {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem('savedJobs');
    if (stored) {
      try {
        setSavedJobIds(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved jobs", e);
      }
    }
  }, []);

  const toggleSaveJob = (jobId: string) => {
    const isSaved = savedJobIds.includes(jobId);
    const updated = isSaved ? savedJobIds.filter((id) => id !== jobId) : [...savedJobIds, jobId];
    setSavedJobIds(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    if (isSaved) {
      toast.success('Job removed from saved list');
    } else {
      toast.success('Job saved successfully!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('profile');
    router.push('/');
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && unreadCount > 0) {
      markNotificationsAsRead(user._id);
    }
  };

  const sortedJobs = [...allJobs].sort((a: any, b: any) => {
    const aIsFollowed = user?.followingCompanies?.includes(a.employerId?._id);
    const bIsFollowed = user?.followingCompanies?.includes(b.employerId?._id);
    if (aIsFollowed && !bIsFollowed) return -1;
    if (!aIsFollowed && bIsFollowed) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredJobs = sortedJobs.filter((job: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      job.title?.toLowerCase().includes(query) ||
      job.employerId?.companyName?.toLowerCase().includes(query) ||
      job.employerId?.name?.toLowerCase().includes(query) ||
      job.skills?.some((s: string) => s.toLowerCase().includes(query)) ||
      job.location?.toLowerCase().includes(query)
    );
    const matchesIndustry = !filterIndustry || job.industry === filterIndustry;
    const matchesWorkMode = !filterWorkMode || job.workMode === filterWorkMode;
    const matchesExperience = !filterExperience || job.experience === filterExperience;
    return matchesSearch && matchesIndustry && matchesWorkMode && matchesExperience;
  });

  const appliedJobs = allJobs.filter((job: any) => job.applicants?.includes(user?._id));

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-[#121212]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex-col fixed h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all duration-300 ease-in-out flex ${isSidebarCollapsed ? 'w-72 md:w-20' : 'w-72'}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-[#0F172A] hover:shadow-md transition-all z-50 cursor-pointer">
          <FaChevronLeft className={`text-[10px] text-[#0B0C10] transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className={`p-8 flex items-center gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'md:justify-center md:px-4' : ''}`}>
           <div className="bg-[#FACC15] p-2.5 rounded-xl shadow-lg shadow-[#FACC15]/20 flex-shrink-0">
             <FaBriefcase className="text-[#0B0C10] text-lg" />
           </div>
           <span className={`text-xl font-bold text-[#0B0C10] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-xs opacity-100'}`}>Job<span className="text-[#FACC15]">Portal</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Menu</p>
          <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaSearch />} label="Explore Jobs" active={activeTab === 'explore'} onClick={() => { setActiveTab('explore'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBookmark />} label="Saved Jobs" active={activeTab === 'saved'} onClick={() => { setActiveTab('saved'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBriefcase />} label="My Applications" active={activeTab === 'applications'} onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} badge={appliedJobs.length > 0 ? appliedJobs.length.toString() : undefined} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<MdMessage />} label="Messages" active={activeTab === 'messages'} onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} badge={unreadMessageCount > 0 ? unreadMessageCount.toString() : undefined} collapsed={isSidebarCollapsed} />
          
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Account</p>
          <SidebarItem icon={<FaUserCircle />} label="My Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<MdSettings />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
        </nav>

        <div className={`p-4 border-t border-gray-50 transition-all duration-300 ${isSidebarCollapsed ? 'md:m-2 md:p-2 m-4' : 'm-4'}`}>
          <button onClick={handleLogout} title={isSidebarCollapsed ? "Logout" : undefined} className={`flex items-center text-gray-500 hover:text-red-600 transition-all w-full py-3 rounded-xl hover:bg-red-50 font-medium group ${isSidebarCollapsed ? 'md:justify-center md:px-0 gap-3 px-4' : 'gap-3 px-4'}`}>
            <FaSignOutAlt className={`text-xl transition-transform ${isSidebarCollapsed ? '' : 'group-hover:translate-x-1'}`} />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[200px] opacity-100'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-md px-6 py-4 lg:px-10 border-b border-gray-200/50 transition-all duration-300">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 -ml-2 text-gray-500 hover:text-[#0B0C10] hover:bg-slate-50 rounded-full">
                  <MdMenu size={22} />
              </button>
              <h1 className="text-2xl font-bold text-[#121212] capitalize whitespace-nowrap">{activeTab.replace('-', ' ')}</h1>
            </div>
            
            <div className="flex-1 w-full md:w-auto order-last md:order-none max-w-2xl mx-auto md:px-6 relative">
              <div className="relative group flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 group-focus-within:text-[#0B0C10] transition-colors" />
                </div>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search jobs by title, skills, or company..." 
                  className="w-full pl-11 pr-12 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} title="Filter Jobs" className="absolute right-2 p-1.5 text-gray-400 hover:text-[#0B0C10] hover:bg-gray-50 rounded-xl transition-all">
                  <FaFilter />
                </button>
              </div>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute top-full mt-2 right-0 md:right-6 w-full md:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#121212]">Filter Jobs</h3>
                      <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors p-1"><FaTimes /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Industry</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all" value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}>
                          <option value="">All Industries</option>
                          <option value="IT Services">IT Services</option>
                          <option value="Advertising">Advertising</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Work Mode</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all" value={filterWorkMode} onChange={(e) => setFilterWorkMode(e.target.value)}>
                          <option value="">All Modes</option>
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Experience Level</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all" value={filterExperience} onChange={(e) => setFilterExperience(e.target.value)}>
                          <option value="">Any Experience</option>
                          <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                          <option value="Mid Level (3-5 Yrs)">Mid Level (3-5 Yrs)</option>
                          <option value="Senior Level (5+ Yrs)">Senior Level (5+ Yrs)</option>
                        </select>
                      </div>
                      <div className="pt-2 flex gap-3">
                        <button onClick={() => { setFilterIndustry(''); setFilterWorkMode(''); setFilterExperience(''); setIsFilterOpen(false); }} className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">Clear</button>
                        <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 bg-[#FACC15] text-[#0B0C10] font-bold text-sm rounded-xl hover:bg-[#EAB308] transition-colors shadow-md shadow-[#FACC15]/10">Apply</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={handleBellClick} className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-[#0B0C10] hover:border-slate-200 hover:shadow-md transition-all relative">
                <FaBell size={18} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"></span>}
              </button>
              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-[#121212]">Notifications</h3>
                      {unreadCount > 0 && <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar hide-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n: any) => (
                          <div key={n._id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'font-semibold' : 'text-gray-600'}`}>
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <FaBell className="mx-auto text-3xl text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">No notifications yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#FACC15]">
                 <div className="w-9 h-9 bg-[#0B0C10] rounded-full flex items-center justify-center text-[#FACC15] font-bold text-sm shadow-inner overflow-hidden">
                   {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase() || 'U'}
                 </div>
                 <div className="hidden sm:block text-left">
                   <p className="text-sm font-bold text-[#121212] leading-none group-hover:text-[#0B0C10] transition-colors">{user?.name || 'Candidate'}</p>
                   <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Job Seeker</p>
                 </div>
              </button>
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-sm font-bold text-[#121212]">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => { setActiveTab('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0B0C10] transition-colors flex items-center gap-3"><FaUserCircle className="text-lg" /> My Profile</button>
                    <button onClick={() => { setActiveTab('settings'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0B0C10] transition-colors flex items-center gap-3"><MdSettings className="text-lg" /> Settings</button>
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"><FaSignOutAlt className="text-lg" /> Logout</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-10 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-3xl font-bold text-[#121212]">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                <p className="text-gray-500 mt-2 text-sm">Here is what's happening with your job applications today.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FaBriefcase />} label="Applied Jobs" value={appliedJobs.length.toString()} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<FaBookmark />} label="Saved Jobs" value={savedJobIds.length.toString()} color="bg-slate-100 text-slate-600" />
                <StatCard icon={<FaClock />} label="Interviews" value="2" color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<FaEye />} label="Profile Views" value="84" color="bg-slate-100 text-slate-600" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#121212]">Recent Applications</h3>
                    <button onClick={() => setActiveTab('applications')} className="text-sm font-bold text-[#0B0C10] hover:text-[#EAB308]">View All</button>
                  </div>
                  <div className="space-y-4">
                    {appliedJobs.length > 0 ? (
                      appliedJobs.slice(0, 4).map((job: any) => (
                        <ApplicationRow key={job._id} title={job.title} company={job.employerId?.companyName || job.employerId?.name || 'Company'} logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} status="Applied" date={new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent applications.</p>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#121212]">Recommended for you</h3>
                  </div>
                  <div className="space-y-4">
                    {isLoadingJobs ? (
                      <p className="text-sm text-gray-500 animate-pulse">Loading jobs...</p>
                    ) : filteredJobs.length > 0 ? (
                      filteredJobs.slice(0, 3).map((job: any) => (
                        <RecommendedJobCard 
                          key={job._id}
                          job={job}
                          onViewDetails={() => setSelectedJob(job)}
                          isSaved={savedJobIds.includes(job._id)}
                          onToggleSave={() => toggleSaveJob(job._id)}
                          onViewCompany={(id: string) => setSelectedCompanyId(id)}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">{searchQuery ? "No jobs match your search criteria." : "No jobs available right now."}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#121212]">Explore All Jobs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {isLoadingJobs ? (
                  <p className="text-sm text-gray-500 animate-pulse col-span-full">Loading jobs...</p>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job: any) => (
                    <RecommendedJobCard 
                      key={job._id}
                      job={job}
                      onViewDetails={() => setSelectedJob(job)}
                      isSaved={savedJobIds.includes(job._id)}
                      onToggleSave={() => toggleSaveJob(job._id)}
                      onViewCompany={(id: string) => setSelectedCompanyId(id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <FaSearch className="text-5xl text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">{searchQuery || filterIndustry || filterWorkMode || filterExperience ? "No jobs match your search criteria." : "No jobs available right now."}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#121212]">Saved Jobs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {allJobs.filter((job: any) => savedJobIds.includes(job._id)).length > 0 ? (
                  allJobs.filter((job: any) => savedJobIds.includes(job._id)).map((job: any) => (
                    <RecommendedJobCard 
                      key={job._id}
                      job={job}
                      onViewDetails={() => setSelectedJob(job)}
                      isSaved={true}
                      onToggleSave={() => toggleSaveJob(job._id)}
                      onViewCompany={(id: string) => setSelectedCompanyId(id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <FaBookmark className="text-5xl text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">You haven't saved any jobs yet.</p>
                    <button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => searchInputRef.current?.focus(), 300); }} className="mt-4 px-6 py-2 bg-[#FACC15] text-[#0B0C10] text-sm font-bold rounded-xl hover:bg-[#EAB308] transition-colors shadow-lg shadow-[#FACC15]/20">Explore Jobs</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && <CandidateProfile user={user} setUser={setUser} />}
          {activeTab === 'messages' && <CandidateMessagesSection user={user} allJobs={allJobs} initialSelectedUser={selectedMessageUser} />}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#121212]">My Applications</h2>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                {appliedJobs.length > 0 ? (
                   <div className="space-y-4">
                      {appliedJobs.map((job: any) => (
                          <ApplicationRow key={job._id} title={job.title} company={job.employerId?.companyName || job.employerId?.name || 'Company'} logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} status="Applied" date={new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-16">
                      <FaBriefcase className="mx-auto text-5xl text-gray-200 mb-4" />
                      <h3 className="text-lg font-bold text-[#121212]">No applications yet</h3>
                      <p className="text-gray-500 mt-2">When you apply for a job, it will appear here.</p>
                      <button onClick={() => setActiveTab('explore')} className="mt-6 px-6 py-2.5 bg-[#FACC15] text-[#0B0C10] font-bold rounded-xl shadow-lg hover:bg-[#EAB308] transition-all">Explore Jobs</button>
                   </div>
                )}
              </div>
            </div>
          )}
          {activeTab !== 'dashboard' && activeTab !== 'explore' && activeTab !== 'profile' && activeTab !== 'saved' && activeTab !== 'messages' && activeTab !== 'applications' && (
             <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
               <FaBriefcase className="text-6xl text-slate-200 mb-4" />
               <h2 className="text-xl font-bold text-[#121212] capitalize">{activeTab.replace('-', ' ')}</h2>
               <p className="text-gray-500 text-sm mt-2">This section is currently under development.</p>
             </div>
          )}
        </div>
      </main>

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} user={user} onApply={() => {
        setJobToApply(selectedJob);
        setIsResumeModalOpen(true);
        setSelectedJob(null);
      }} />}
      {selectedCompanyId && (
        <CompanyProfileModal 
          companyId={selectedCompanyId} 
          onClose={() => setSelectedCompanyId(null)} 
          onJobClick={(job: any) => setSelectedJob(job)} 
          user={user}
          setUser={setUser}
          onMessageClick={(company: any) => {
            setSelectedCompanyId(null);
            setSelectedMessageUser(company);
            setActiveTab('messages');
          }}
        />
      )}
      {isResumeModalOpen && (
        <ResumeUploadModal
            user={user}
            setUser={setUser}
            jobToApply={jobToApply}
            onClose={() => setIsResumeModalOpen(false)}
        />
      )}
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick, badge, collapsed }: any) => (
  <button onClick={onClick} title={collapsed ? label : undefined} className={`w-full flex items-center justify-between py-3.5 rounded-xl transition-all duration-200 font-medium group relative ${collapsed ? 'md:px-0 md:justify-center px-4' : 'px-4'} ${active ? 'bg-[#0B0C10] text-[#FACC15] shadow-lg shadow-black/30' : 'text-gray-500 hover:bg-gray-100 hover:text-[#0B0C10]'}`}>
    <div className={`flex items-center ${collapsed ? 'md:gap-0 gap-3' : 'gap-3'}`}>
        <span className={`text-xl flex-shrink-0 ${active ? 'text-[#FACC15]' : 'text-gray-400 group-hover:text-[#0B0C10]'}`}>{icon}</span>
        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[200px] opacity-100'}`}>{label}</span>
    </div>
    {badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all duration-300 ${collapsed ? 'md:hidden' : ''} ${active ? 'bg-[#FACC15]/20 text-[#FACC15]' : 'bg-gray-200 text-[#0B0C10]'}`}>{badge}</span>}
    {badge && collapsed && <span className="hidden md:block absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 border border-white"></span>}
  </button>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    </div>
    <h3 className="text-3xl font-bold text-[#121212] mb-1">{value}</h3>
    <p className="text-sm font-medium text-gray-400">{label}</p>
  </div>
);

const ApplicationRow = ({ title, company, logo, status, date }: any) => {
  let statusConfig = { color: 'text-gray-500 bg-gray-100 border-gray-200', icon: <FaSpinner className="animate-spin" /> };
  if (status === 'Applied') statusConfig = { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <FaCheckCircle /> };
  if (status === 'Interview') statusConfig = { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <FaClock /> };
  if (status === 'Rejected') statusConfig = { color: 'text-red-600 bg-red-50 border-red-200', icon: <FaTimesCircle /> };
  if (status === 'Offered') statusConfig = { color: 'text-green-600 bg-green-50 border-green-200', icon: <FaCheckCircle /> }; // Keep green for offered
  return (
      <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-bold text-[#0B0C10] group-hover:bg-[#0B0C10] group-hover:text-[#FACC15] transition-colors">{logo}</div>
              <div>
                  <h4 className="font-bold text-[#121212] text-sm md:text-base group-hover:text-[#EAB308] transition-colors">{title}</h4>
                  <p className="text-xs font-medium text-gray-500">{company}</p>
              </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:block text-right">
                  <span className="text-[10px] font-bold text-gray-400 block mb-0.5 uppercase tracking-wider">Applied</span>
                  <span className="text-xs font-medium text-[#121212]">{date}</span>
              </div>
              <div className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-bold flex items-center gap-1.5 ${statusConfig.color}`}>{statusConfig.icon} <span className="hidden sm:inline">{status}</span></div>
          </div>
      </div>
  );
};

const RecommendedJobCard = ({ job, onViewDetails, isSaved, onToggleSave, onViewCompany }: any) => {
  const { title, employerId, location, salaryMin, salaryMax, skills } = job;
  const company = employerId?.companyName || employerId?.name || 'Company';
  const logo = company.charAt(0).toUpperCase();
  const salary = `$${salaryMin} - $${salaryMax}`;
  const tags = skills?.slice(0, 3) || [];
  const handleCompanyClick = (e: React.MouseEvent) => { e.stopPropagation(); if (employerId?._id && onViewCompany) onViewCompany(employerId._id); };
  return (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-lg font-bold text-[#0B0C10] flex-shrink-0">{logo}</div>
              <div className="min-w-0">
                  <h4 className="font-bold text-[#121212] text-sm group-hover:text-[#0B0C10] transition-colors truncate">{title}</h4>
                  <span onClick={handleCompanyClick} className="text-xs font-medium text-gray-500 hover:underline hover:text-slate-800 transition-colors truncate block cursor-pointer">{company}</span>
              </div>
          </div>
          <button onClick={onToggleSave} className={`transition-colors flex-shrink-0 ml-2 ${isSaved ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-[#0B0C10]'}`}><FaBookmark /></button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center text-xs text-gray-500"><FaMapMarkerAlt className="mr-2 flex-shrink-0" /> <span className="truncate">{location}</span></div>
          <div className="flex items-center text-xs text-gray-500"><FaMoneyBillWave className="mr-2 flex-shrink-0" /> {salary}</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag: string, i: number) => (
              <span key={i} className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-100">{tag}</span>
          ))}
      </div>
      <div className="mt-auto"><button onClick={onViewDetails} className="w-full py-2.5 bg-slate-50 text-[#0B0C10] font-bold text-sm rounded-xl hover:bg-[#0B0C10] hover:text-[#FACC15] transition-colors border border-slate-100 group-hover:border-[#0B0C10]">View Job Details</button></div>
  </div>
)};

const JobDetailsModal = ({ job, onClose, user, onApply }: any) => {
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const handleApply = async () => {
    if (!user?.resume) {
      onApply();
    } else {
      try {
        await applyForJob({ jobId: job._id, candidateId: user._id }).unwrap();
              toast.success('🎉 Successfully applied! The employer has been notified.', {
                duration: 5000,
                position: 'top-center',
                style: {
                  background: '#0B0C10',
                  color: '#FACC15',
                  fontWeight: 'bold',
                  padding: '16px',
                  borderRadius: '12px',
                },
              });
        onClose();
      } catch (err: any) {
        toast.error(err.data?.message || 'Failed to apply');
      }
    }
  };

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
      <div className="p-6 md:px-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-2xl font-bold text-[#121212] flex items-center gap-3">
          <div className="bg-[#FACC15] p-2 rounded-xl shadow-md"><FaBriefcase className="text-[#0B0C10] text-sm" /></div>
          Job Details
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md"><FaTimes size={18} /></button>
      </div>
      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
        <h3 className="text-3xl font-bold text-[#0B0C10]">{job.title}</h3>
        <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2"><span className="text-gray-700">{job.employerId?.companyName || job.employerId?.name || 'Company'}</span> • <span>{job.workMode}</span> • <span>{job.location}</span></p>
        <div className="flex flex-wrap gap-2 mt-6">
          {job.skills && job.skills.length > 0 ? job.skills.map((s: string, i: number) => (
            <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-[#121212]">{s}</span>
          )) : <span className="text-sm text-gray-400 italic">No skills specified</span>}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-sm">
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Experience</p><p className="font-bold text-[#121212] text-base">{job.experience || 'Not specified'}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Salary ({job.salaryType})</p><p className="font-bold text-[#121212] text-base">${job.salaryMin || '0'} - ${job.salaryMax || '0'}</p></div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">Job Description</p><p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p></div>
        {job.screeningQuestion && <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Screening Question</p><p className="font-semibold text-[#121212] text-sm">{job.screeningQuestion}</p></div>}
        <div className="mt-6 flex items-center gap-4">{job.immediateJoiner && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold">Immediate Joiner Required</span>}<span className="text-xs font-medium text-gray-500">Contact via: <span className="font-bold text-gray-700">{job.contactPreference}</span></span></div>
      </div>
      <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-3xl">
        <button onClick={handleApply} disabled={isApplying} className="px-8 py-3 bg-[#FACC15] text-[#0B0C10] font-black rounded-xl hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm disabled:opacity-50">
          {isApplying ? 'Applying...' : 'Apply Now'} <FaArrowRight />
        </button>
      </div>
    </div>
  </div>
  );
};

const ResumeUploadModal = ({ user, setUser, jobToApply, onClose }: any) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [updateProfile, { isLoading: isUploading }] = useUpdateProfileMutation();
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleUploadAndApply = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('_id', user._id);
    formData.append('resume', resumeFile);

    try {
      const uploadResult = await updateProfile(formData).unwrap();
      const updatedUser = uploadResult.result;
      setUser(updatedUser);
      const currentProfile = JSON.parse(localStorage.getItem('profile') || '{}');
      currentProfile.result = updatedUser;
      localStorage.setItem('profile', JSON.stringify(currentProfile));
      toast.success('Resume uploaded successfully!');

      await applyForJob({ jobId: jobToApply._id, candidateId: updatedUser._id }).unwrap();
      toast.success(`🎉 Successfully applied for ${jobToApply.title}! The employer has been notified.`, {
        duration: 5000,
        position: 'top-center',
        style: {
                  background: '#0B0C10',
                  color: '#FACC15',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#121212]">Upload Your Resume</h2>
          <p className="text-sm text-gray-500 mt-1">You need to upload a resume before applying for "{jobToApply?.title}".</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resume (PDF, DOC, DOCX)</label>
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 focus:outline-none" />
          </div>
        </div>
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={handleUploadAndApply} disabled={isUploading || isApplying} className="px-5 py-2.5 text-sm font-bold text-[#0B0C10] bg-[#FACC15] rounded-xl hover:bg-[#EAB308] shadow-md disabled:opacity-50">
            {isUploading ? 'Uploading...' : isApplying ? 'Applying...' : 'Upload & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CompanyProfileModal = ({ companyId, onClose, onJobClick, user, setUser, onMessageClick }: any) => {
  const { data: company, isLoading: isLoadingCompany } = useGetCompanyByIdQuery(companyId, { skip: !companyId });
  const { data: jobs = [], isLoading: isLoadingJobs } = useGetJobsByEmployerQuery(companyId, { skip: !companyId });
  const [toggleFollow, { isLoading: isFollowingLoading }] = useToggleFollowCompanyMutation();
  const isFollowing = user?.followingCompanies?.includes(companyId);

  const handleFollowToggle = async () => {
    try {
      const { result: updatedCandidate } = await toggleFollow({ companyId, candidateId: user._id }).unwrap();
      setUser(updatedCandidate);
      const currentProfile = JSON.parse(localStorage.getItem('profile') || '{}');
      currentProfile.result = updatedCandidate;
      localStorage.setItem('profile', JSON.stringify(currentProfile));
      toast.success(isFollowing ? `Unfollowed ${company.companyName}` : `Now following ${company.companyName}`);
    } catch (error) { toast.error('An error occurred.'); }
  };

  if (isLoadingCompany) return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"><FaSpinner className="animate-spin text-4xl text-white" /></div>;
  if (!company) return <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}><div className="bg-white p-8 rounded-3xl" onClick={e => e.stopPropagation()}><h2 className="text-xl font-bold">Company not found</h2><button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 font-bold text-sm rounded-xl">Close</button></div></div>;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="overflow-y-auto custom-scrollbar flex-1 bg-gray-50 pb-8">
          <div className="h-48 md:h-64 bg-gradient-to-r from-[#0B0C10] to-[#1F2833] relative bg-cover bg-center flex-shrink-0" style={{ backgroundImage: company.coverImage ? `url(${company.coverImage})` : undefined }}><div className="absolute inset-0 bg-black/30"></div><button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2.5 rounded-full backdrop-blur-md transition-colors z-10"><FaTimes size={18} /></button></div>
          <div className="px-6 md:px-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 -mt-12 relative z-10">
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl p-1.5 shadow-lg -mt-16 flex-shrink-0 border border-gray-100"><div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-4xl font-bold text-[#0B0C10] overflow-hidden">{company.profilePicture ? <img src={company.profilePicture} alt={company.companyName} className="w-full h-full object-cover" /> : company.companyName?.charAt(0).toUpperCase() || 'C'}</div></div>
                  <div className="flex-1 mt-2 md:mt-0"><h1 className="text-2xl md:text-3xl font-bold text-[#121212]">{company.companyName}</h1><p className="text-gray-500 text-sm md:text-base mt-1 font-medium">{company.tagline || 'Leading the way in innovation.'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-gray-500">
                      {company.location && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaMapMarkerAlt className="text-[#0B0C10]" /> {company.location}</span>}
                      {company.industry && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaBuilding className="text-[#0B0C10]" /> {company.industry}</span>}
                      {company.companySize && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaUsers className="text-[#0B0C10]" /> {company.companySize}</span>}
                      {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0B0C10] hover:underline bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaGlobe /> Website</a>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex-shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <button onClick={handleFollowToggle} disabled={isFollowingLoading} className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 ${isFollowing ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-[#FACC15] text-[#0B0C10] shadow-lg shadow-[#FACC15]/20'}`}>
                    {isFollowingLoading ? <FaSpinner className="animate-spin" /> : (isFollowing ? <><FaCheck /> Following</> : <><FaPlus /> Follow</>)}
                  </button>
                  {isFollowing && (
                    <button onClick={() => onMessageClick(company)} className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm bg-[#0B0C10] text-[#FACC15] hover:bg-[#1F2833] border border-transparent">
                      <FaCommentDots /> Message
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"><h2 className="text-xl font-bold text-[#121212] mb-4">About Us</h2><p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{company.description || 'No description available.'}</p></div>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"><h2 className="text-xl font-bold text-[#121212] mb-6">Open Positions ({jobs.length})</h2>
                  {isLoadingJobs ? <div className="flex items-center justify-center py-8"><FaSpinner className="animate-spin text-2xl text-gray-300" /></div> : jobs.length > 0 ? (
                    <div className="space-y-4">{jobs.map((job: any) => (<div key={job._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h3 className="font-bold text-[#121212]">{job.title}</h3><p className="text-xs text-gray-500 mt-1">{job.location} • {job.workMode} • ${job.salaryMin}-${job.salaryMax}</p></div><button onClick={() => { onClose(); onJobClick(job); }} className="px-5 py-2 bg-white border border-gray-200 text-[#0B0C10] text-sm font-bold rounded-xl hover:bg-[#FACC15] hover:border-[#FACC15] shadow-sm transition-colors whitespace-nowrap">View Details</button></div>))}</div>
                  ) : <p className="text-gray-500 text-sm text-center py-4">No open positions.</p>}
                </div>
              </div>
              <div className="space-y-8">
                {company.specialties && <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"><h2 className="text-xl font-bold text-[#121212] mb-4">Specialties</h2><div className="flex flex-wrap gap-2">{company.specialties.split(',').map((s: string, i: number) => (<span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">{s.trim()}</span>))}</div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateMessagesSection = ({ user, allJobs, initialSelectedUser }: any) => {
  const [selectedUser, setSelectedUser] = useState<any>(initialSelectedUser);
  const { data: conversations = [] } = useGetConversationsQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const { data: messages = [] } = useGetMessagesQuery(
    { user1: user?._id, user2: selectedUser?._id },
    { skip: !selectedUser?._id, pollingInterval: 3000 }
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();  const [markAsSeen] = useMarkAsSeenMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialSelectedUser) setSelectedUser(initialSelectedUser);
  }, [initialSelectedUser]);

  useEffect(() => {
    if (selectedUser && user?._id && messages.length > 0) {
      const hasUnread = messages.some((msg: any) => String(msg.senderId) === String(selectedUser._id) && !msg.seen);
      if (hasUnread) {
        markAsSeen({ senderId: selectedUser._id, receiverId: user._id });
      }
    }
  }, [selectedUser, user, messages, markAsSeen]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedUser || isSending) return;
    try {
      await sendMessage({ senderId: user._id, receiverId: selectedUser._id, message: messageText }).unwrap();
      setMessageText('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  // Derive connected companies from `allJobs` and `user.followingCompanies`
  const followedCompaniesMap = new Map();
  if (user?.followingCompanies && Array.isArray(user.followingCompanies)) {
    allJobs.forEach((job: any) => {
      if (job.employerId && user.followingCompanies.includes(job.employerId._id)) {
        followedCompaniesMap.set(job.employerId._id, job.employerId);
      }
    });
  }
  
  // Always include the initially selected user (if passed from modal) even if not in the cached jobs list
  if (initialSelectedUser && !followedCompaniesMap.has(initialSelectedUser._id)) {
    followedCompaniesMap.set(initialSelectedUser._id, initialSelectedUser);
  }

  const followedCompanies = Array.from(followedCompaniesMap.values());
  const filteredCompanies = followedCompanies.filter((c: any) => 
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex h-[600px] overflow-hidden animate-fade-in-up">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white z-10">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-[#121212]">Messages</h2>
          <div className="mt-4 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {filteredCompanies.map((company: any) => (
            <div
              key={company._id}
              onClick={() => setSelectedUser(company)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${selectedUser?._id === company._id ? 'bg-slate-50 border-l-4 border-l-[#FACC15]' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                {company.profilePicture ? <img src={company.profilePicture} alt="" className="w-full h-full rounded-full object-cover"/> : (company.companyName?.charAt(0) || company.name?.charAt(0) || 'C').toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#121212] truncate">{company.companyName || company.name}</h4>
                <p className="text-xs text-gray-500 truncate">{company.industry || 'Employer'}</p>
              </div>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">{searchQuery ? "No companies found." : "No connections yet."}</div>
          )}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {selectedUser ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white flex items-center gap-4 shadow-sm z-10">
               <div className="w-10 h-10 bg-[#0B0C10] text-[#FACC15] rounded-full flex items-center justify-center font-bold shadow-md">
                 {selectedUser.profilePicture ? <img src={selectedUser.profilePicture} alt="" className="w-full h-full rounded-full object-cover"/> : (selectedUser.companyName?.charAt(0) || selectedUser.name?.charAt(0) || 'C').toUpperCase()}
               </div>
               <div>
                 <h3 className="font-bold text-[#121212]">{selectedUser.companyName || selectedUser.name}</h3>
                 <p className="text-xs text-gray-500">Connected via Follow</p>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((msg: any) => {
                const isMine = String(msg.senderId) === String(user._id);
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm shadow-sm ${isMine ? 'bg-[#FACC15] text-[#0B0C10] rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
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
            <div className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 transition-all"
              />
              <button onClick={handleSend} disabled={isSending} className="px-8 py-3 bg-[#0B0C10] text-[#FACC15] font-bold rounded-xl text-sm hover:bg-[#1F2833] shadow-lg shadow-black/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MdMessage className="text-6xl text-slate-200 mb-4" />
            <p className="text-lg font-medium text-gray-500">Your Messages</p>
            <p className="text-sm mt-1">Select a company from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;