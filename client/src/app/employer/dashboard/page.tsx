"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  FaEdit,
  FaCheck,
  FaCheckDouble,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import {
  MdDashboard,
  MdMenu,
  MdMessage,
  MdSettings,
  MdWork,
} from "react-icons/md";
import CompanyProfile from "../Profile/page";
import {
  useGetCompanyByIdQuery,
  useGetJobsByEmployerQuery,
  usePostJobMutation,
  useDeleteJobMutation,
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useUpdateApplicantStatusMutation,
  useScheduleInterviewMutation,
} from "@/features/jobapi";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsSeenMutation,
  useGetConversationsQuery,
  useGetUnreadMessageCountQuery,
} from "@/features/chatApi";
import Link from "next/link";
import toast from "react-hot-toast";

const EmployerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  const { data: notifications = [] } = useGetNotificationsQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const { data: unreadChatData } = useGetUnreadMessageCountQuery(user?._id, { skip: !user?._id, pollingInterval: 5000 });
  const unreadMessageCount = unreadChatData?.count || 0;

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && unreadCount > 0) {
      markNotificationsAsRead(user._id);
    }
  };

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        const userData = parsedProfile.result || parsedProfile;

        if (userData.role !== "employer") {
          router.push("/"); // Redirect if not an employer
        } else {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push("/");
      }
    } else {
      router.push("/"); // Redirect if not logged in
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("profile");
    router.push("/");
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
      <aside
        className={`bg-white border-r border-gray-100 flex-col fixed h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-all duration-300 ease-in-out flex ${isSidebarCollapsed ? "w-72 md:w-20" : "w-72"}`}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-[#0B0C10] hover:shadow-md transition-all z-50 cursor-pointer"
        >
          <FaChevronLeft
            className={`text-[10px] transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`p-8 flex items-center gap-3 transition-all duration-300 ${isSidebarCollapsed ? "md:justify-center md:px-4" : ""}`}
        >
          <div className="bg-[#FACC15] p-2.5 rounded-xl shadow-lg shadow-[#FACC15]/20 flex-shrink-0">
            <FaBriefcase className="text-[#0B0C10] text-lg" />
          </div>
          <span
            className={`text-xl font-bold text-[#121212] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? "md:max-w-0 md:opacity-0" : "max-w-xs opacity-100"}`}
          >
            Job<span className="text-[#FACC15]">Portal</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
          <p
            className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-300 ${isSidebarCollapsed ? "md:hidden" : ""}`}
          >
            Menu
          </p>
          <SidebarItem
            icon={<MdDashboard />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setIsSidebarOpen(false);
            }}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={<MdWork />}
            label="My Jobs"
            active={activeTab === "myJobs"}
            onClick={() => {
              setActiveTab("myJobs");
              setIsSidebarOpen(false);
            }}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={<FaUsers />}
            label="Applicants"
            active={activeTab === "applicants"}
            onClick={() => {
              setActiveTab("applicants");
              setIsSidebarOpen(false);
            }}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={<MdMessage />}
            label="Messages"
            active={activeTab === "messages"}
            onClick={() => {
              setActiveTab("messages");
              setIsSidebarOpen(false);
            }}
            badge={unreadMessageCount > 0 ? unreadMessageCount.toString() : undefined}
            collapsed={isSidebarCollapsed}
          />

          <p
            className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 transition-all duration-300 ${isSidebarCollapsed ? "md:hidden" : ""}`}
          >
            Account
          </p>
          <SidebarItem
            icon={<FaBuilding />}
            label="Company Profile"
            active={activeTab === "profile"}
            onClick={() => {
              setActiveTab("profile");
              setIsSidebarOpen(false);
            }}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={<MdSettings />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => {
              setActiveTab("settings");
              setIsSidebarOpen(false);
            }}
            collapsed={isSidebarCollapsed}
          />
        </nav>

        <div
          className={`p-4 border-t border-gray-50 transition-all duration-300 ${isSidebarCollapsed ? "md:m-2 md:p-2 m-4" : "m-4"}`}
        >
          <button
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Logout" : undefined}
            className={`flex items-center text-gray-500 hover:text-red-600 transition-all w-full py-3 rounded-xl hover:bg-red-50 font-medium group ${isSidebarCollapsed ? "md:justify-center md:px-0 gap-3 px-4" : "gap-3 px-4"}`}
          >
            <FaSignOutAlt
              className={`text-xl transition-transform ${isSidebarCollapsed ? "" : "group-hover:translate-x-1"}`}
            />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? "md:max-w-0 md:opacity-0" : "max-w-[200px] opacity-100"}`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:ml-20" : "md:ml-72"}`}
      >
        <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-md px-6 py-4 lg:px-10 border-b border-gray-200/50 transition-all duration-300">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2.5 -ml-2 text-gray-500 hover:text-[#0B0C10] hover:bg-slate-50 rounded-full"
              >
                <MdMenu size={22} />
              </button>
              <h1 className="text-2xl font-bold text-[#121212] capitalize">
                {activeTab.replace(/([A-Z])/g, " $1").trim()}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#FACC15] text-[#0B0C10] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#FACC15]/20 hover:bg-[#EAB308] transition-all"
              >
                <FaPlus /> <span className="hidden sm:inline">Post New Job</span><span className="sm:hidden">Post Job</span>
              </button>

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
                        {notifications.length > 0 ? notifications.map((n: any) => (
                          <div key={n._id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'font-semibold' : 'text-gray-600'}`}>
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        )) : <div className="p-8 text-center"><FaBell className="mx-auto text-3xl text-gray-300 mb-2" /><p className="text-sm text-gray-500">No notifications yet.</p></div>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                >
                  <div className="w-9 h-9 bg-[#0B0C10] rounded-full flex items-center justify-center text-[#FACC15] font-bold text-sm shadow-inner overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.companyName?.charAt(0).toUpperCase() || "E"
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-[#121212] leading-none group-hover:text-[#0B0C10] transition-colors">
                      {user?.companyName || "Employer"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">
                      Employer
                    </p>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up transform origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-bold text-[#121212]">
                          {user?.companyName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0B0C10] transition-colors flex items-center gap-3"
                      >
                        <FaBuilding className="text-lg" /> Company Profile
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("settings");
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0B0C10] transition-colors flex items-center gap-3"
                      >
                        <MdSettings className="text-lg" /> Settings
                      </button>
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"
                        >
                          <FaSignOutAlt className="text-lg" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1">
          {activeTab === "dashboard" && <DashboardOverview user={user} />}
          {activeTab === "myJobs" && (
            <MyJobsSection
              employerId={user._id}
              onJobClick={(job: any) => setSelectedJob(job)}
              onPostJobClick={() => setIsPostJobModalOpen(true)}
            />
          )}
          {activeTab === "profile" && (
            <CompanyProfile user={user} setUser={setUser} />
          )}
          {activeTab === "messages" && <MessagesSection user={user} />}
          {activeTab === "applicants" && <ApplicantsSection employerId={user._id} />}
          {activeTab === "settings" && <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up"><FaBriefcase className="text-6xl text-slate-200 mb-4" /><h2 className="text-xl font-bold text-[#121212] capitalize">Settings</h2><p className="text-gray-500 text-sm mt-2">This section is currently under development.</p></div>}
        </div>
      </main>
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
      {isPostJobModalOpen && (
        <PostJobModal 
          user={user} 
          onClose={() => setIsPostJobModalOpen(false)} 
        />
      )}
    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
  badge,
  collapsed,
}: any) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center justify-between py-3.5 rounded-xl transition-all duration-200 font-medium group relative ${collapsed ? "md:px-0 md:justify-center px-4" : "px-4"} ${active ? "bg-[#0B0C10] text-[#FACC15] shadow-lg shadow-black/30" : "text-gray-500 hover:bg-gray-100 hover:text-[#0B0C10]"}`}
  >
    <div
      className={`flex items-center ${collapsed ? "md:gap-0 gap-3" : "gap-3"}`}
    >
      <span
        className={`text-xl flex-shrink-0 ${active ? "text-[#FACC15]" : "text-gray-400 group-hover:text-[#0B0C10]"}`}
      >
        {icon}
      </span>
      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "md:max-w-0 md:opacity-0" : "max-w-[200px] opacity-100"}`}
      >
        {label}
      </span>
    </div>
    {badge && (
      <span
        className={`text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all duration-300 ${collapsed ? "md:hidden" : ""} ${active ? "bg-[#FACC15]/20 text-[#FACC15]" : "bg-gray-200 text-[#0B0C10]"}`}
      >
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
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}
      >
        {icon}
      </div>
    </div>
    <h3 className="text-3xl font-bold text-[#121212] mb-1">{value}</h3>
    <p className="text-sm font-medium text-gray-400">{label}</p>
  </div>
);

const DashboardOverview = ({ user }: { user: any }) => {
  const { data: jobs = [], isLoading: isLoadingJobs } = useGetJobsByEmployerQuery(user._id, {
    skip: !user._id,
    pollingInterval: 5000
  });
  const { data: companyData, isLoading: isLoadingCompany } = useGetCompanyByIdQuery(user._id, {
    skip: !user._id,
    pollingInterval: 30000, // Poll for new views every 30 seconds
  });

  const totalApplicants = jobs.reduce((acc: number, job: any) => acc + (job.applicants?.length || 0), 0);
  const profileViews = companyData?.profileViews ?? user?.profileViews ?? 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-[#121212]">
          Welcome, {user?.companyName || user?.name}!
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Here's a snapshot of your recruitment activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaBriefcase />}
          label="Active Jobs"
          value={jobs.length}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<FaUsers />}
          label="Total Applicants"
          value={isLoadingJobs ? "..." : totalApplicants.toString()}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          icon={<FaClock />}
          label="Pending Reviews"
          value={totalApplicants.toString()}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<FaChartLine />}
          label="Profile Views"
          value={isLoadingCompany ? "..." : profileViews.toLocaleString()}
          color="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#121212] mb-6">
          Recent Applicants
        </h3>
        <div className="space-y-4">
          {totalApplicants === 0 ? (
            <p className="text-sm text-gray-500">No recent applicants.</p>
          ) : (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-[#0B0C10]">
              You have <span className="font-bold text-yellow-600">{totalApplicants}</span> total applicant(s). Go to the <span className="font-bold">Applicants</span> tab to review them!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicantRow = ({ name, role, date }: any) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-sm text-[#121212]">{name}</h4>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-gray-400 hidden sm:block">
        {date}
      </span>
      <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-[#0F172A] rounded-xl hover:bg-gray-100 transition-colors">
        View Profile
      </button>
    </div>
  </div>
);

const MyJobsSection = ({
  employerId,
  onJobClick,
  onPostJobClick,
}: {
  employerId: string;
  onJobClick: (job: any) => void;
  onPostJobClick: () => void;
}) => {
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useGetJobsByEmployerQuery(employerId);

  if (isLoading)
    return (
      <div className="text-center py-10">
        <FaSpinner className="animate-spin text-2xl mx-auto text-gray-400" />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-500">Failed to load jobs.</div>
    );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#121212]">My Job Postings</h2>
        <button
          onClick={onPostJobClick}
          className="px-5 py-2.5 bg-[#FACC15] text-[#0B0C10] font-bold text-sm rounded-xl shadow-lg shadow-[#FACC15]/20 hover:bg-[#EAB308] transition-all"
        >
          Post New Job
        </button>
      </div>

      {jobs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Applicants
                </th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Date Posted
                </th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job: any) => (
                <tr
                  key={job._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-bold text-[#121212]">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.location}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${job.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-600 hidden lg:table-cell">
                    52
                  </td>
                  <td className="p-4 text-gray-500 hidden lg:table-cell">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onJobClick(job)}
                      className="text-sm font-bold text-[#0B0C10] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <FaBriefcase className="text-5xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#121212]">
            No jobs posted yet
          </h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Start by posting your first job to attract top talent.
          </p>
          <button
            onClick={onPostJobClick}
            className="px-6 py-2.5 bg-[#FACC15] text-[#0B0C10] font-bold text-sm rounded-xl shadow-lg shadow-[#FACC15]/20 hover:bg-[#EAB308] transition-all"
          >
            Post a Job
          </button>
        </div>
      )}
    </div>
  );
};

const JobDetailsModal = ({ job, onClose }: any) => {
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    ) {
      try {
        await deleteJob(job._id).unwrap();
        toast.success("Job deleted successfully");
        onClose();
      } catch (error) {
        toast.error("Failed to delete job");
        console.error("Failed to delete job:", error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:px-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-bold text-[#121212] flex items-center gap-3">
            <div className="bg-[#FACC15] p-2 rounded-xl shadow-md">
              <FaBriefcase className="text-[#0B0C10] text-sm" />
            </div>
            Job Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar hide-scrollbar flex-1 bg-white">
          <h3 className="text-3xl font-bold text-[#0B0C10]">{job.title}</h3>
          <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
            <span className="text-gray-700">
              {job.employerId?.companyName || job.employerId?.name || "Company"}
            </span>{" "}
            • <span>{job.workMode}</span> • <span>{job.location}</span>
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {job.skills && job.skills.length > 0 ? (
              job.skills.map((s: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-[#121212]"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400 italic">
                No skills specified
              </span>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Experience
              </p>
              <p className="font-bold text-[#121212] text-base">
                {job.experience || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Salary ({job.salaryType})
              </p>
              <p className="font-bold text-[#121212] text-base">
                ${job.salaryMin || "0"} - ${job.salaryMax || "0"}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
              Job Description
            </p>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          {job.screeningQuestion && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Screening Question
              </p>
              <p className="font-semibold text-[#121212] text-sm">
                {job.screeningQuestion}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <FaTimes /> {isDeleting ? "Deleting..." : "Delete Job"}
          </button>
          <button className="px-8 py-3 bg-[#FACC15] text-[#0B0C10] font-bold rounded-xl hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
            <FaEdit /> Edit Job
          </button>
        </div>
      </div>
    </div>
  );
};

const MessagesSection = ({ user }: { user: any }) => {
  const { data: companyData } = useGetCompanyByIdQuery(user?._id, {
    skip: !user?._id,
    pollingInterval: 5000,
  });
  const { data: conversations = [] } = useGetConversationsQuery(user?._id, {
    skip: !user?._id,
    pollingInterval: 5000,
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const { data: messages = [] } = useGetMessagesQuery(
    { user1: user?._id, user2: selectedUser?._id },
    { skip: !selectedUser?._id, pollingInterval: 3000 },
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsSeen] = useMarkAsSeenMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedUser || isSending) return;
    try {
      await sendMessage({
        senderId: user._id,
        receiverId: selectedUser._id,
        message: messageText,
      }).unwrap();
      setMessageText("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    if (selectedUser && user?._id && messages.length > 0) {
      const hasUnread = messages.some(
        (msg: any) =>
          String(msg.senderId) === String(selectedUser._id) && !msg.seen,
      );
      if (hasUnread) {
        markAsSeen({ senderId: selectedUser._id, receiverId: user._id });
      }
    }
  }, [selectedUser, user, messages, markAsSeen]);

  const chatUsersMap = new Map();
  conversations.forEach((u: any) => chatUsersMap.set(u._id, u));
  (companyData?.sampleFollowers || []).forEach((u: any) => {
    if (!chatUsersMap.has(u._id)) {
      chatUsersMap.set(u._id, u);
    }
  });
  const chatUsers = Array.from(chatUsersMap.values());

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex h-[600px] overflow-hidden animate-fade-in-up">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#121212]">Messages</h2>
          <p className="text-xs text-gray-500 mt-1">Chat with your followers</p>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {chatUsers.map((follower: any) => (
            <div
              key={follower._id}
              onClick={() => setSelectedUser(follower)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${selectedUser?._id === follower._id ? "bg-slate-50 border-l-4 border-l-[#FACC15]" : "border-l-4 border-l-transparent"}`}
            >
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                {follower.profilePicture ? (
                  <img
                    src={follower.profilePicture}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  follower.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#121212] truncate">
                  {follower.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {follower.headline || "Candidate"}
                </p>
              </div>
            </div>
          ))}
          {chatUsers.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No followers to chat with yet.
            </div>
          )}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {selectedUser ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white flex items-center gap-4 shadow-sm z-10">
              <div className="w-10 h-10 bg-[#0B0C10] text-[#FACC15] rounded-full flex items-center justify-center font-bold shadow-md">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div>
                <h3 className="font-bold text-[#121212]">
                  {selectedUser.name}
                </h3>
                <p className="text-xs text-gray-500">Connected via Follow</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((msg: any) => {
                const isMine = String(msg.senderId) === String(user._id);
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm shadow-sm ${isMine ? "bg-[#FACC15] text-[#0B0C10] rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"}`}
                    >
                      {msg.message}
                      {isMine && (
                        <div className="text-right text-[10px] mt-1.5 -mb-1 flex items-center justify-end gap-1.5 opacity-70">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
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
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-8 py-3 bg-[#0B0C10] text-[#FACC15] font-bold rounded-xl text-sm hover:bg-[#1F2833] shadow-lg shadow-black/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MdMessage className="text-6xl text-slate-200 mb-4" />
            <p className="text-lg font-medium text-gray-500">Your Messages</p>
            <p className="text-sm mt-1">
              Select a conversation from the sidebar to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicantsSection = ({ employerId }: { employerId: string }) => {
  const { data: jobs = [], isLoading: isLoadingJobs } = useGetJobsByEmployerQuery(employerId);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Find the selected job from the jobs array to get its applicants
  const selectedJobData = jobs.find((job: any) => job._id === selectedJobId);
  const applicants = selectedJobData?.applicants || [];
  const isLoadingApplicants = false; // Data is already part of the jobs query

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [updateApplicantStatus] = useUpdateApplicantStatusMutation();
  const [scheduleInterview, { isLoading: isScheduling }] = useScheduleInterviewMutation();
  const [schedulingCandidate, setSchedulingCandidate] = useState<any>(null);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', link: '', description: '' });
  const [applicantStatuses, setApplicantStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (schedulingCandidate) {
        const detail = selectedJobData?.applicantDetails?.find((d: any) => d.candidateId.toString() === schedulingCandidate._id.toString());
        if (detail?.interviewDate) {
            const interviewDate = new Date(detail.interviewDate);
            const yyyy = interviewDate.getFullYear();
            const mm = String(interviewDate.getMonth() + 1).padStart(2, '0');
            const dd = String(interviewDate.getDate()).padStart(2, '0');
            const date = `${yyyy}-${mm}-${dd}`;
            const time = interviewDate.toTimeString().split(' ')[0].substring(0, 5); // HH:mm
            setInterviewForm({
                date: date,
                time: time,
                link: detail.interviewLink || '',
                description: detail.interviewDescription || ''
            });
        } else {
            setInterviewForm({ date: '', time: '', link: '', description: '' });
        }
    }
  }, [schedulingCandidate, selectedJobData]);

  useEffect(() => {
    if (selectedJobData?.applicantDetails) {
      const initialStatuses: Record<string, string> = {};
      selectedJobData.applicantDetails.forEach((d: any) => { if (d.candidateId) initialStatuses[d.candidateId.toString()] = d.status; });
      setApplicantStatuses(initialStatuses);
    }
  }, [selectedJobData]);

  const handleDragStart = (e: React.DragEvent, applicantId: string) => {
    e.dataTransfer.setData("applicantId", applicantId);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    const applicantId = e.dataTransfer.getData("applicantId");
    if (applicantId) {
      setApplicantStatuses((prev) => ({ ...prev, [applicantId]: status }));
      toast.success(`Applicant moved to ${status}`);
      await updateApplicantStatus({ jobId: selectedJobId, candidateId: applicantId, status: status }).unwrap().catch(err => console.error("Failed to notify candidate", err));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const columns = [
    { id: "Applied", title: "Applied", color: "border-slate-300" },
    { id: "Reviewing", title: "Reviewing", color: "border-yellow-400" },
    { id: "Selected", title: "Selected", color: "border-blue-400" },
    { id: "Interview", title: "Interview", color: "border-amber-500" },
    { id: "Offered", title: "Offered", color: "border-green-400" }, // Kept for offers after interview
    { id: "Rejected", title: "Rejected", color: "border-red-400" },
  ];

  const handleScheduleSubmit = async () => {
    if (!interviewForm.date || !interviewForm.time || !interviewForm.link) return toast.error('Date, Time, and Link are required');
    try {
      await scheduleInterview({
        jobId: selectedJobId,
        candidateId: schedulingCandidate._id,
        ...interviewForm,
      }).unwrap();
      toast.success('Interview scheduled and candidate notified!');
      setSchedulingCandidate(null);
      setInterviewForm({ date: '', time: '', link: '', description: '' });
    } catch (err) {
      toast.error('Failed to schedule interview.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-[#121212]">Applicants</h2>
        {jobs.length > 0 && (
          <select 
            value={selectedJobId} 
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 font-bold text-[#121212] shadow-sm cursor-pointer"
          >
            {jobs.map((job: any) => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        )}
      </div>

      {isLoadingJobs || isLoadingApplicants ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-4xl text-gray-300" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <FaUsers className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Post a job to start receiving applicants.</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <FaUsers className="text-6xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#121212]">No Applicants Yet</h3>
          <p className="text-sm text-gray-500 mt-2">When candidates apply for this job, they will appear here.</p>
        </div>
      ) : (
        <>
        <div className="flex gap-3 overflow-x-auto pb-6 w-full custom-scrollbar hide-scrollbar">
          {columns.map((col) => {
            const colApplicants = applicants.filter(
              (a: any) => (applicantStatuses[a._id] || "Applied") === col.id
            );
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-1 min-w-[160px] 2xl:min-w-[180px] bg-gray-50/80 rounded-2xl border-t-4 ${col.color} p-2.5 flex flex-col max-h-[700px]`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#121212]">{col.title}</h3>
                  <span className="bg-white text-xs font-bold px-2 py-1 rounded-md text-gray-500 shadow-sm border border-gray-100">
                    {colApplicants.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {colApplicants.map((applicant: any) => (
                    <div
                      key={applicant._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, applicant._id)}
                      className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group flex flex-col gap-2.5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#0B0C10] overflow-hidden flex-shrink-0 shadow-sm border border-gray-200 group-hover:bg-[#0B0C10] group-hover:text-[#FACC15] transition-colors">
                          {applicant.profilePicture ? (
                            <img src={applicant.profilePicture.startsWith('http') ? applicant.profilePicture : `${apiUrl}/${applicant.profilePicture.replace(/\\/g, '/')}`} alt={applicant.name} className="w-full h-full object-cover" />
                          ) : (
                            applicant.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[#121212] group-hover:text-[#0B0C10] transition-colors truncate">
                            {applicant.name}
                          </div>
                          <div className="text-xs font-medium text-gray-500 truncate">
                            {applicant.headline || "Job Seeker"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100/50">
                        <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
                          <FaEnvelope className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{applicant.email}</span>
                        </div>
                        {applicant.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
                            <FaPhone className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{applicant.phone}</span>
                          </div>
                        )}
                      </div>

                      {col.id === "Interview" && (
                        <div className="mt-2 border-t border-gray-100 pt-3">
                          {(() => {
                            const detail = selectedJobData.applicantDetails?.find((d: any) => d.candidateId.toString() === applicant._id.toString());
                            if (detail?.interviewDate) {
                              return (
                                <div className="text-[10px] bg-yellow-50 p-2 rounded-lg text-yellow-800 flex justify-between items-center gap-2">
                                  <p className="font-bold truncate">🗓️ {new Date(detail.interviewDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                  <button onClick={(e) => {e.stopPropagation(); setSchedulingCandidate(applicant)}} className="p-1 hover:bg-yellow-200 rounded-full text-yellow-900">
                                      <FaEdit size={10} />
                                  </button>
                                </div>
                              );
                            }
                            return <button onClick={(e) => {e.stopPropagation(); setSchedulingCandidate(applicant)}} className="w-full py-1.5 bg-[#FACC15] text-[#0B0C10] text-xs font-bold rounded hover:bg-[#EAB308] transition-colors shadow-sm">Schedule Interview</button>;
                          })()}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        {applicant.resume ? (
                          <a 
                            href={applicant.resume.startsWith('http') ? applicant.resume : `${apiUrl}/${applicant.resume.replace(/\\/g, '/')}`}
                            onClick={(e) => e.stopPropagation()} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-bold text-[#0B0C10] hover:text-[#FACC15] hover:bg-[#0B0C10] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 transition-colors"
                          >
                            View / Download Resume
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">No Resume</span>
                        )}
                        <a href={`mailto:${applicant.email}`} className="text-gray-400 hover:text-[#0B0C10] p-1.5 bg-gray-50 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                          <FaEnvelope />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {schedulingCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60 p-4 transition-all" onClick={() => setSchedulingCandidate(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><h2 className="text-xl font-bold text-[#121212]">{interviewForm.date ? 'Edit Interview' : 'Schedule Interview'}</h2><button onClick={() => setSchedulingCandidate(null)} className="text-gray-400 hover:text-[#0B0C10]"><FaTimes/></button></div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 mb-4">Set up an interview with <span className="font-bold text-[#0B0C10]">{schedulingCandidate.name}</span>.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Date</label><input type="date" value={interviewForm.date} onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACC15]/50 outline-none"/></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Time</label><input type="time" value={interviewForm.time} onChange={e => setInterviewForm({...interviewForm, time: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACC15]/50 outline-none"/></div>
                </div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Meeting Link</label><input type="url" placeholder="e.g. Zoom, Google Meet link" value={interviewForm.link} onChange={e => setInterviewForm({...interviewForm, link: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACC15]/50 outline-none"/></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Software / Instructions</label><textarea placeholder="e.g. Please make sure to have Zoom installed..." value={interviewForm.description} onChange={e => setInterviewForm({...interviewForm, description: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACC15]/50 outline-none resize-none h-20"></textarea></div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setSchedulingCandidate(null)} className="px-5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={handleScheduleSubmit} disabled={isScheduling} className="px-5 py-2 bg-[#FACC15] text-[#0B0C10] rounded-xl text-sm font-bold shadow-md hover:bg-[#EAB308] disabled:opacity-50">{isScheduling ? 'Sending...' : 'Send Invite'}</button>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

const PostJobModal = ({ user, onClose }: any) => {
  const [postJob, { isLoading }] = usePostJobMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workMode: 'On-site',
    experience: 'Entry Level (0-2 Yrs)',
    salaryType: 'Yearly',
    salaryMin: '',
    salaryMax: '',
    skills: [] as string[],
    screeningQuestion: '',
    contactPreference: 'Email',
    immediateJoiner: false
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.description) return toast.error("Title and Description are required");
    }
    if (currentStep === 2) {
      if (formData.skills.length === 0) return toast.error("Please add at least one required skill");
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return toast.error("Title and Description are required");
    try {
      await postJob({
        ...formData,
        employerId: user._id,
        salaryMin: Number(formData.salaryMin) || 0,
        salaryMax: Number(formData.salaryMax) || 0,
      }).unwrap();
      toast.success("Job posted successfully!");
      onClose();
    } catch (error) { toast.error("Failed to post job"); }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] w-full max-w-4xl relative z-10 flex flex-col overflow-hidden max-h-[95vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
          <div>
            <h2 className="text-2xl font-black text-[#121212] tracking-tight">Post a New Job</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Attract the best talent with a great job description.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex justify-center items-center hover:bg-gray-100 hover:text-[#121212] transition-colors"><FaTimes size={18}/></button>
        </div>

        {/* Steps Tracker */}
        <div className="px-8 pt-6 pb-2 bg-gray-50/30">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#FACC15] rounded-full z-0 transition-all duration-500 ease-out" style={{ width: `${(currentStep - 1) * 50}%` }}></div>
            
            {[ { step: 1, label: "Role Overview" }, { step: 2, label: "Requirements" }, { step: 3, label: "Compensation" } ].map((s) => (
              <div key={s.step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${currentStep > s.step ? 'bg-[#121212] text-[#FACC15]' : currentStep === s.step ? 'bg-[#FACC15] text-[#121212] ring-4 ring-[#FACC15]/30 scale-110' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  {currentStep > s.step ? <FaCheck /> : s.step}
                </div>
                <span className={`text-xs font-bold absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${currentStep === s.step ? 'text-[#121212]' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as any).tagName !== 'TEXTAREA') e.preventDefault(); }} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Job Title <span className="text-red-500">*</span></label>
                <input type="text" autoFocus required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-base font-medium text-[#121212] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] transition-all" placeholder="e.g. Senior Frontend Developer" />
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Job Description <span className="text-red-500">*</span></label>
                <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-base font-medium text-[#121212] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] transition-all resize-none custom-scrollbar" placeholder="Detail the role, responsibilities, and expectations..."></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Location</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-base font-medium text-[#121212] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] transition-all" placeholder="e.g. New York, NY" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-colors">Work Mode</label>
                  <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    {['On-site', 'Remote', 'Hybrid'].map(mode => (
                      <button type="button" key={mode} onClick={() => setFormData({...formData, workMode: mode})} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${formData.workMode === mode ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>{mode}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-colors">Experience Level</label>
                <div className="grid grid-cols-3 gap-3 bg-gray-100 p-1.5 rounded-2xl">
                  {['Entry Level (0-2 Yrs)', 'Mid Level (3-5 Yrs)', 'Senior Level (5+ Yrs)'].map(exp => (
                    <button type="button" key={exp} onClick={() => setFormData({...formData, experience: exp})} className={`py-3 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${formData.experience === exp ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>{exp.split(' (')[0]}</button>
                  ))}
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Required Skills <span className="text-gray-400 normal-case font-medium text-[10px] ml-1">(Press Enter to add)</span> <span className="text-red-500">*</span></label>
                <div className="min-h-[60px] p-2 bg-gray-50/50 border border-gray-200/80 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FACC15]/20 focus-within:border-[#FACC15] transition-all flex flex-wrap gap-2 items-center">
                  {formData.skills.map(skill => (
                    <span key={skill} className="bg-[#121212] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in-up">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-[#FACC15] transition-colors"><FaTimes size={12}/></button>
                    </span>
                  ))}
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillAdd} className="flex-1 min-w-[120px] bg-transparent outline-none px-2 py-1 text-sm text-[#121212] placeholder-gray-400" placeholder={formData.skills.length === 0 ? "e.g. React, Node.js..." : "Add another skill..."} />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Screening Question <span className="text-gray-400 normal-case font-medium text-[10px] ml-1">(Optional)</span></label>
                <input type="text" value={formData.screeningQuestion} onChange={e => setFormData({...formData, screeningQuestion: e.target.value})} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-base font-medium text-[#121212] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] transition-all" placeholder="e.g. Why do you want to work with us?" />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-colors">Salary Type</label>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md">
                  {['Yearly', 'Monthly', 'Hourly'].map(type => (
                    <button type="button" key={type} onClick={() => setFormData({...formData, salaryType: type})} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${formData.salaryType === type ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Minimum Salary ($)</label>
                  <input type="number" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-base font-medium text-[#121212] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] transition-all" placeholder="e.g. 80000" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#121212] transition-colors">Maximum Salary ($)</label>
                  <input type="number" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-base font-medium text-[#121212] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 focus:border-[#FACC15] transition-all" placeholder="e.g. 120000" />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center justify-between cursor-pointer p-5 bg-gray-50/80 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200/50">
                  <div>
                    <h4 className="text-base font-bold text-[#121212]">Immediate Joiner Required</h4>
                    <p className="text-sm text-gray-500 mt-1">Activate this if you need candidates who can start working immediately.</p>
                  </div>
                  <div className="relative flex-shrink-0 ml-4">
                    <input type="checkbox" className="sr-only" checked={formData.immediateJoiner} onChange={e => setFormData({...formData, immediateJoiner: e.target.checked})} />
                    <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${formData.immediateJoiner ? 'bg-[#121212]' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-[#FACC15] w-6 h-6 rounded-full transition-transform duration-300 ${formData.immediateJoiner ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100/50 bg-white/50 flex items-center justify-between">
          <button type="button" onClick={currentStep > 1 ? handleBack : onClose} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-[#121212] transition-colors flex items-center gap-2">
            {currentStep > 1 ? <><FaChevronLeft size={12}/> Back</> : "Cancel"}
          </button>

          {currentStep < 3 ? (
            <button type="button" onClick={handleNext} className="px-8 py-3.5 bg-[#FACC15] text-[#121212] text-sm font-black rounded-xl hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
              Next Step <FaArrowRight size={12} />
            </button>
          ) : (
            <button type="submit" onClick={handleSubmit} disabled={isLoading} className="px-8 py-3.5 bg-[#121212] text-[#FACC15] text-sm font-black rounded-xl hover:bg-black shadow-xl shadow-black/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:transform-none">
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaCheck size={14} />} {isLoading ? 'Publishing...' : 'Publish Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
