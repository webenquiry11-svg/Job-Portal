'use client';

import React, { useEffect, useState } from 'react';
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
  FaFilter
} from 'react-icons/fa';
import { MdDashboard, MdMenu, MdSettings } from 'react-icons/md';
import CandidateProfile from '../../Condidate/CondidateProfile/page';
import toast from 'react-hot-toast';
import { useGetAllJobsQuery } from '@/features/jobapi';

const CandidateDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  const { data: allJobs = [], isLoading: isLoadingJobs } = useGetAllJobsQuery({});

  useEffect(() => {
    // Check for authentication and role
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedUser = JSON.parse(profile);
        const userData = parsedUser.result || parsedUser; 
        
        if (userData.role !== 'seeker') {
          router.push('/'); // Redirect if not a seeker
        } else {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push('/');
      }
    } else {
      router.push('/'); // Redirect if not logged in
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Load saved jobs from local storage when the dashboard loads
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

  const filteredJobs = allJobs.filter((job: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(query) ||
      job.employerId?.companyName?.toLowerCase().includes(query) ||
      job.employerId?.name?.toLowerCase().includes(query) ||
      job.skills?.some((s: string) => s.toLowerCase().includes(query)) ||
      job.location?.toLowerCase().includes(query)
    );
  });

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
        <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex-col fixed h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all duration-300 ease-in-out flex ${isSidebarCollapsed ? 'w-72 md:w-20' : 'w-72'}`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-[#0F172A] hover:shadow-md transition-all z-50 cursor-pointer"
        >
          <FaChevronLeft className={`text-[10px] transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className={`p-8 flex items-center gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'md:justify-center md:px-4' : ''}`}>
           <div className="bg-[#0F172A] p-2.5 rounded-xl shadow-lg shadow-slate-900/20 flex-shrink-0">
             <FaBriefcase className="text-white text-lg" />
           </div>
           <span className={`text-xl font-bold text-[#121212] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-xs opacity-100'}`}>Job<span className="text-[#0F172A]">Portal</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Menu</p>
          <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBookmark />} label="Saved Jobs" active={activeTab === 'saved'} onClick={() => { setActiveTab('saved'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBriefcase />} label="My Applications" active={activeTab === 'applications'} onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} badge="3" collapsed={isSidebarCollapsed} />
          
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
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 -ml-2 text-gray-500 hover:text-[#0F172A] hover:bg-slate-50 rounded-full">
                  <MdMenu size={22} />
              </button>
              <h1 className="text-2xl font-bold text-[#121212] capitalize whitespace-nowrap">{activeTab.replace('-', ' ')}</h1>
            </div>
            
            {/* Search Bar - Top Center */}
            <div className="flex-1 w-full md:w-auto order-last md:order-none max-w-2xl mx-auto md:px-6 relative">
              <div className="relative group flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 group-focus-within:text-[#0F172A] transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search jobs by title, skills, or company..." 
                  className="w-full pl-11 pr-12 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Filter Jobs"
                  className="absolute right-2 p-1.5 text-gray-400 hover:text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all"
                >
                  <FaFilter />
                </button>
              </div>

              {/* Filter Dropdown */}
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
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all">
                          <option value="">All Industries</option>
                          <option value="IT Services">IT Services</option>
                          <option value="Advertising">Advertising</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Work Mode</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all">
                          <option value="">All Modes</option>
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Experience Level</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all">
                          <option value="">Any Experience</option>
                          <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                          <option value="Mid Level (3-5 Yrs)">Mid Level (3-5 Yrs)</option>
                          <option value="Senior Level (5+ Yrs)">Senior Level (5+ Yrs)</option>
                        </select>
                      </div>
                      
                      <div className="pt-2 flex gap-3">
                        <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">
                          Clear
                        </button>
                        <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2.5 bg-[#0F172A] text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-[#0F172A] hover:border-slate-200 hover:shadow-md transition-all relative">
              <FaBell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group focus:outline-none"
              >
                 <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                   {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase() || 'U'}
                 </div>
                 <div className="hidden sm:block text-left">
                   <p className="text-sm font-bold text-[#121212] leading-none group-hover:text-[#0F172A] transition-colors">{user?.name || 'Candidate'}</p>
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
                    <button onClick={() => { setActiveTab('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] transition-colors flex items-center gap-3"><FaUserCircle className="text-lg" /> My Profile</button>
                    <button onClick={() => { setActiveTab('settings'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] transition-colors flex items-center gap-3"><MdSettings className="text-lg" /> Settings</button>
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

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FaBriefcase />} label="Applied Jobs" value="12" color="bg-blue-100 text-blue-600" />
                <StatCard icon={<FaBookmark />} label="Saved Jobs" value={savedJobIds.length.toString()} color="bg-amber-100 text-amber-500" />
                <StatCard icon={<FaClock />} label="Interviews" value="2" color="bg-green-100 text-green-600" />
                <StatCard icon={<FaEye />} label="Profile Views" value="84" color="bg-purple-100 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Applications Column */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#121212]">Recent Applications</h3>
                    <button onClick={() => setActiveTab('applications')} className="text-sm font-bold text-[#0F172A] hover:text-slate-700">View All</button>
                  </div>
                  <div className="space-y-4">
                    <ApplicationRow title="Frontend Developer" company="TechCorp Inc." logo="T" status="Interview" date="Oct 24" />
                    <ApplicationRow title="UI/UX Designer" company="CreativeStudio" logo="C" status="Applied" date="Oct 20" />
                    <ApplicationRow title="React Engineer" company="Global Systems" logo="G" status="Rejected" date="Oct 15" />
                    <ApplicationRow title="Full Stack Developer" company="InnovateTech" logo="I" status="Offered" date="Oct 10" />
                  </div>
                </div>

                {/* Recommended Jobs Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#121212]">Recommended for you</h3>
                  </div>
                  <div className="space-y-4">
                    {isLoadingJobs ? (
                      <p className="text-sm text-gray-500 animate-pulse">Loading jobs...</p>
                    ) : filteredJobs.length > 0 ? (
                      filteredJobs.map((job: any) => (
                        <RecommendedJobCard 
                          key={job._id}
                          title={job.title} 
                          company={job.employerId?.companyName || job.employerId?.name || 'Company'} 
                          location={job.location} 
                          salary={`$${job.salaryMin} - $${job.salaryMax}`} 
                          tags={job.skills?.slice(0, 3) || []} 
                          logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} 
                          onViewDetails={() => setSelectedJob(job)}
                          isSaved={savedJobIds.includes(job._id)}
                          onToggleSave={() => toggleSaveJob(job._id)}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {searchQuery ? "No jobs match your search criteria." : "No jobs available right now."}
                      </p>
                    )}
                  </div>
                </div>
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
                      title={job.title} 
                      company={job.employerId?.companyName || job.employerId?.name || 'Company'} 
                      location={job.location} 
                      salary={`$${job.salaryMin} - $${job.salaryMax}`} 
                      tags={job.skills?.slice(0, 3) || []} 
                      logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} 
                      onViewDetails={() => setSelectedJob(job)}
                      isSaved={true}
                      onToggleSave={() => toggleSaveJob(job._id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <FaBookmark className="text-5xl text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">You haven't saved any jobs yet.</p>
                    <button onClick={() => setActiveTab('dashboard')} className="mt-4 px-6 py-2 bg-[#0F172A] text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">Explore Jobs</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && <CandidateProfile user={user} setUser={setUser} />}

          {activeTab !== 'dashboard' && activeTab !== 'profile' && activeTab !== 'saved' && (
             <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
               <FaBriefcase className="text-6xl text-slate-200 mb-4" />
               <h2 className="text-xl font-bold text-[#121212] capitalize">{activeTab.replace('-', ' ')}</h2>
               <p className="text-gray-500 text-sm mt-2">This section is currently under development.</p>
             </div>
          )}
        </div>
      </main>
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick, badge, collapsed }: any) => (
  <button 
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center justify-between py-3.5 rounded-xl transition-all duration-200 font-medium group relative ${collapsed ? 'md:px-0 md:justify-center px-4' : 'px-4'} ${active ? 'bg-[#0F172A] text-white shadow-lg shadow-slate-900/30' : 'text-gray-500 hover:bg-slate-50 hover:text-[#0F172A]'}`}
  >
    <div className={`flex items-center ${collapsed ? 'md:gap-0 gap-3' : 'gap-3'}`}>
        <span className={`text-xl flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#0F172A]'}`}>{icon}</span>
        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[200px] opacity-100'}`}>{label}</span>
    </div>
    {badge && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all duration-300 ${collapsed ? 'md:hidden' : ''} ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#0F172A]'}`}>
            {badge}
        </span>
    )}
    {badge && collapsed && (
        <span className="hidden md:block absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
    )}
  </button>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
    </div>
    <h3 className="text-3xl font-bold text-[#121212] mb-1">{value}</h3>
    <p className="text-sm font-medium text-gray-400">{label}</p>
  </div>
);

const ApplicationRow = ({ title, company, logo, status, date }: any) => {
  let statusConfig = { color: 'text-gray-500 bg-gray-100 border-gray-200', icon: <FaSpinner className="animate-spin" /> };
  if (status === 'Applied') statusConfig = { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <FaCheckCircle /> };
  if (status === 'Interview') statusConfig = { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <FaClock /> };
  if (status === 'Rejected') statusConfig = { color: 'text-red-600 bg-red-50 border-red-200', icon: <FaTimesCircle /> };
  if (status === 'Offered') statusConfig = { color: 'text-green-600 bg-green-50 border-green-200', icon: <FaCheckCircle /> };

  return (
      <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-bold text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
                  {logo}
              </div>
              <div>
                  <h4 className="font-bold text-[#121212] text-sm md:text-base group-hover:text-[#0F172A] transition-colors">{title}</h4>
                  <p className="text-xs font-medium text-gray-500">{company}</p>
              </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:block text-right">
                  <span className="text-[10px] font-bold text-gray-400 block mb-0.5 uppercase tracking-wider">Applied</span>
                  <span className="text-xs font-medium text-[#121212]">{date}</span>
              </div>
              <div className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-bold flex items-center gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon} <span className="hidden sm:inline">{status}</span>
              </div>
          </div>
      </div>
  );
};

const RecommendedJobCard = ({ title, company, location, salary, tags, logo, onViewDetails, isSaved, onToggleSave }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-lg font-bold text-[#0F172A]">
                  {logo}
              </div>
              <div>
                  <h4 className="font-bold text-[#121212] text-sm group-hover:text-[#0F172A] transition-colors">{title}</h4>
                  <p className="text-xs font-medium text-gray-500">{company}</p>
              </div>
          </div>
          <button onClick={onToggleSave} className={`transition-colors ${isSaved ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-[#0F172A]'}`}>
              <FaBookmark />
          </button>
      </div>
      <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center text-xs text-gray-500"><FaMapMarkerAlt className="mr-2" /> {location}</div>
          <div className="flex items-center text-xs text-gray-500"><FaMoneyBillWave className="mr-2" /> {salary}</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag: string, i: number) => (
              <span key={i} className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-100">{tag}</span>
          ))}
      </div>
      <button onClick={onViewDetails} className="w-full py-2.5 bg-slate-50 text-[#0F172A] font-bold text-sm rounded-xl hover:bg-[#0F172A] hover:text-white transition-colors border border-slate-100 group-hover:border-[#0F172A]">
          View Job Details
      </button>
  </div>
);

const JobDetailsModal = ({ job, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        <div className="p-6 md:px-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-bold text-[#121212] flex items-center gap-3">
            <div className="bg-[#0F172A] p-2 rounded-xl shadow-md">
              <FaBriefcase className="text-white text-sm" />
            </div>
            Job Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <h3 className="text-3xl font-bold text-[#0F172A]">{job.title}</h3>
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
          
          <div className="mt-6 flex items-center gap-4">
            {job.immediateJoiner && (
               <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold">Immediate Joiner Required</span>
            )}
            <span className="text-xs font-medium text-gray-500">Contact via: <span className="font-bold text-gray-700">{job.contactPreference}</span></span>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-3xl">
          <button className="px-8 py-3 bg-[#0F172A] text-white font-black rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
             Apply Now <FaArrowRight />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateDashboard;