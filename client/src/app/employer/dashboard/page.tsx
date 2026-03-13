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
  FaCheck
} from 'react-icons/fa';
import { MdDashboard, MdMessage, MdSettings, MdWork } from 'react-icons/md';
import CompanyProfile from '../Profile/page';

const EmployerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 flex items-center gap-3">
           <div className="bg-[#7C3AED] p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
             <FaBriefcase className="text-white text-lg" />
           </div>
           <span className="text-xl font-bold text-[#121212] tracking-tight">Job<span className="text-[#7C3AED]">Portal</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<MdWork />} label="My Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <SidebarItem icon={<FaUsers />} label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} badge="12" />
          <SidebarItem icon={<MdMessage />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
          <SidebarItem icon={<FaChartLine />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8">Account</p>
          <SidebarItem icon={<FaUserCircle />} label="Company Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarItem icon={<MdSettings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-gray-50 m-4">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-all w-full px-4 py-3 rounded-xl hover:bg-red-50 font-medium group">
            <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-md px-6 py-4 lg:px-10 border-b border-gray-200/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all duration-300">
          <div>
            <h1 className="text-2xl font-bold text-[#121212]">{activeTab === 'profile' ? 'Company Profile' : 'Dashboard'}</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, <span className="font-semibold text-[#121212]">{user?.name}</span>! Here's your daily overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-[#7C3AED] hover:border-violet-100 hover:shadow-md transition-all relative">
              <FaBell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group focus:outline-none"
              >
                 <div className="w-9 h-9 bg-[#7C3AED] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                   {user?.name?.charAt(0).toUpperCase() || 'A'}
                 </div>
                 <div className="hidden sm:block text-left">
                   <p className="text-sm font-bold text-[#121212] leading-none group-hover:text-[#7C3AED] transition-colors">{user?.companyName || 'Star Publicity'}</p>
                   <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">Employer</p>
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
                    <button onClick={() => { setActiveTab('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors flex items-center gap-3"><FaUserCircle className="text-lg" /> Company Profile</button>
                    <button onClick={() => { setActiveTab('settings'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#7C3AED] transition-colors flex items-center gap-3"><MdSettings className="text-lg" /> Settings</button>
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
        ) : (
          <>
          {/* Dashboard Content */}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FaBriefcase />} 
            label="Total Jobs Posted" 
            value="12" 
            trend="+2 this week" 
            trendUp={true}
            color="bg-violet-100 text-[#7C3AED]" 
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
            value="5" 
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
              <button className="text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] hover:bg-violet-50 px-4 py-2 rounded-lg transition-colors">View All</button>
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
                  <JobRow title="Senior Software Engineer" type="Full Time" apps="45" status="Active" date="2 days ago" />
                  <JobRow title="Product Designer" type="Remote" apps="28" status="Active" date="5 days ago" />
                  <JobRow title="Marketing Manager" type="Full Time" apps="12" status="Closed" date="1 week ago" />
                  <JobRow title="Frontend Developer" type="Contract" apps="63" status="Active" date="2 weeks ago" />
                </tbody>
              </table>
            </div>
            <div className="mt-8">
               <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:border-violet-500 hover:text-[#7C3AED] hover:bg-violet-50/50 transition-all flex items-center justify-center gap-2 group">
                 <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                    <FaPlus className="text-sm" />
                 </div>
                 Post a New Job
               </button>
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
              <CandidateRow name="Sarah Johnson" role="Senior Software Engineer" time="2h ago" avatar="S" color="bg-[#7C3AED]" />
              <CandidateRow name="Michael Chen" role="Product Designer" time="5h ago" avatar="M" color="bg-[#FACC15]" />
              <CandidateRow name="David Smith" role="Marketing Manager" time="1d ago" avatar="D" color="bg-[#EF4444]" />
              <CandidateRow name="Emily Davis" role="Frontend Developer" time="1d ago" avatar="E" color="bg-gray-800" />
              <CandidateRow name="James Wilson" role="Senior Software Engineer" time="2d ago" avatar="J" color="bg-[#7C3AED]" />
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
            <button className="text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-2">
              View All <FaArrowUp className="rotate-45" />
            </button>
          </div>
          <KanbanBoard />
          </div>
          </>
        )}
        </div>
      </main>
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
      <select className="text-xs font-medium bg-gray-100 border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
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
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <path d="M0,100 C40,80 80,120 120,100 S200,60 240,80 S320,140 360,120 S440,50 480,60 S560,100 600,90"
          fill="url(#chartGradient)"
          stroke="#7C3AED"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  </div>
);

// Sub-components for cleaner code

const SidebarItem = ({ icon, label, active, onClick, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-medium group ${active ? 'bg-[#7C3AED] text-white shadow-lg shadow-violet-500/30' : 'text-gray-500 hover:bg-violet-50 hover:text-[#7C3AED]'}`}
  >
    <div className="flex items-center gap-3">
        <span className={`text-xl ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#7C3AED]'}`}>{icon}</span>
        <span>{label}</span>
    </div>
    {badge && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-violet-100 text-[#7C3AED]'}`}>
            {badge}
        </span>
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

const JobRow = ({ title, type, apps, status, date }: any) => (
  <tr className="group hover:bg-blue-50/30 transition-colors">
    <td className="py-5 pl-2">
      <div className="font-bold text-[#121212] group-hover:text-[#7C3AED] transition-colors">{title}</div>
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
        <button className="text-gray-300 hover:text-[#7C3AED] transition-colors"><FaEllipsisH /></button>
    </td>
  </tr>
);

const CandidateRow = ({ name, role, time, avatar, color }: any) => (
  <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${color === 'bg-[#FACC15]' ? 'text-[#121212]' : 'text-white'} ${color}`}>
      {avatar}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[#121212] text-sm truncate group-hover:text-[#7C3AED] transition-colors">{name}</h4>
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
    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-2 border-gray-300'}`}>
      {checked && <FaCheck className="text-white text-xs" />}
    </div>
    <p className={`text-sm flex-1 ${checked ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
      {text}
    </p>
  </div>
);

const KanbanBoard = () => {
  const [candidates, setCandidates] = useState([
    { id: '1', name: 'Alice Freeman', role: 'Frontend Dev', status: 'Applied', avatar: 'A' },
    { id: '2', name: 'Bob Smith', role: 'Backend Dev', status: 'AI Screened', avatar: 'B' },
    { id: '3', name: 'Charlie Brown', role: 'Designer', status: 'Interview', avatar: 'C' },
    { id: '4', name: 'David Lee', role: 'Manager', status: 'Offered', avatar: 'D' },
    { id: '5', name: 'Eva Green', role: 'Tester', status: 'On Hold', avatar: 'E' },
    { id: '6', name: 'Frank White', role: 'DevOps', status: 'Rejected', avatar: 'F' },
    { id: '7', name: 'Grace Liu', role: 'Frontend Dev', status: 'Applied', avatar: 'G' },
  ]);

  const onDrop = (id: string, newStatus: string) => {
    setCandidates((prev) => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const columns = [
    { id: 'Applied', title: 'Applied', color: 'border-gray-300' },
    { id: 'AI Screened', title: 'AI Screened', color: 'border-[#7C3AED]' },
    { id: 'Interview', title: 'Interview', color: 'border-[#FACC15]' },
    { id: 'Offered', title: 'Offered', color: 'border-[#7C3AED]' }, // Using primary color for success as green isn't in strict palette, or could revert to green if preferred
    { id: 'On Hold', title: 'On Hold', color: 'border-gray-400' },
    { id: 'Rejected', title: 'Rejected', color: 'border-[#EF4444]' },
  ];

  return (
    <div className="grid grid-cols-6 gap-2 w-full">
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
      className={`min-w-0 bg-gray-50/50 rounded-2xl border-t-4 ${color} p-3 flex flex-col h-[500px] border-l border-r border-b border-gray-100/50`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-[#121212] text-xs truncate">{title}</h3>
        <span className="bg-white text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-500 shadow-sm">{candidates.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
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
      className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group transition-all"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${candidate.status === 'Rejected' ? 'bg-[#EF4444]' : candidate.status === 'Interview' ? 'bg-[#FACC15]' : 'bg-[#7C3AED]'}`}>
            {candidate.avatar}
            </div>
            <span className="text-[9px] text-gray-400 font-medium">2d</span>
        </div>
        <div>
          <h4 className="font-bold text-[#121212] text-xs group-hover:text-[#7C3AED] transition-colors truncate">{candidate.name}</h4>
          <p className="text-[10px] text-gray-400 truncate">{candidate.role}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
         <span className="text-[10px] text-gray-400 font-medium">2d ago</span>
         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-gray-400 hover:text-[#7C3AED]"><FaRegCommentDots size={12} /></button>
            <button className="text-gray-400 hover:text-[#7C3AED]"><FaEllipsisH size={12} /></button>
         </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
