'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  FaPlus,
  FaBuilding,
  FaUsers,
  FaChartLine,
  FaEdit
} from 'react-icons/fa';
import { MdDashboard, MdMenu, MdMessage, MdSettings, MdWork } from 'react-icons/md';
import CompanyProfile from '../Profile/page';
import { useGetJobsByEmployerQuery, usePostJobMutation, useDeleteJobMutation } from '@/features/jobapi';
import Link from 'next/link';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        const userData = parsedProfile.result || parsedProfile; 
        
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
          <SidebarItem icon={<MdWork />} label="My Jobs" active={activeTab === 'myJobs'} onClick={() => { setActiveTab('myJobs'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaPlus />} label="Post a Job" active={false} onClick={() => router.push('/employer/Job post')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<FaUsers />} label="Applicants" active={activeTab === 'applicants'} onClick={() => { setActiveTab('applicants'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<MdMessage />} label="Messages" active={activeTab === 'messages'} onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} badge="5" collapsed={isSidebarCollapsed} />
          
          <p className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Account</p>
          <SidebarItem icon={<FaBuilding />} label="Company Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
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
        <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-md px-6 py-4 lg:px-10 border-b border-gray-200/50 transition-all duration-300">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2.5 -ml-2 text-gray-500 hover:text-[#0F172A] hover:bg-slate-50 rounded-full">
                  <MdMenu size={22} />
              </button>
              <h1 className="text-2xl font-bold text-[#121212] capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/employer/Job post" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
                <FaPlus /> Post New Job
              </Link>

              <div className="relative">
                <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-[#0F172A] hover:border-slate-200 hover:shadow-md transition-all relative">
                  <FaBell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white"></span>
                </button>
              </div>

              <div className="relative">
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group focus:outline-none">
                   <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                     {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : user?.companyName?.charAt(0).toUpperCase() || 'E'}
                   </div>
                   <div className="hidden sm:block text-left">
                     <p className="text-sm font-bold text-[#121212] leading-none group-hover:text-[#0F172A] transition-colors">{user?.companyName || 'Employer'}</p>
                     <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Employer</p>
                   </div>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-bold text-[#121212]">{user?.companyName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button onClick={() => { setActiveTab('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] transition-colors flex items-center gap-3"><FaBuilding className="text-lg" /> Company Profile</button>
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

        <div className="p-6 lg:p-10 flex-1">
          {activeTab === 'dashboard' && <DashboardOverview user={user} />}
          {activeTab === 'myJobs' && <MyJobsSection employerId={user._id} onJobClick={(job) => setSelectedJob(job)} />}
          {activeTab === 'profile' && <CompanyProfile user={user} setUser={setUser} />}
          
          {['applicants', 'messages', 'settings'].includes(activeTab) && (
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
  <button onClick={onClick} title={collapsed ? label : undefined} className={`w-full flex items-center justify-between py-3.5 rounded-xl transition-all duration-200 font-medium group relative ${collapsed ? 'md:px-0 md:justify-center px-4' : 'px-4'} ${active ? 'bg-[#0F172A] text-white shadow-lg shadow-slate-900/30' : 'text-gray-500 hover:bg-slate-50 hover:text-[#0F172A]'}`}>
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

const DashboardOverview = ({ user }: { user: any }) => {
  const { data: jobs = [] } = useGetJobsByEmployerQuery(user._id, { skip: !user._id });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-[#121212]">Welcome, {user?.companyName || user?.name}!</h2>
        <p className="text-gray-500 mt-2 text-sm">Here's a snapshot of your recruitment activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FaBriefcase />} label="Active Jobs" value={jobs.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={<FaUsers />} label="Total Applicants" value="142" color="bg-amber-100 text-amber-500" />
        <StatCard icon={<FaClock />} label="Pending Reviews" value="18" color="bg-green-100 text-green-600" />
        <StatCard icon={<FaChartLine />} label="Profile Views" value="2.1k" color="bg-purple-100 text-purple-600" />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#121212] mb-6">Recent Applicants</h3>
        <div className="space-y-4">
          <ApplicantRow name="John Doe" role="Frontend Developer" date="2h ago" />
          <ApplicantRow name="Jane Smith" role="UI/UX Designer" date="1 day ago" />
          <ApplicantRow name="Sam Wilson" role="Full Stack Engineer" date="3 days ago" />
        </div>
      </div>
    </div>
  );
};

const ApplicantRow = ({ name, role, date }: any) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">{name.charAt(0)}</div>
      <div>
        <h4 className="font-bold text-sm text-[#121212]">{name}</h4>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-gray-400 hidden sm:block">{date}</span>
      <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-[#0F172A] rounded-xl hover:bg-gray-100 transition-colors">View Profile</button>
    </div>
  </div>
);

const MyJobsSection = ({ employerId, onJobClick }: { employerId: string, onJobClick: (job: any) => void }) => {
  const { data: jobs = [], isLoading, error } = useGetJobsByEmployerQuery(employerId);

  if (isLoading) return <div className="text-center py-10"><FaSpinner className="animate-spin text-2xl mx-auto text-gray-400" /></div>;
  if (error) return <div className="text-center py-10 text-red-500">Failed to load jobs.</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#121212]">My Job Postings</h2>
        <Link href="/employer/Job post" className="px-5 py-2.5 bg-[#0F172A] text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
          Post New Job
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Applicants</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date Posted</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job: any) => (
                <tr key={job._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#121212]">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.location}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${job.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
                  </td>
                  <td className="p-4 font-medium text-gray-600 hidden lg:table-cell">52</td>
                  <td className="p-4 text-gray-500 hidden lg:table-cell">{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => onJobClick(job)} className="text-sm font-bold text-[#0F172A] hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <FaBriefcase className="text-5xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#121212]">No jobs posted yet</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">Start by posting your first job to attract top talent.</p>
          <Link href="/employer/Job post" className="px-6 py-2.5 bg-[#0F172A] text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
            Post a Job
          </Link>
        </div>
      )}
    </div>
  );
};

const JobDetailsModal = ({ job, onClose }: any) => {
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await deleteJob(job._id).unwrap();
        toast.success('Job deleted successfully');
        onClose();
      } catch (error) {
        toast.error('Failed to delete job');
        console.error('Failed to delete job:', error);
      }
    }
  };

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

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar hide-scrollbar flex-1 bg-white">
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
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes /> {isDeleting ? 'Deleting...' : 'Delete Job'}
          </button>
          <button className="px-8 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
             <FaEdit /> Edit Job
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployerDashboard;