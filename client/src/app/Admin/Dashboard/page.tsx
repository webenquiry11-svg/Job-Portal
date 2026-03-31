'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAllUsersForAdminQuery, useGetAllJobsQuery, useGetPendingGstVerificationsQuery, useUpdateGstVerificationStatusMutation } from '@/features/jobapi';
import { FaSpinner, FaUserShield, FaBuilding, FaUser, FaCheckCircle, FaTimesCircle, FaBriefcase, FaSignOutAlt, FaChartPie, FaFileInvoiceDollar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isAdminLoggedIn) router.push('/Admin');
  }, [router]);

  const { data: users = [], isLoading: isUsersLoading } = useGetAllUsersForAdminQuery();
  const { data: jobs = [], isLoading: isJobsLoading } = useGetAllJobsQuery();
  const { data: pendingGsts = [], isLoading: isGstLoading } = useGetPendingGstVerificationsQuery(undefined, { pollingInterval: 5000 });
  const [updateGstStatus, { isLoading: isUpdatingGst }] = useUpdateGstVerificationStatusMutation();

  if (isUsersLoading || isJobsLoading || isGstLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  const employers = users.filter(u => u.role === 'employer');
  const candidates = users.filter(u => u.role === 'seeker');
  
  // Cross-reference jobs to track candidate applications
  const allApplications = jobs.flatMap((job: any) =>
    (job.applicantDetails || []).map((detail: any) => {
      const candidate = candidates.find(c => c._id === detail.candidateId);
      return {
        id: `${job._id}-${detail.candidateId}`,
        jobTitle: job.title,
        employerName: job.employerId?.companyName || job.employerId?.name || 'Unknown',
        candidateName: candidate?.name || 'Unknown Candidate',
        candidateEmail: candidate?.email || '',
        status: detail.status,
      };
    })
  );

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/Admin');
    toast.success('Admin logged out securely.');
  };

  const handleGstAction = async (employerId: string, status: string) => {
    try {
      await updateGstStatus({ employerId, status }).unwrap();
      toast.success(`GST Request marked as ${status}.`);
    } catch (e) {
      toast.error('Failed to update GST status.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Premium Sidebar */}
      <aside className="w-72 bg-[#0B0C10] text-white flex flex-col shadow-2xl z-20 transition-all">
        <div className="p-8 flex items-center gap-3 border-b border-gray-800">
          <div className="bg-[#FACC15] p-2.5 rounded-xl shadow-lg shadow-[#FACC15]/20">
            <FaUserShield className="text-[#0B0C10] text-xl" />
          </div>
          <span className="text-2xl font-black tracking-tight">Admin<span className="text-[#FACC15]">Portal</span></span>
        </div>
        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<FaChartPie />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<FaBuilding />} label="Employers" active={activeTab === 'employers'} onClick={() => setActiveTab('employers')} />
          <SidebarItem icon={<FaUser />} label="Candidates" active={activeTab === 'candidates'} onClick={() => setActiveTab('candidates')} />
          <SidebarItem icon={<FaBriefcase />} label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
          <SidebarItem icon={<FaFileInvoiceDollar />} label="GST Approvals" badge={pendingGsts.length} active={activeTab === 'gst'} onClick={() => setActiveTab('gst')} />
        </nav>
        <div className="p-6 border-t border-gray-800 bg-[#060709]">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold">
            <FaSignOutAlt className="text-lg" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        
        {/* Top Header */}
        <header className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
          <h1 className="text-2xl font-black text-[#121212] capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-[#0B0C10] rounded-full flex justify-center items-center text-[#FACC15] font-bold shadow-md ring-4 ring-yellow-500/10">A</div>
             <span className="font-bold text-[#121212] hidden sm:block">Super Admin</span>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Overview Section */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<FaBuilding />} label="Total Employers" value={employers.length} color="text-blue-600 bg-blue-100" />
                <StatCard icon={<FaUser />} label="Total Candidates" value={candidates.length} color="text-green-600 bg-green-100" />
                <StatCard icon={<FaBriefcase />} label="Active Jobs" value={jobs.length} color="text-[#0B0C10] bg-[#FACC15]" />
                <StatCard icon={<FaFileInvoiceDollar />} label="Pending Verifications" value={pendingGsts.length} color="text-red-600 bg-red-100" />
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-[#121212] mb-2 flex items-center gap-2">👋 Welcome to your Dashboard</h2>
                <p className="text-gray-500 text-sm">Select an option from the sidebar to manage your platform's users, review active job applications, and manually approve GST certificates to grant premium verified tags to employers.</p>
              </div>
            </div>
          )}

          {/* GST Approvals Section */}
          {activeTab === 'gst' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
              <h2 className="text-xl font-bold text-[#121212] mb-6 flex items-center gap-3"><FaFileInvoiceDollar className="text-[#FACC15]" /> Review GST Requests</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-5 rounded-tl-xl">Company Name</th>
                      <th className="p-5">GST Number</th>
                      <th className="p-5">Email Address</th>
                      <th className="p-5 text-right rounded-tr-xl">Manual Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingGsts.map((e: any) => (
                      <tr key={e._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-[#121212]">{e.companyName || e.name}</td>
                        <td className="p-5 font-mono text-[#0B0C10] bg-gray-50/80 px-4 py-1.5 rounded-lg inline-block mt-3 border border-gray-200">{e.gstNumber}</td>
                        <td className="p-5 text-gray-600">{e.email}</td>
                        <td className="p-5 text-right space-x-3">
                          <button onClick={() => handleGstAction(e._id, 'approved')} disabled={isUpdatingGst} className="px-5 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-bold transition-all shadow-sm">Approve</button>
                          <button onClick={() => handleGstAction(e._id, 'rejected')} disabled={isUpdatingGst} className="px-5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold transition-all shadow-sm">Reject</button>
                        </td>
                      </tr>
                    ))}
                    {pendingGsts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">All caught up! No pending GST requests at the moment.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications Data Section */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
              <h2 className="text-xl font-bold text-[#121212] mb-6 flex items-center gap-3"><FaBriefcase className="text-[#FACC15]" /> Candidate Applications Tracking</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-5 rounded-tl-xl">Candidate</th>
                      <th className="p-5">Applied For Job</th>
                      <th className="p-5">Hiring Employer</th>
                      <th className="p-5 rounded-tr-xl">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allApplications.map((app: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-[#121212]">{app.candidateName} <span className="block font-medium text-xs text-gray-500 mt-1">{app.candidateEmail}</span></td>
                        <td className="p-5 font-semibold text-gray-700">{app.jobTitle}</td>
                        <td className="p-5 font-medium text-gray-600">{app.employerName}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${app.status === 'Applied' ? 'bg-blue-50 border border-blue-200 text-blue-700' : app.status === 'Rejected' ? 'bg-red-50 border border-red-200 text-red-700' : app.status === 'Selected' || app.status === 'Offered' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {allApplications.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No job applications have been submitted yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render Basic User Tables for other views to keep it tidy */}
          {(activeTab === 'employers' || activeTab === 'candidates') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
              <h2 className="text-xl font-bold text-[#121212] mb-6 flex items-center gap-3">
                {activeTab === 'employers' ? <><FaBuilding className="text-[#FACC15]"/> Platform Employers</> : <><FaUser className="text-[#FACC15]"/> Platform Candidates</>}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-5 rounded-tl-xl">Name</th>
                      <th className="p-5">Email Address</th>
                      <th className="p-5">Verifications</th>
                      <th className="p-5 rounded-tr-xl">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(activeTab === 'employers' ? employers : candidates).map(u => (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-[#121212]">{u.companyName || u.name}</td>
                        <td className="p-5 text-gray-600 font-medium">{u.email}</td>
                        <td className="p-5">
                          {u.role === 'employer' ? (
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${u.gstVerificationStatus === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{u.gstVerificationStatus || 'Unverified'}</span>
                          ) : (
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${u.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>{u.isEmailVerified ? <FaCheckCircle/> : <FaTimesCircle/>} Email</span>
                          )}
                        </td>
                        <td className="p-5">
                          {u.isDeleted ? <span className="px-3 py-1.5 font-bold text-red-700 bg-red-50 border border-red-200 rounded-full text-[10px] uppercase">Deleted</span> : <span className="px-3 py-1.5 font-bold text-green-700 bg-green-50 border border-green-200 rounded-full text-[10px] uppercase">Active</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-bold ${active ? 'bg-[#FACC15] text-[#0B0C10] shadow-lg shadow-[#FACC15]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-3 text-[15px]"><span className={active ? 'text-[#0B0C10]' : 'opacity-70'}>{icon}</span> {label}</div>
    {badge > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-[#0B0C10] text-[#FACC15]' : 'bg-white/10 text-white'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${color}`}>{icon}</div>
    <div><p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</p><h3 className="text-3xl font-black text-[#121212]">{value}</h3></div>
  </div>
);

export default AdminDashboard;