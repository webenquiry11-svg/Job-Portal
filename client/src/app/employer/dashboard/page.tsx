'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaBriefcase, 
  FaUsers, 
  FaFileAlt, 
  FaEye, 
  FaPlus, 
  FaSearch, 
  FaBell, 
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaEllipsisH,
  FaArrowUp,
  FaArrowDown,
  FaRegEye,
  FaRegCommentDots,
  FaCheck,
  FaChevronLeft,
  FaTimes,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import { MdDashboard, MdMenu, MdMessage, MdSettings, MdWork } from 'react-icons/md';
import CompanyProfile from '../Profile/page';
import { useGetJobsByEmployerQuery, usePostJobMutation } from '@/features/jobapi';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const { data: jobs = [], isLoading: isLoadingJobs } = useGetJobsByEmployerQuery(user?._id, {
    skip: !user?._id,
  });

  useEffect(() => {
    // Check for authentication and role
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedUser = JSON.parse(profile);
        // Access the user object from the 'result' key as per AuthController
        const userData = parsedUser.result || parsedUser; 
        
        if (userData.role !== 'employer') {
          router.push('/'); // Redirect if not an employer
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
          <div className="h-12 w-12 bg-violet-200 rounded-full mb-4"></div>
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
        {/* Collapse Toggle Button (Desktop Only) */}
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
          <SidebarItem icon={<MdWork />} label="My Jobs" active={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaUsers />} label="Applications" active={activeTab === 'applications'} onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} badge="12" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<MdMessage />} label="Messages" active={activeTab === 'messages'} onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaChartLine />} label="Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Account</p>
          <SidebarItem icon={<FaUserCircle />} label="Company Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
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
        <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-md px-6 py-4 lg:px-10 border-b border-gray-200/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 -ml-2 text-gray-500 hover:text-[#0F172A] hover:bg-slate-50 rounded-full">
                <MdMenu size={22} />
            </button>
            <h1 className="text-2xl font-bold text-[#121212]">{activeTab === 'profile' ? 'Company Profile' : activeTab === 'jobs' ? 'My Jobs' : 'Dashboard'}</h1>
          </div>
          <p className="text-sm text-gray-500 hidden md:block">Welcome back, <span className="font-semibold text-[#121212]">{user?.companyName || user?.name}</span>! Here's your daily overview.</p>
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
                   {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.companyName?.charAt(0).toUpperCase() || 'A'}
                 </div>
                 <div className="hidden sm:block text-left">
                   <p className="text-sm font-bold text-[#121212] leading-none group-hover:text-[#0F172A] transition-colors">{user?.companyName || 'Star Publicity'}</p>
                   <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Employer</p>
                 </div>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-sm font-bold text-[#121212]">{user?.companyName || user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => { setActiveTab('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] transition-colors flex items-center gap-3"><FaUserCircle className="text-lg" /> Company Profile</button>
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

        {/* Scrollable Content */}
        <div className="p-6 lg:p-10 flex-1">

        {activeTab === 'profile' ? (
          <CompanyProfile user={user} setUser={setUser} />
        ) : activeTab === 'jobs' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#121212]">My Jobs</h2>
                <p className="text-sm text-gray-500">Manage all your posted jobs and create new ones.</p>
              </div>
              <button onClick={() => setIsJobModalOpen(true)} className="px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
                <FaPlus className="text-sm" /> Post a New Job
              </button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4 pl-2">Job Title</th>
                      <th className="pb-4">Applicants</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Posted Date</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {jobs.length > 0 ? (
                      jobs.map((job: any) => (
                        <JobRow 
                          key={job._id}
                          title={job.title} 
                          type={job.workMode} 
                          apps="0" 
                          status={job.status || 'Active'} 
                          date={new Date(job.createdAt).toLocaleDateString()} 
                          onClick={() => setSelectedJob(job)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No jobs posted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
          {/* Dashboard Content */}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FaBriefcase />} 
            label="Total Jobs Posted" 
            value={isLoadingJobs ? "..." : jobs.length.toString()} 
            trend="+2 this week" 
            trendUp={true}
            color="bg-slate-100 text-[#0F172A]" 
          />
          <StatCard 
            icon={<FaUsers />} 
            label="Total Applications" 
            value="148" 
            trend="+12% vs last month" 
            trendUp={true}
            color="bg-amber-100 text-[#FACC15]" 
          />
          <StatCard 
            icon={<FaFileAlt />} 
            label="Active Jobs" 
            value={isLoadingJobs ? "..." : jobs.filter((j: any) => j.status !== 'Closed').length.toString()} 
            trend="Same as last week" 
            trendUp={null}
            color="bg-red-100 text-[#EF4444]" 
          />
          <StatCard 
            icon={<FaEye />} 
            label="Profile Views" 
            value="2.4k" 
            trend="+5% vs last month" 
            trendUp={true}
            color="bg-gray-200 text-gray-600" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Applicants Overview Chart */}
            <ApplicantsChart />

            {/* Recent Jobs */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#121212]">Recent Job Postings</h2>
                <p className="text-sm text-gray-500">Manage your active job listings</p>
              </div>
              <button onClick={() => setActiveTab('jobs')} className="text-sm font-bold text-[#0F172A] hover:text-[#1E293B] hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-4 pl-2">Job Title</th>
                    <th className="pb-4">Applicants</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Posted Date</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.length > 0 ? (
                    jobs.slice(0, 5).map((job: any) => (
                      <JobRow 
                        key={job._id}
                        title={job.title} 
                        type={job.workMode} 
                        apps="0" 
                        status={job.status || 'Active'} 
                        date={new Date(job.createdAt).toLocaleDateString()} 
                        onClick={() => setSelectedJob(job)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No jobs posted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity / Candidates */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
             <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#121212]">Recent Applicants</h2>
                <p className="text-sm text-gray-500">Latest candidates applied</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"><FaEllipsisH /></button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <CandidateRow name="Sarah Johnson" role="Senior Software Engineer" time="2h ago" avatar="S" color="bg-[#0F172A]" />
              <CandidateRow name="Michael Chen" role="Product Designer" time="5h ago" avatar="M" color="bg-[#FACC15]" />
              <CandidateRow name="David Smith" role="Marketing Manager" time="1d ago" avatar="D" color="bg-[#EF4444]" />
              <CandidateRow name="Emily Davis" role="Frontend Developer" time="1d ago" avatar="E" color="bg-gray-800" />
              <CandidateRow name="James Wilson" role="Senior Software Engineer" time="2d ago" avatar="J" color="bg-[#0F172A]" />
              <CandidateRow name="Anna White" role="Product Manager" time="3d ago" avatar="A" color="bg-[#EF4444]" />
            </div>
            <button className="w-full mt-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm">
                View All Applications
            </button>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#121212]">Action Items</h2>
              <p className="text-sm text-gray-500 mb-6">Your to-do list for today.</p>
              <div className="space-y-2">
                <ToDoItem text="Review 5 new applications for 'Software Engineer'" checked={true} />
                <ToDoItem text="Schedule interview with Michael Chen" />
                <ToDoItem text="Finalize offer for Sarah Johnson" />
                <ToDoItem text="Post new 'UX Designer' role" />
              </div>
            </div>
          </div>
        </div>

        {/* Application Tracking Board */}
        <div className="mt-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#121212]">Application Tracker</h2>
              <p className="text-sm text-gray-500">Drag and drop candidates to update their status.</p>
            </div>
            <button className="text-sm font-bold text-[#0F172A] hover:text-[#1E293B] flex items-center gap-2">
              View All <FaArrowUp className="rotate-45" />
            </button>
          </div>
          <KanbanBoard />
          </div>
          </>
        )}
        </div>
      </main>
      {isJobModalOpen && <JobPostModal onClose={() => setIsJobModalOpen(false)} user={user} />}
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
};

const ApplicantsChart = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-bold text-[#121212]">Applicants Overview</h2>
        <p className="text-sm text-gray-500">Visual representation of applicants over time.</p>
      </div>
      <select className="text-xs font-medium bg-gray-100 border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F172A]">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
      </select>
    </div>
    <div className="h-64 w-full relative">
      {/* Chart Grid Lines */}
      <div className="absolute top-0 left-0 w-full h-full grid grid-rows-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-b border-dashed border-gray-100"></div>
        ))}
      </div>
      {/* Chart SVG */}
      <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <path d="M0,100 C40,80 80,120 120,100 S200,60 240,80 S320,140 360,120 S440,50 480,60 S560,100 600,90"
          fill="url(#chartGradient)"
          stroke="#0F172A"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  </div>
);

// Sub-components for cleaner code

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

const StatCard = ({ icon, label, value, color, trend, trendUp }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendUp === true ? 'bg-green-100 text-green-600' : trendUp === false ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              {trendUp === true && <FaArrowUp />}
              {trendUp === false && <FaArrowDown />}
              <span>{trend}</span>
          </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-[#121212] mb-1">{value}</h3>
    <p className="text-sm font-medium text-gray-400">{label}</p>
  </div>
);

const JobRow = ({ title, type, apps, status, date, onClick }: any) => (
  <tr className="group hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={onClick}>
    <td className="py-5 pl-2">
      <div className="font-bold text-[#121212] group-hover:text-[#0F172A] transition-colors">{title}</div>
      <div className="text-xs font-medium text-gray-400 mt-0.5">{type}</div>
    </td>
    <td className="py-5">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
            {[1,2,3].map(i => <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white"></div>)}
        </div>
        <span className="text-xs font-bold text-gray-600">+{apps}</span>
      </div>
    </td>
    <td className="py-5">
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status === 'Active' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
        {status}
      </span>
    </td>
    <td className="py-5 text-sm font-medium text-gray-400">{date}</td>
    <td className="py-5 text-right pr-2">
        <button className="text-gray-300 hover:text-[#0F172A] transition-colors"><FaEllipsisH /></button>
    </td>
  </tr>
);

const CandidateRow = ({ name, role, time, avatar, color }: any) => (
  <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${color === 'bg-[#FACC15]' ? 'text-[#121212]' : 'text-white'} ${color}`}>
      {avatar}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[#121212] text-sm truncate group-hover:text-[#0F172A] transition-colors">{name}</h4>
      <p className="text-xs font-medium text-gray-400 truncate">Applied for <span className="text-gray-600">{role}</span></p>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap group-hover:opacity-0 transition-opacity">{time}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3">
        <button className="p-2 rounded-lg hover:bg-gray-200"><FaRegEye className="text-gray-500 text-sm" /></button>
        <button className="p-2 rounded-lg hover:bg-gray-200"><FaRegCommentDots className="text-gray-500 text-sm" /></button>
      </div>
    </div>
  </div>
);

const ToDoItem = ({ text, checked = false }: { text: string, checked?: boolean }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#0F172A] border-[#0F172A]' : 'border-2 border-gray-300'}`}>
      {checked && <FaCheck className="text-white text-xs" />}
    </div>
    <p className={`text-sm flex-1 ${checked ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
      {text}
    </p>
  </div>
);

const KanbanBoard = () => {
  const [candidates, setCandidates] = useState([
    { id: '1', name: 'Alice Freeman', role: 'Frontend Dev', status: 'Applied', avatar: 'A', match: 92 },
    { id: '2', name: 'Bob Smith', role: 'Backend Dev', status: 'AI Screened', avatar: 'B', match: 85 },
    { id: '3', name: 'Charlie Brown', role: 'Designer', status: 'Interview', avatar: 'C', match: 78 },
    { id: '4', name: 'David Lee', role: 'Manager', status: 'Offered', avatar: 'D', match: 95 },
    { id: '5', name: 'Eva Green', role: 'Tester', status: 'On Hold', avatar: 'E', match: 64 },
    { id: '6', name: 'Frank White', role: 'DevOps', status: 'Rejected', avatar: 'F', match: 45 },
    { id: '7', name: 'Grace Liu', role: 'Frontend Dev', status: 'Applied', avatar: 'G', match: 88 },
  ]);

  const onDrop = (id: string, newStatus: string) => {
    setCandidates((prev) => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const columns = [
    { id: 'Applied', title: 'Applied', color: 'border-gray-300' },
    { id: 'AI Screened', title: 'AI Screened', color: 'border-[#0F172A]' },
    { id: 'Interview', title: 'Interview', color: 'border-[#FACC15]' },
    { id: 'Offered', title: 'Offered', color: 'border-[#0F172A]' }, // Using primary color for success as green isn't in strict palette, or could revert to green if preferred
    { id: 'On Hold', title: 'On Hold', color: 'border-gray-400' },
    { id: 'Rejected', title: 'Rejected', color: 'border-[#EF4444]' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 w-full">
      {columns.map(col => (
        <KanbanColumn 
          key={col.id} 
          status={col.id} 
          title={col.title} 
          color={col.color}
          candidates={candidates.filter(c => c.status === col.id)} 
          onDrop={onDrop} 
        />
      ))}
    </div>
  );
};

const KanbanColumn = ({ status, title, color, candidates, onDrop }: any) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    const id = e.dataTransfer.getData('id');
    onDrop(id, status);
  };

  return (
    <div 
      onDragOver={handleDragOver} 
      onDrop={handleDrop}
      className={`flex-1 min-w-[150px] bg-gray-50/50 rounded-2xl border-t-4 ${color} p-3 flex flex-col h-[500px]`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-[#121212] text-xs lg:text-sm truncate pr-2">{title}</h3>
        <span className="bg-white text-xs font-bold px-1.5 py-0.5 rounded text-gray-500 shadow-sm">{candidates.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
        {candidates.map((c: any) => <KanbanCard key={c.id} candidate={c} />)}
      </div>
    </div>
  );
};

const KanbanCard = ({ candidate }: any) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('id', candidate.id);
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${candidate.status === 'Rejected' ? 'bg-[#EF4444]' : candidate.status === 'Interview' ? 'bg-[#FACC15]' : 'bg-[#0F172A]'}`}>
          {candidate.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-[#121212] text-xs lg:text-sm group-hover:text-[#0F172A] transition-colors truncate">{candidate.name}</h4>
          <p className="text-[10px] lg:text-xs text-gray-400 truncate">{candidate.role}</p>
        </div>
      </div>
      <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100/50">
          <span className="text-[10px] font-bold text-gray-500">AI Match</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${candidate.match >= 80 ? 'bg-green-100 text-green-700' : candidate.match >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {candidate.match}%
          </span>
      </div>
    </div>
  );
};

const JobPostModal = ({ onClose, user }: any) => {
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [postJob, { isLoading }] = usePostJobMutation();

  const [formData, setFormData] = useState({
    title: '',
    industry: '',
    workMode: 'On-site',
    location: '',
    skills: [] as string[],
    experience: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'Annual',
    description: '',
    screeningQuestion: '',
    immediateJoiner: false,
    contactPreference: 'In-app chat',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim() !== '') {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) });
  };

  const handleSubmit = async () => {
    try {
      const employerId = user?._id;
      await postJob({ ...formData, employerId }).unwrap();
      toast.success('Job Posted & Matched Successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to post job');
    }
  };

  const inputClass = "mt-1.5 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#121212] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 md:px-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-bold text-[#121212] flex items-center gap-3">
            <div className="bg-[#0F172A] p-2 rounded-xl shadow-md">
              <FaBriefcase className="text-white text-sm" />
            </div>
            Post a New Job
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="w-full bg-gray-100 h-1.5">
           <div className="bg-[#0F172A] h-1.5 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-[#121212] mb-4">Step 1: Role Details</h3>
              <div>
                <label className={labelClass}>Job Title</label>
                <input type="text" name="title" placeholder="e.g., Senior UI Designer" className={inputClass} value={formData.title} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <select name="industry" className={inputClass} value={formData.industry} onChange={handleChange}>
                  <option value="">Select Industry</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Advertising">Advertising</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Work Mode</label>
                  <select name="workMode" className={inputClass} value={formData.workMode} onChange={handleChange}>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" name="location" placeholder="e.g., New York, NY" className={inputClass} value={formData.location} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-[#121212] mb-4">Step 2: Skills & Compensation</h3>
              <div>
                <label className={labelClass}>Must-Have Skills (Press Enter to add)</label>
                <div className="mt-1.5 p-2 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#0F172A] transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-[#0F172A] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        {skill} <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                      </span>
                    ))}
                  </div>
                  <input type="text" placeholder="e.g., Figma, React, Copywriting" className="w-full outline-none text-sm p-1" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillAdd} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Experience Level</label>
                <select name="experience" className={inputClass} value={formData.experience} onChange={handleChange}>
                  <option value="">Select Level</option>
                  <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                  <option value="Mid Level (3-5 Yrs)">Mid Level (3-5 Yrs)</option>
                  <option value="Senior Level (5+ Yrs)">Senior Level (5+ Yrs)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Salary Range & Frequency</label>
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-1.5">
                  <input type="number" name="salaryMin" placeholder="Min (e.g., 50000)" className={inputClass} value={formData.salaryMin} onChange={handleChange} />
                  <span className="text-gray-400 font-medium hidden sm:block">-</span>
                  <input type="number" name="salaryMax" placeholder="Max (e.g., 80000)" className={inputClass} value={formData.salaryMax} onChange={handleChange} />
                  <select name="salaryType" className={`${inputClass} sm:!w-40`} value={formData.salaryType} onChange={handleChange}>
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-xl font-bold text-[#121212] mb-1">Step 3: Smart Screening</h3>
              <p className="text-xs text-gray-500 mb-4">Goal: Ask the questions that prevent "fake" matches.</p>
              <div>
                <label className={labelClass}>Job Description</label>
                <textarea name="description" rows={4} placeholder="Describe the responsibilities, perks, and ideal candidate..." className={`${inputClass} resize-none`} value={formData.description} onChange={handleChange}></textarea>
              </div>
              <div>
                <label className={labelClass}>Screening Question</label>
                <input type="text" name="screeningQuestion" placeholder="e.g., Share a link to your best AR/VR project." className={inputClass} value={formData.screeningQuestion} onChange={handleChange} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="immediate" name="immediateJoiner" className="w-5 h-5 accent-[#0F172A] rounded border-gray-300" checked={formData.immediateJoiner} onChange={handleChange} />
                <label htmlFor="immediate" className="text-sm font-bold text-[#121212] cursor-pointer">Requires Immediate Joiner (0-15 days notice)?</label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-[#121212] mb-2">Step 4: Preview & Match</h3>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 relative shadow-sm">
                <div className="absolute top-0 right-0 bg-[#FACC15] text-slate-900 text-[10px] font-black tracking-wider px-3 py-1.5 rounded-bl-xl rounded-tr-xl">PREVIEW</div>
                <h3 className="text-2xl font-bold text-[#0F172A] pr-16">{formData.title || 'Untitled Role'}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1.5 flex items-center gap-2">
                  <span className="text-gray-700">{formData.industry || 'Industry'}</span> • <span>{formData.workMode || 'Work Mode'}</span> • <span>{formData.location || 'Location'}</span>
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.skills.length > 0 ? formData.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-[#121212]">{s}</span>
                  )) : <span className="text-xs text-gray-400 italic">No skills added</span>}
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Experience</p>
                    <p className="font-bold text-[#121212]">{formData.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Salary ({formData.salaryType})</p>
                    <p className="font-bold text-[#121212]">${formData.salaryMin || '0'} - ${formData.salaryMax || '0'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Candidate Contact Preference</label>
                <select name="contactPreference" className={inputClass} value={formData.contactPreference} onChange={handleChange}>
                  <option value="In-app chat">In-app Chat (Recommended)</option>
                  <option value="Email">Direct Email</option>
                  <option value="Phone">Phone Call</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-3xl">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-gray-500 font-bold hover:text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2 text-sm">
              <FaArrowLeft /> Back
            </button>
          ) : <div></div>}

          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="px-8 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 text-sm">
              Next Step <FaArrowRight />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="px-8 py-3 bg-[#FACC15] text-slate-900 font-black rounded-xl hover:bg-yellow-400 shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Posting...' : 'Post & Match'} <FaCheck />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

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
            <span className="text-gray-700">{job.industry}</span> • <span>{job.workMode}</span> • <span>{job.location}</span>
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
          <button className="px-8 py-3 bg-[#FACC15] text-slate-900 font-black rounded-xl hover:bg-yellow-400 shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
             Apply for this job <FaArrowRight />
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployerDashboard;
