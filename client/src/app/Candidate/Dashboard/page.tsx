'use client';

// @ts-ignore
import 'leaflet/dist/leaflet.css'; // Correctly imported at the top
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
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
  FaPaperPlane,
  FaCommentDots,
  FaCheckDouble,
  FaMap,
  FaList,
  FaFileAlt,
  FaUser,
  FaHeadset
} from 'react-icons/fa';
import { MdDashboard, MdMenu, MdMessage, MdSettings } from 'react-icons/md';
import CandidateProfile from '../CandidateProfile/page';
import toast from 'react-hot-toast';
import { 
  useGetAllJobsQuery, 
  useGetCompanyByIdQuery, 
  useGetJobsByEmployerQuery, 
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useApplyForJobMutation,
  useRequestDeleteOtpMutation, useDeleteAccountMutation
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
  const [applicationFilter, setApplicationFilter] = useState('All');
  const [exploreViewMode, setExploreViewMode] = useState<'list' | 'map'>('map');

  const [smartApplyData, setSmartApplyData] = useState<{city: string, roles: number} | null>(null);
  const [pendingSmartApplyPin, setPendingSmartApplyPin] = useState<{name: string, jobs: number} | null>(null);
  
  const [isClient, setIsClient] = useState(false);
  const { data: allJobs = [], isLoading: isLoadingJobs } = useGetAllJobsQuery();
  const { data: notifications = [] } = useGetNotificationsQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const { data: freshUserData, isLoading: isLoadingFreshUser } = useGetCompanyByIdQuery(user?._id, {
    skip: !user?._id,
    pollingInterval: 30000, // Poll for updates every 30 seconds
  });
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();

  const { data: unreadChatData } = useGetUnreadMessageCountQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const unreadMessageCount = unreadChatData?.count || 0;

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedUser = JSON.parse(profile);
        const userData = parsedUser.result || parsedUser.user || parsedUser; 
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
    setIsClient(true);
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

  const handleSmartApply = (pin: {name: string, jobs: number}) => {
    if (user?.resume) {
        // If resume exists, show success modal directly
        setSmartApplyData({ city: pin.name, roles: pin.jobs });
    } else {
        // If no resume, store the pin info and open the resume upload modal
        setPendingSmartApplyPin(pin);
        setJobToApply(null); // No specific job for this flow
        setIsResumeModalOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('profile');
    router.push('/');
  };

  const profileViews = freshUserData?.profileViews ?? user?.profileViews ?? 0;

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

  const interviewsCount = appliedJobs.filter((job: any) => {
    const detail = job.applicantDetails?.find((d: any) => d.candidateId === user?._id);
    return detail?.status === 'Interview';
  }).length;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <div className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col z-40">
          <div className="p-6 h-20 flex items-center border-b border-gray-50"><div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div></div>
          <div className="p-4 space-y-3 mt-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-20 bg-white border-b border-gray-200/50 flex items-center justify-between px-6 lg:px-10">
            <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="p-6 lg:p-10 space-y-8">
            <div className="w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>)}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
               <div className="xl:col-span-2 h-80 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
               <div className="h-80 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
            </div>
          </div>
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

        <div className={`p-6 h-20 flex items-center transition-all duration-300 ${isSidebarCollapsed ? "md:justify-center md:px-4" : ""}`}>
          <div className={`relative w-40 h-full z-50 transition-all duration-300 ${isSidebarCollapsed ? "md:hidden" : "block"}`}>
            <img src="/Click4Jobs Logo.png" alt="Click4Jobs" className="absolute top-1/2 left-0 -translate-y-1/2 h-[220px] w-auto max-w-none object-contain" />
          </div>
          <div className={`flex-shrink-0 hidden transition-all duration-300 ${isSidebarCollapsed ? "md:flex" : ""}`}>
            <img src="/Fav Icon.png" alt="Click4Jobs Icon" className="w-14 h-14 object-contain drop-shadow-md" />
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Menu</p>
          <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaSearch />} label="Explore Jobs" active={activeTab === 'explore'} onClick={() => { setActiveTab('explore'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBookmark />} label="Saved Jobs" active={activeTab === 'saved'} onClick={() => { setActiveTab('saved'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBriefcase />} label="My Applications" active={activeTab === 'applications'} onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} badge={appliedJobs.length > 0 ? appliedJobs.length.toString() : undefined} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBell />} label="Job Alerts" active={activeTab === 'alerts'} onClick={() => { setActiveTab('alerts'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
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
                  className="w-full pl-11 pr-12 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04] focus:border-transparent transition-all shadow-sm"
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
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04] transition-all" value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}>
                          <option value="">All Industries</option>
                          <option value="IT Services">IT Services</option>
                          <option value="Advertising">Advertising</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Work Mode</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04] transition-all" value={filterWorkMode} onChange={(e) => setFilterWorkMode(e.target.value)}>
                          <option value="">All Modes</option>
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Experience Level</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04] transition-all" value={filterExperience} onChange={(e) => setFilterExperience(e.target.value)}>
                          <option value="">Any Experience</option>
                          <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                          <option value="Mid Level (3-5 Yrs)">Mid Level (3-5 Yrs)</option>
                          <option value="Senior Level (5+ Yrs)">Senior Level (5+ Yrs)</option>
                        </select>
                      </div>
                      <div className="pt-2 flex gap-3">
                        <button onClick={() => { setFilterIndustry(''); setFilterWorkMode(''); setFilterExperience(''); setIsFilterOpen(false); }} className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">Clear</button>
                        <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 bg-[#e49d04] text-[#0B0C10] font-bold text-sm rounded-xl hover:bg-[#cc8c03] transition-colors shadow-md shadow-[#e49d04]/10">Apply</button>
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
                  <div className="fixed sm:absolute top-20 sm:top-auto sm:mt-2 left-4 right-4 sm:left-auto sm:right-0 w-auto sm:w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform sm:origin-top-right">
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
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#e49d04]">
                 <div className="w-9 h-9 bg-[#0B0C10] rounded-full flex items-center justify-center text-[#e49d04] font-bold text-sm shadow-inner overflow-hidden">
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
                  <div className="fixed sm:absolute top-20 sm:top-auto sm:mt-2 left-4 right-4 sm:left-auto sm:right-0 w-auto sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform sm:origin-top-right">
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
                <StatCard icon={<FaClock />} label="Interviews" value={interviewsCount.toString()} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<FaEye />} label="Profile Views" value={isLoadingFreshUser ? '...' : profileViews.toLocaleString()} color="bg-slate-100 text-slate-600" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#121212]">Recent Applications</h3>
                    <button onClick={() => setActiveTab('applications')} className="text-sm font-bold text-[#0B0C10] hover:text-[#cc8c03]">View All</button>
                  </div>
                  <div className="space-y-4">
                    {appliedJobs.length > 0 ? (
                      appliedJobs.slice(0, 4).map((job: any) => {
                        const detail = job.applicantDetails?.find((d: any) => d.candidateId === user._id);
                        return (
                          <ApplicationRow key={job._id} title={job.title} company={job.employerId?.companyName || job.employerId?.name || 'Company'} logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} status={detail?.status || 'Applied'} date={new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} detail={detail} />
                        )
                      })
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#121212]">Explore All Jobs</h2>
                  <p className="text-sm text-gray-500 mt-1">Discover opportunities by category or interactive map</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
                  <button onClick={() => setExploreViewMode('map')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${exploreViewMode === 'map' ? 'bg-[#0B0C10] shadow-sm text-[#e49d04]' : 'text-gray-500 hover:text-[#121212]'}`}><FaMap /> Map View</button>
                  <button onClick={() => setExploreViewMode('list')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${exploreViewMode === 'list' ? 'bg-white shadow-sm text-[#0B0C10]' : 'text-gray-500 hover:text-[#121212]'}`}><FaList /> List View</button>
                </div>
              </div>

              {/* Category Slider inside Explore Jobs */}
              <div className="category-carousel-container flex flex-col gap-4 relative w-full overflow-hidden py-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                <style>{`
                  @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                  @keyframes scroll-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
                  .animate-scroll-left { animation: scroll-left 80s linear infinite; width: max-content; }
                  .animate-scroll-right { animation: scroll-right 80s linear infinite; width: max-content; }
                  .category-carousel-container:hover .animate-scroll-left, .category-carousel-container:hover .animate-scroll-right { animation-play-state: paused; }
                `}</style>
                <div className="animate-scroll-right flex gap-4">
                  {[...Array(4)].map((_, arrayIndex) => (
                    <div key={arrayIndex} className="flex gap-4 shrink-0">
                      {[
                        { name: 'Housekeeping', count: '360 openings', icon: <FaBuilding /> },
                        { name: 'Computer / Data Entry', count: '309 openings', icon: <FaFileAlt /> },
                        { name: 'Hospitality/ Hotel/ Event', count: '301 openings', icon: <FaUsers /> },
                        { name: 'Graphic Designer', count: '275 openings', icon: <FaFileAlt /> },
                        { name: 'Office Help / Peon', count: '247 openings', icon: <FaBriefcase /> },
                      ].map((cat, idx) => (
                        <div key={idx} onClick={() => { setSearchQuery(cat.name); setExploreViewMode('list'); }} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#e49d04]/50 transition-all duration-300 cursor-pointer group w-72 shrink-0">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 group-hover:bg-[#e49d04]/10 group-hover:text-[#e49d04] transition-colors">
                                <div className="text-base">{cat.icon}</div>
                            </div>
                            <div className="ml-3 flex-grow min-w-0 text-left">
                                <h3 className="font-bold text-[#1a1a1a] text-[14px] leading-tight truncate">{cat.name}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{cat.count}</p>
                            </div>
                            <div className="ml-2 text-gray-300 group-hover:text-[#e49d04] group-hover:translate-x-1 transition-all">
                                <FaArrowRight size={12} />
                            </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="animate-scroll-left flex gap-4">
                  {[...Array(4)].map((_, arrayIndex) => (
                    <div key={arrayIndex} className="flex gap-4 shrink-0">
                      {[
                        { name: 'Painter', count: '16 openings', icon: <FaUser /> },
                        { name: 'Mobile Technician', count: '16 openings', icon: <FaHeadset /> },
                        { name: 'Electronic Engineer', count: '14 openings', icon: <FaBuilding /> },
                        { name: 'Tool and Die Maker', count: '13 openings', icon: <FaBriefcase /> },
                        { name: 'Plumber', count: '13 openings', icon: <FaUser /> },
                      ].map((cat, idx) => (
                        <div key={idx} onClick={() => { setSearchQuery(cat.name); setExploreViewMode('list'); }} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#e49d04]/50 transition-all duration-300 cursor-pointer group w-72 shrink-0">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 group-hover:bg-[#e49d04]/10 group-hover:text-[#e49d04] transition-colors">
                                <div className="text-base">{cat.icon}</div>
                            </div>
                            <div className="ml-3 flex-grow min-w-0 text-left">
                                <h3 className="font-bold text-[#1a1a1a] text-[14px] leading-tight truncate">{cat.name}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{cat.count}</p>
                            </div>
                            <div className="ml-2 text-gray-300 group-hover:text-[#e49d04] group-hover:translate-x-1 transition-all">
                                <FaArrowRight size={12} />
                            </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              {exploreViewMode === 'list' ? (
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
              ) : (isClient ? (
                  <InteractiveJobMap
                    onSelectCity={(pin: { name: string; jobs: number }) => {
                      handleSmartApply(pin);
                    }}
                  />
                ) : (
                  <div className="w-full h-[600px] bg-gray-100 border border-gray-200 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold mt-6 shadow-sm">Loading Interactive Map...</div>
                )
              )}
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
                    <button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => searchInputRef.current?.focus(), 300); }} className="mt-4 px-6 py-2 bg-[#e49d04] text-[#0B0C10] text-sm font-bold rounded-xl hover:bg-[#cc8c03] transition-colors shadow-lg shadow-[#e49d04]/20">Explore Jobs</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && <CandidateProfile user={user} setUser={setUser} />}
          {activeTab === 'messages' && <CandidateMessagesSection user={user} allJobs={allJobs} initialSelectedUser={selectedMessageUser} />}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-[#121212]">My Applications</h2>
                {appliedJobs.length > 0 && (
                  <select 
                    value={applicationFilter} 
                    onChange={(e) => setApplicationFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e49d04] transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Selected">Selected</option>
                    <option value="Interview">Interview</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                )}
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                {appliedJobs.length > 0 ? (
                   <div className="space-y-4">
                      {(() => {
                        const filtered = appliedJobs.filter((job: any) => {
                          if (applicationFilter === 'All') return true;
                          const detail = job.applicantDetails?.find((d: any) => d.candidateId === user._id);
                          const status = detail?.status || 'Applied';
                          return status === applicationFilter;
                        });

                        if (filtered.length === 0) {
                          return <div className="text-center py-8 text-gray-500 text-sm">No applications found for the selected status.</div>;
                        }

                        return filtered.map((job: any) => {
                          const detail = job.applicantDetails?.find((d: any) => d.candidateId === user._id);
                          return (
                            <ApplicationRow key={job._id} title={job.title} company={job.employerId?.companyName || job.employerId?.name || 'Company'} isVerifiedEmployer={job.employerId?.gstVerificationStatus === 'approved'} logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} status={detail?.status || 'Applied'} date={new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} detail={detail} />
                          )
                        });
                      })()}
                   </div>
                ) : (
                   <div className="text-center py-16">
                      <FaBriefcase className="mx-auto text-5xl text-gray-200 mb-4" />
                      <h3 className="text-lg font-bold text-[#121212]">No applications yet</h3>
                      <p className="text-gray-500 mt-2">When you apply for a job, it will appear here.</p>
                      <button onClick={() => setActiveTab('explore')} className="mt-6 px-6 py-2.5 bg-[#e49d04] text-[#0B0C10] font-bold rounded-xl shadow-lg hover:bg-[#cc8c03] transition-all">Explore Jobs</button>
                   </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'settings' && <SettingsSection user={user} />}
          {activeTab === 'alerts' && <JobAlertsSection user={user} />}
          {activeTab !== 'dashboard' && activeTab !== 'explore' && activeTab !== 'profile' && activeTab !== 'saved' && activeTab !== 'messages' && activeTab !== 'applications' && activeTab !== 'settings' && activeTab !== 'alerts' && (
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
            onClose={() => {
                setIsResumeModalOpen(false);
                setPendingSmartApplyPin(null);
            }}
            onUploadComplete={() => {
                if (pendingSmartApplyPin) {
                    setSmartApplyData({ city: pendingSmartApplyPin.name, roles: pendingSmartApplyPin.jobs });
                    setPendingSmartApplyPin(null);
                }
            }}
        />
      )}
      {smartApplyData && (
        <SmartApplySuccessModal data={smartApplyData} onClose={() => { setSmartApplyData(null); setActiveTab('dashboard'); }} />
      )}
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick, badge, collapsed }: any) => (
  <button onClick={onClick} title={collapsed ? label : undefined} className={`w-full flex items-center justify-between py-3.5 rounded-xl transition-all duration-200 font-medium group relative ${collapsed ? 'md:px-0 md:justify-center px-4' : 'px-4'} ${active ? 'bg-gray-100 text-[#0B0C10] font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-[#0B0C10]'}`}>
    <div className={`flex items-center ${collapsed ? 'md:gap-0 gap-3' : 'gap-3'}`}>
        <span className={`text-xl shrink-0 ${active ? 'text-[#0B0C10]' : 'text-gray-400 group-hover:text-[#0B0C10]'}`}>{icon}</span>
        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[200px] opacity-100'}`}>{label}</span>
    </div>
    {badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all duration-300 ${collapsed ? 'md:hidden' : ''} ${active ? 'bg-gray-200 text-[#0B0C10]' : 'bg-gray-200 text-[#0B0C10]'}`}>{badge}</span>}
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

const SettingsSection = ({ user }: { user: any }) => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [requestDeleteOtp, { isLoading: isRequestingOtp }] = useRequestDeleteOtpMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleDeleteRequest = async () => {
    try {
      await requestDeleteOtp({ _id: user._id }).unwrap();
      toast.success('OTP sent to your email.');
      setOtpSent(true);
    } catch (err) {
      toast.error('Failed to send OTP.');
    }
  };

  const handleAccountDelete = async () => {
    if (!otp) return toast.error('Please enter the OTP.');
    try {
      await deleteAccount({ _id: user._id, otp }).unwrap();
      toast.success('Account deleted successfully. You will be logged out.');
      localStorage.removeItem('profile');
      router.push('/');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#121212] mb-6">Account Settings</h3>
        <div className="border-2 border-red-200 border-dashed rounded-2xl p-6">
          <h4 className="font-bold text-red-700">Delete Account</h4>
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Once you delete your account, you will be logged out and will not be able to log in again. This action is irreversible.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up">
            <h3 className="text-xl font-bold text-red-600 mb-2">Are you absolutely sure?</h3>
            {!otpSent ? (
              <>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone. We will send an OTP to your email to confirm this action.</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={handleDeleteRequest} disabled={isRequestingOtp} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50">
                    {isRequestingOtp ? 'Sending OTP...' : 'Send OTP & Continue'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">An OTP has been sent to your email. Please enter it below to permanently delete your account.</p>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 text-center tracking-[0.5em] font-bold text-lg"
                  maxLength={6}
                />
                <div className="flex gap-3">
                  <button onClick={() => { setIsDeleteModalOpen(false); setOtpSent(false); setOtp(''); }} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={handleAccountDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50">
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CountdownTimer = ({ targetDate }: any) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!targetDate) return;

    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return null;
    }
    return (
      <div key={interval} className="text-center">
        <div className="text-lg sm:text-xl font-bold text-[#0B0C10]">{timeLeft[interval as keyof typeof timeLeft]}</div>
        <div className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-500">{interval}</div>
      </div>
    );
  });

  return <div className="flex items-center gap-3 sm:gap-4">{timerComponents.length ? timerComponents : <span className="text-sm font-bold text-red-500">Time's up!</span>}</div>;
};

const ApplicationRow = ({ title, company, logo, status, date, detail, isVerifiedEmployer }: any) => {
  let statusConfig = { color: 'text-gray-500 bg-gray-100 border-gray-200', icon: <FaSpinner className="animate-spin" /> };
  if (status === 'Applied') statusConfig = { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <FaCheckCircle /> };
  if (status === 'Reviewing') statusConfig = { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <FaEye /> };
  if (status === 'Selected') statusConfig = { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <FaCheckCircle /> };
  if (status === 'Interview') statusConfig = { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <FaClock /> };
  if (status === 'Rejected') statusConfig = { color: 'text-red-600 bg-red-50 border-red-200', icon: <FaTimesCircle /> };
  if (status === 'Offered') statusConfig = { color: 'text-green-600 bg-green-50 border-green-200', icon: <FaCheckCircle /> };
  return (
      <div className="flex flex-col p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-bold text-[#0B0C10] group-hover:bg-[#0B0C10] group-hover:text-[#e49d04] transition-colors">{logo}</div>
              <div>
                  <h4 className="font-bold text-[#121212] text-sm md:text-base group-hover:text-[#cc8c03] transition-colors">{title}</h4>
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
        {status === 'Interview' && detail?.interviewDate && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-3">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0B0C10]/5 p-4 rounded-xl border border-gray-200 gap-3">
               <div><p className="text-xs font-bold text-[#0B0C10] uppercase tracking-wider mb-1">Interview Scheduled</p><p className="text-sm font-medium text-gray-700">{new Date(detail.interviewDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p></div>
               <CountdownTimer targetDate={detail.interviewDate} />
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
               <p className="mb-2"><span className="font-bold text-[#0B0C10]">Meeting Link:</span> <a href={detail.interviewLink} target="_blank" className="text-blue-600 hover:underline font-medium break-all">{detail.interviewLink}</a></p>
               <p><span className="font-bold text-[#0B0C10]">Instructions:</span> <span className="text-gray-600">{detail.interviewDescription || 'None provided.'}</span></p>
             </div>
          </div>
        )}
      </div>
  );
};

const RecommendedJobCard = ({ job, onViewDetails, isSaved, onToggleSave, onViewCompany, isVerifiedEmployer, title: propTitle, company: propCompany, logo: propLogo, location: propLocation, salary: propSalary, tags: propTags }: any) => {
  const title = job?.title || propTitle;
  const employerId = job?.employerId;
  const company = job ? (employerId?.companyName || employerId?.name || 'Company') : propCompany;
  const logo = job ? company.charAt(0).toUpperCase() : propLogo;
  const salary = job ? `$${job.salaryMin} - $${job.salaryMax}` : propSalary;
  const tags = job ? (job.skills?.slice(0, 3) || []) : propTags;
  const verified = job ? (employerId?.gstVerificationStatus === 'approved') : isVerifiedEmployer;
  const location = job?.location || propLocation;
  const handleCompanyClick = (e: React.MouseEvent) => { e.stopPropagation(); if (employerId?._id && onViewCompany) onViewCompany(employerId._id); };
  return (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-lg font-bold text-[#0B0C10] flex-shrink-0">{logo}</div>
              <div className="min-w-0">
                  <h4 className="font-bold text-[#121212] text-sm group-hover:text-[#0B0C10] transition-colors truncate">{title}</h4>
                  <span onClick={handleCompanyClick} className="text-xs font-medium text-gray-500 hover:underline hover:text-[#e49d04] transition-colors truncate block cursor-pointer">{company}</span>
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
      <div className="mt-auto"><button onClick={onViewDetails} className="w-full py-2.5 bg-slate-50 text-[#0B0C10] font-bold text-sm rounded-xl hover:bg-[#0B0C10] hover:text-[#e49d04] transition-colors border border-slate-100 group-hover:border-[#0B0C10]">View Job Details</button></div>
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
                  color: '#e49d04',
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
          <div className="bg-[#e49d04] p-2 rounded-xl shadow-md"><FaBriefcase className="text-[#0B0C10] text-sm" /></div>
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
        <button onClick={handleApply} disabled={isApplying} className="px-8 py-3 bg-[#e49d04] text-[#0B0C10] font-black rounded-xl hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm disabled:opacity-50">
          {isApplying ? 'Applying...' : 'Apply Now'} <FaArrowRight />
        </button>
      </div>
    </div>
  </div>
  );
};

const SmartApplySuccessModal = ({ data, onClose }: { data: {city: string, roles: number} | null, onClose: () => void }) => {
    if (!data) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up p-8 text-center">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#121212] mb-2">Applications Scaled</h2>
                <p className="text-gray-600 mb-6">
                    Success. Your resume is now in the priority queue for all <strong>{data.roles}</strong> roles across <strong>{data.city}</strong>.
                </p>
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-[#e49d04] text-[#0B0C10] font-bold rounded-xl hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

const ResumeUploadModal = ({ user, setUser, jobToApply, onClose, onUploadComplete }: any) => {
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

      if (jobToApply) {
        await applyForJob({ jobId: jobToApply._id, candidateId: updatedUser._id }).unwrap();
        toast.success(`🎉 Successfully applied for ${jobToApply.title}! The employer has been notified.`, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#0B0C10',
            color: '#e49d04',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '12px',
          },
        });
      }

      if (onUploadComplete) onUploadComplete();

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
          <p className="text-sm text-gray-500 mt-1">
            You need to upload a resume to continue{jobToApply ? ` with your application for "${jobToApply.title}"` : ''}.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resume (PDF, DOC, DOCX)</label>
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 focus:outline-none" />
          </div>
        </div>
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={handleUploadAndApply} disabled={isUploading || isApplying} className="px-5 py-2.5 text-sm font-bold text-[#0B0C10] bg-[#e49d04] rounded-xl hover:bg-[#cc8c03] shadow-md disabled:opacity-50">
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
  const [incrementProfileView] = useIncrementProfileViewMutation();

  useEffect(() => {
    if (companyId && user?._id) {
      incrementProfileView({ id: companyId, viewerId: user._id });
    }
  }, [companyId, user?._id, incrementProfileView]);
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
                  <div className="flex-1 mt-2 md:mt-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#121212] flex items-center flex-wrap gap-3">
                      {company.companyName}
                      {company.gstVerificationStatus === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-50 text-green-700 text-xs font-black uppercase tracking-wider border border-green-200 shadow-sm"><FaCheckCircle size={14} /> Verified</span>
                      )}
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">{company.tagline || 'Leading the way in innovation.'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-gray-500">
                      {company.location && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaMapMarkerAlt className="text-[#0B0C10]" /> {company.location}</span>}
                      {company.industry && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaBuilding className="text-[#0B0C10]" /> {company.industry}</span>}
                      {company.companySize && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaUsers className="text-[#0B0C10]" /> {company.companySize}</span>}
                      {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0B0C10] hover:underline bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaGlobe /> Website</a>}
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaEye className="text-[#0B0C10]" /> {company.profileViews || 0} Views</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex-shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <button onClick={handleFollowToggle} disabled={isFollowingLoading} className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 ${isFollowing ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-[#e49d04] text-[#0B0C10] shadow-lg shadow-[#e49d04]/20'}`}>
                    {isFollowingLoading ? <FaSpinner className="animate-spin" /> : (isFollowing ? <><FaCheck /> Following</> : <><FaPlus /> Follow</>)}
                  </button>
                  {isFollowing && (
                    <button onClick={() => onMessageClick(company)} className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm bg-[#0B0C10] text-[#e49d04] hover:bg-[#1F2833] border border-transparent">
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
                    <div className="space-y-4">{jobs.map((job: any) => (<div key={job._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h3 className="font-bold text-[#121212]">{job.title}</h3><p className="text-xs text-gray-500 mt-1">{job.location} • {job.workMode} • ${job.salaryMin}-${job.salaryMax}</p></div><button onClick={() => { onClose(); onJobClick(job); }} className="px-5 py-2 bg-white border border-gray-200 text-[#0B0C10] text-sm font-bold rounded-xl hover:bg-[#e49d04] hover:border-[#e49d04] shadow-sm transition-colors whitespace-nowrap">View Details</button></div>))}</div>
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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex h-[650px] overflow-hidden animate-fade-in-up relative">
      {/* Left Sidebar - Connections List */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex-col bg-white z-10 flex-shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-gray-100 space-y-4">
          <h3 className="font-bold text-xl text-[#121212]">Messages</h3>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04]/50 transition-all focus:bg-white focus:border-[#e49d04]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {filteredCompanies.map((company: any) => (
            <div
              key={company._id}
              onClick={() => setSelectedUser(company)}
              className={`flex items-center gap-4 cursor-pointer p-4 transition-colors border-b border-gray-50/50 ${selectedUser?._id === company._id ? "bg-slate-50 border-l-4 border-l-[#e49d04]" : "border-l-4 border-l-transparent hover:bg-gray-50"}`}
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[#0B0C10] flex-shrink-0 overflow-hidden shadow-sm">
                {company.profilePicture ? (
                  <img src={company.profilePicture} alt="" className="w-full h-full rounded-full object-cover"/>
                ) : (
                  (company.companyName?.charAt(0) || company.name?.charAt(0) || 'C').toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#121212] truncate">{company.companyName || company.name}</h4>
                <p className="text-xs text-gray-500 truncate mt-0.5">Employer</p>
              </div>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500 w-full">
              {searchQuery ? "No companies found." : "No connections yet."}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col bg-[#F8FAFC] ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-4 shadow-sm z-10">
               <button onClick={() => setSelectedUser(null)} className="md:hidden text-gray-500 hover:text-[#0B0C10] p-2 -ml-2 transition-colors">
                 <FaChevronLeft size={18} />
               </button>
               <div className="w-11 h-11 bg-[#0B0C10] text-[#e49d04] rounded-full flex items-center justify-center font-bold shadow-md overflow-hidden shrink-0">
                 {selectedUser.profilePicture ? <img src={selectedUser.profilePicture} alt="" className="w-full h-full rounded-full object-cover"/> : (selectedUser.companyName?.charAt(0) || selectedUser.name?.charAt(0) || 'C').toUpperCase()}
               </div>
               <div>
                 <h3 className="font-bold text-base text-[#121212] leading-tight">{selectedUser.companyName || selectedUser.name}</h3>
                 <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</p>
               </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {messages.map((msg: any) => {
                const isMine = String(msg.senderId) === String(user._id);
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMine ? 'bg-[#0B0C10] text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                      <p className="leading-relaxed">{msg.message}</p>
                      {isMine && (
                        <div className="text-right text-[10px] mt-2 -mb-1 flex items-center justify-end gap-1.5 opacity-70">
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
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-3 items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 border border-transparent rounded-full px-6 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B0C10] focus:bg-white transition-all"
              />
              <button onClick={handleSend} disabled={isSending} className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e49d04] text-[#0B0C10] font-bold hover:bg-[#cc8c03] shadow-md shadow-[#e49d04]/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="-ml-1" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#F8FAFC]">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <MdMessage className="text-5xl text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-[#121212] mb-2">Your Messages</h3>
            <p className="text-sm text-gray-500">
              Select a conversation from the left to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const JobAlertsSection = ({ user }: { user: any }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let apiUrl = 'http://localhost:5000';
  if (typeof window !== 'undefined') {
    apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`);
    if (window.location.protocol === 'https:' && apiUrl.startsWith('http://')) apiUrl = apiUrl.replace('http://', 'https://');
  }

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${apiUrl}/alerts/${user._id}`);
      if (res.ok) setAlerts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [user._id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword && !location) return toast.error('Please provide a keyword or location');
    setIsCreating(true);
    try {
      const res = await fetch(`${apiUrl}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, keyword, location })
      });
      if (res.ok) {
        toast.success('Job alert created successfully!');
        setKeyword(''); setLocation(''); fetchAlerts();
      } else { toast.error('Failed to create alert'); }
    } catch (err) { toast.error('Error creating alert'); } 
    finally { setIsCreating(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/alerts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Alert removed');
        setAlerts(alerts.filter(a => a._id !== id));
      }
    } catch (err) { toast.error('Error removing alert'); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#121212]">Job Alerts</h2>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#121212] mb-6">Create New Alert</h3>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Keyword / Job Title</label><input type="text" placeholder="e.g. Frontend Developer" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e49d04] text-sm" /></div>
          <div className="w-full md:flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label><input type="text" placeholder="e.g. New York, Remote" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e49d04] text-sm" /></div>
          <button type="submit" disabled={isCreating} className="w-full md:w-auto px-8 py-3 bg-[#e49d04] text-[#0B0C10] font-bold rounded-xl hover:bg-[#cc8c03] transition-colors shadow-md disabled:opacity-50 h-[46px]">{isCreating ? 'Saving...' : 'Create Alert'}</button>
        </form>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#121212] mb-6">Your Active Alerts</h3>
        {isLoading ? (
          <div className="text-center py-8"><FaSpinner className="animate-spin text-2xl text-gray-300 mx-auto" /></div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div><h4 className="font-bold text-[#121212]">{alert.keyword || 'Any Role'}</h4><p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><FaMapMarkerAlt className="text-[#e49d04]"/> {alert.location || 'Any Location'}</p></div>
                <div className="flex items-center gap-4"><span className="hidden sm:inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Active (Daily)</span><button onClick={() => handleDelete(alert._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTimes /></button></div>
              </div>
            ))}
          </div>
        ) : (<div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl"><FaBell className="text-4xl text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">You don't have any job alerts set up yet.</p></div>)}
      </div>
    </div>
  );
};

export default CandidateDashboard;
function useIncrementProfileViewMutation(): [any] {
  const incrementProfileView = async (params: { id: string; viewerId: string }) => {
    try {
      const response = await fetch(`/api/companies/${params.id}/increment-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewerId: params.viewerId }),
      });
      if (!response.ok) {
        throw new Error('Failed to increment profile view');
      }
    } catch (error) {
      console.error('Error incrementing profile view:', error);
    }
  };
  return [incrementProfileView];
}

const InteractiveJobMap = ({ onSelectCity }: { onSelectCity: (pin: { name: string; jobs: number }) => void }) => {
  const [selectedState, setSelectedState] = useState<string>('India');
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [zoom, setZoom] = useState<number>(5);
  const [mapData, setMapData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const L = (await import('leaflet')).default || await import('leaflet');
        const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet');

        if (!isMounted) return;

        const customIcon = new L.Icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const MapController = ({ centerPos, zoomLevel }: { centerPos: [number, number], zoomLevel: number }) => {
          const map = useMap();
          useEffect(() => {
            map.flyTo(centerPos, zoomLevel, { duration: 1.5 });
          }, [centerPos, zoomLevel, map]);
          return null;
        };

        setMapData({ MapContainer, TileLayer, Marker, Popup, MapController, customIcon });
      } catch (err) {
        console.error("Failed to load map modules", err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const locations: any = {
    'India': { center: [20.5937, 78.9629], zoom: 5 },
    'Punjab': { center: [31.1471, 75.3412], zoom: 8 },
    'Maharashtra': { center: [19.7515, 75.7139], zoom: 7 },
    'Karnataka': { center: [15.3173, 75.7139], zoom: 7 },
    'Delhi': { center: [28.7041, 77.1025], zoom: 10 }
  };

  const pins = [
    { name: 'Amritsar', pos: [31.6340, 74.8723], jobs: 123, state: 'Punjab' },
    { name: 'Jalandhar', pos: [31.3260, 75.5762], jobs: 43, state: 'Punjab' },
    { name: 'Ludhiana', pos: [30.9010, 75.8573], jobs: 71, state: 'Punjab' },
    { name: 'Patiala', pos: [30.3398, 76.3869], jobs: 6, state: 'Punjab' },
    { name: 'Chandigarh', pos: [30.7333, 76.7794], jobs: 89, state: 'Punjab' },
    { name: 'Mumbai', pos: [19.0760, 72.8777], jobs: 1205, state: 'Maharashtra' },
    { name: 'Pune', pos: [18.5204, 73.8567], jobs: 380, state: 'Maharashtra' },
    { name: 'Bangalore', pos: [12.9716, 77.5946], jobs: 980, state: 'Karnataka' },
    { name: 'New Delhi', pos: [28.6139, 77.2090], jobs: 850, state: 'Delhi' }
  ];

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedState(val);
    setCenter(locations[val].center);
    setZoom(locations[val].zoom);
  };

  const visiblePins = selectedState === 'India' ? pins : pins.filter((p: any) => p.state === selectedState);

  if (!mapData) {
    return <div className="w-full h-[600px] bg-gray-100 border border-gray-200 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold mt-6 shadow-sm">Loading Interactive Map...</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup, MapController, customIcon } = mapData;

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-sm border border-gray-200 mt-6 z-0">
      <div className="absolute top-6 right-6 z-[1000] bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="font-bold text-[#121212] mb-2 text-sm">Select Region</h3>
        <select value={selectedState} onChange={handleStateChange} className="w-full bg-gray-50 text-[#121212] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e49d04] cursor-pointer">
          <option value="India">All India</option>
          <option value="Punjab">Punjab</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Delhi">Delhi NCR</option>
        </select>
      </div>

      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
        <MapController centerPos={center} zoomLevel={zoom} />
        {visiblePins.map((pin: any, idx: number) => (
          <Marker key={idx} position={pin.pos as [number, number]} icon={customIcon}>
            <Popup className="custom-popup rounded-2xl">
              <div className="text-center p-1 min-w-[120px]">
                <h4 className="font-bold text-[#121212] text-base">{pin.name}</h4>
                <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-lg text-xs font-bold my-2">{pin.jobs} Priority Openings</div>
                <button onClick={() => onSelectCity(pin)} className="w-full bg-[#0B0C10] text-[#e49d04] text-xs font-bold py-2 rounded-xl hover:bg-gray-800 transition-colors shadow-md">Smart Apply</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
