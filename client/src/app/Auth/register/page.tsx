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
  FaEye
} from 'react-icons/fa';
import { MdDashboard, MdMenu, MdSettings } from 'react-icons/md';
import { useGetAllJobsQuery } from '@/features/jobapi';

const CandidateDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('profile');
    router.push('/');
  };

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
          <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBookmark />} label="Saved Jobs" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaBriefcase />} label="My Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} badge="3" collapsed={isSidebarCollapsed} />
          
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Account</p>
          <SidebarItem icon={<FaUserCircle />} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<MdSettings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} collapsed={isSidebarCollapsed} />
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
        <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-md px-6 py-4 lg:px-10 border-b border-gray-200/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 -ml-2 text-gray-500 hover:text-[#0F172A] hover:bg-slate-50 rounded-full">
                <MdMenu size={22} />
            </button>
            <h1 className="text-2xl font-bold text-[#121212] capitalize">{activeTab.replace('-', ' ')}</h1>
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
                 <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                   {user?.name?.charAt(0).toUpperCase() || 'U'}
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
                <StatCard icon={<FaBookmark />} label="Saved Jobs" value="8" color="bg-amber-100 text-amber-500" />
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
                    ) : allJobs.length > 0 ? (
                      allJobs.map((job: any) => (
                        <RecommendedJobCard 
                          key={job._id}
                          title={job.title} 
                          company={job.employerId?.companyName || job.employerId?.name || 'Company'} 
                          location={job.location} 
                          salary={`$${job.salaryMin} - $${job.salaryMax}`} 
                          tags={job.skills?.slice(0, 3) || []} 
                          logo={(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()} 
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No jobs available right now.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
             <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
               <FaBriefcase className="text-6xl text-slate-200 mb-4" />
               <h2 className="text-xl font-bold text-[#121212] capitalize">{activeTab.replace('-', ' ')}</h2>
               <p className="text-gray-500 text-sm mt-2">This section is currently under development.</p>
             </div>
          )}
        </div>
      </main>
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

const RecommendedJobCard = ({ title, company, location, salary, tags, logo }: any) => (
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
          <button className="text-gray-300 hover:text-[#0F172A] transition-colors">
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
      <button className="w-full py-2.5 bg-slate-50 text-[#0F172A] font-bold text-sm rounded-xl hover:bg-[#0F172A] hover:text-white transition-colors border border-slate-100 group-hover:border-[#0F172A]">
          View Job Details
      </button>
  </div>
);

export default CandidateDashboard;