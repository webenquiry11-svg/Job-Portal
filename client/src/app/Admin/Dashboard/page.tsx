'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAllUsersForAdminQuery, useGetAllJobsQuery, useGetPendingGstVerificationsQuery, useUpdateGstVerificationStatusMutation } from '@/features/jobapi';
import { FaSpinner, FaUserShield, FaBuilding, FaUser, FaCheckCircle, FaTimesCircle, FaBriefcase, FaSignOutAlt, FaChartPie, FaFileInvoiceDollar, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isAdminLoggedIn) router.push('/admin');
  }, [router]);

  const { data: users = [], isLoading: isUsersLoading } = useGetAllUsersForAdminQuery();
  const { data: jobs = [], isLoading: isJobsLoading } = useGetAllJobsQuery();
  const { data: pendingGsts = [], isLoading: isGstLoading } = useGetPendingGstVerificationsQuery(undefined, { pollingInterval: 5000 });
  const [updateGstStatus, { isLoading: isUpdatingGst }] = useUpdateGstVerificationStatusMutation();

  if (isUsersLoading || isJobsLoading || isGstLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <div className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col z-40">
          <div className="p-8 flex items-center gap-3 border-b border-gray-100"><div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div><div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div></div>
          <div className="p-4 space-y-3 mt-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-[73px] bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
            <div className="w-40 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="p-4 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>)}
            </div>
            <div className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  const employers = users.filter((u: any) => u.role === 'employer');
  const candidates = users.filter((u: any) => u.role === 'seeker');
  
  // Cross-reference jobs to track candidate applications
  const allApplications = jobs.flatMap((job: any) =>
    (job.applicantDetails || []).map((detail: any) => {
      const candidate = candidates.find((c: any) => c._id === detail.candidateId);
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
    router.push('/admin');
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

  // Data Export Handlers
  const getEmployersData = () => employers.map((u: any) => ({ Name: u.companyName || u.name, Email: u.email, Verification: u.gstVerificationStatus || 'Unverified', Status: u.isDeleted ? 'Deleted' : 'Active' }));
  const getCandidatesData = () => candidates.map((u: any) => ({ Name: u.name, Email: u.email, Verification: u.isEmailVerified ? 'Verified' : 'Unverified', Status: u.isDeleted ? 'Deleted' : 'Active' }));
  const getApplicationsData = () => allApplications.map((app: any) => ({ 'Candidate Name': app.candidateName, 'Candidate Email': app.candidateEmail, 'Job Title': app.jobTitle, 'Employer': app.employerName, 'Status': app.status }));
  const getGstData = () => pendingGsts.map((e: any) => ({ 'Company Name': e.companyName || e.name, 'GST Number': e.gstNumber, 'Email': e.email, 'Status': 'Pending' }));

  // Advanced HTML to Excel Exporter for Beautiful Sheets
  const downloadExcel = (data: any[], title: string, filename: string) => {
    if (!data || !data.length) {
      toast.error(`No data available for ${title}`);
      return;
    }
    const headers = Object.keys(data[0]);
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr><th colspan="${headers.length}" style="font-size: 20px; font-weight: bold; background-color: #FACC15; color: #0B0C10; height: 50px; vertical-align: middle;">${title}</th></tr>
            <tr>${headers.map(h => `<th style="background-color: #0B0C10; color: #ffffff; font-weight: bold; height: 35px; vertical-align: middle;">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `<tr>${Object.values(row).map(val => `<td style="vertical-align: middle;">${String(val || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Universal Downloader (Combines all data into one beautiful multi-table sheet)
  const downloadCombinedExcel = () => {
    toast.success('Preparing beautiful full data report...');
    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>`;

    const addTable = (data: any[], title: string) => {
       if(!data || !data.length) return '';
       const headers = Object.keys(data[0]);
       return `
        <table border="1" cellpadding="5" cellspacing="0" style="margin-bottom: 40px;">
          <thead>
            <tr><th colspan="${headers.length}" style="font-size: 20px; font-weight: bold; background-color: #FACC15; color: #0B0C10; height: 45px; vertical-align: middle;">${title}</th></tr>
            <tr>${headers.map(h => `<th style="background-color: #0B0C10; color: #ffffff; height: 35px; vertical-align: middle;">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `<tr>${Object.values(row).map(val => `<td style="vertical-align: middle;">${String(val || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table><br><br>`;
    };

    tableHtml += addTable(getEmployersData(), "Platform Employers");
    tableHtml += addTable(getCandidatesData(), "Platform Candidates");
    tableHtml += addTable(getApplicationsData(), "Job Applications");
    tableHtml += addTable(getGstData(), "Pending GST Approvals");
    tableHtml += `</body></html>`;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Complete_Platform_Report.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      {/* Light Theme Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-72 bg-white text-[#121212] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out`}>
        <div className="p-8 flex items-center gap-3 border-b border-gray-100">
          <img src="/Fav Icon.png" alt="Admin Icon" className="w-14 h-14 object-contain drop-shadow-md" />
          <span className="text-2xl font-black tracking-tight">Admin<span className="text-[#FACC15]">Portal</span></span>
        </div>
        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<FaChartPie />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<FaBuilding />} label="Employers" active={activeTab === 'employers'} onClick={() => { setActiveTab('employers'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<FaUser />} label="Candidates" active={activeTab === 'candidates'} onClick={() => { setActiveTab('candidates'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<FaBriefcase />} label="Applications" active={activeTab === 'applications'} onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<FaFileInvoiceDollar />} label="GST Approvals" badge={pendingGsts.length} active={activeTab === 'gst'} onClick={() => { setActiveTab('gst'); setIsSidebarOpen(false); }} />
        </nav>
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-bold">
            <FaSignOutAlt className="text-lg" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        
        {/* Top Header */}
        <header className="bg-white px-4 md:px-8 py-4 md:py-5 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-[#121212] p-2 -ml-2 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <h1 className="text-xl md:text-2xl font-black text-[#121212] capitalize truncate">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex justify-center items-center shadow-md ring-4 ring-yellow-500/10 overflow-hidden bg-white">
                <img src="/Fav Icon.png" alt="Admin" className="w-full h-full object-contain p-1" />
             </div>
             <span className="font-bold text-[#121212] hidden sm:block">Super Admin</span>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Overview Section */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<FaBuilding />} label="Total Employers" value={employers.length} color="text-blue-600 bg-blue-100" />
                <StatCard icon={<FaUser />} label="Total Candidates" value={candidates.length} color="text-green-600 bg-green-100" />
                <StatCard icon={<FaBriefcase />} label="Active Jobs" value={jobs.length} color="text-[#0B0C10] bg-[#FACC15]" />
                <StatCard icon={<FaFileInvoiceDollar />} label="Pending Verifications" value={pendingGsts.length} color="text-red-600 bg-red-100" />
              </div>
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-50 pb-4">
                   <h2 className="text-xl font-bold text-[#121212] flex items-center gap-2">👋 Welcome to Admin Dashboard</h2>
                   <button onClick={downloadCombinedExcel} className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0C10] text-[#FACC15] rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg text-sm whitespace-nowrap w-full sm:w-auto justify-center">
                     <FaDownload /> Download Entire Data
                   </button>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Select an option from the sidebar to manage your platform's users, review active job applications, and manually approve GST certificates to grant premium verified tags to employers. You can also download beautiful excel sheets for each respective category.</p>
              </div>
            </div>
          )}

          {/* GST Approvals Section */}
          {activeTab === 'gst' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-[#121212] flex items-center gap-3"><FaFileInvoiceDollar className="text-[#FACC15]" /> Review GST Requests</h2>
                <button onClick={() => downloadExcel(getGstData(), 'Pending GST Approvals', 'gst_approvals.xls')} className="flex items-center gap-2 px-5 py-2.5 bg-[#FACC15] text-[#0B0C10] rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-md text-sm whitespace-nowrap w-full sm:w-auto justify-center">
                  <FaDownload /> Download GST Data
                </button>
              </div>
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm text-left whitespace-nowrap lg:whitespace-normal">
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
                          <button onClick={() => handleGstAction(e._id, 'approved')} disabled={isUpdatingGst} className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-bold transition-all shadow-sm">Approve</button>
                          <button onClick={() => handleGstAction(e._id, 'rejected')} disabled={isUpdatingGst} className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold transition-all shadow-sm">Reject</button>
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
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-[#121212] flex items-center gap-3"><FaBriefcase className="text-[#FACC15]" /> Candidate Applications Tracking</h2>
                <button onClick={() => downloadExcel(getApplicationsData(), 'Candidate Applications', 'applications.xls')} className="flex items-center gap-2 px-5 py-2.5 bg-[#FACC15] text-[#0B0C10] rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-md text-sm whitespace-nowrap w-full sm:w-auto justify-center">
                  <FaDownload /> Download Applications
                </button>
              </div>
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm text-left whitespace-nowrap lg:whitespace-normal">
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
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-[#121212] flex items-center gap-3">
                  {activeTab === 'employers' ? <><FaBuilding className="text-[#FACC15]"/> Platform Employers</> : <><FaUser className="text-[#FACC15]"/> Platform Candidates</>}
                </h2>
                <button onClick={() => downloadExcel(activeTab === 'employers' ? getEmployersData() : getCandidatesData(), activeTab === 'employers' ? 'Platform Employers' : 'Platform Candidates', `${activeTab}.xls`)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FACC15] text-[#0B0C10] rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-md text-sm whitespace-nowrap w-full sm:w-auto justify-center">
                  <FaDownload /> Download {activeTab === 'employers' ? 'Employers' : 'Candidates'}
                </button>
              </div>
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm text-left whitespace-nowrap lg:whitespace-normal">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-5 rounded-tl-xl">Name</th>
                      <th className="p-5">Email Address</th>
                      <th className="p-5">Verifications</th>
                      <th className="p-5 rounded-tr-xl">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(activeTab === 'employers' ? employers : candidates).map((u: any) => (
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
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-bold ${active ? 'bg-[#FACC15] text-[#0B0C10] shadow-lg shadow-[#FACC15]/20' : 'text-gray-500 hover:text-[#0B0C10] hover:bg-gray-100'}`}>
    <div className="flex items-center gap-3 text-[15px]"><span className={active ? 'text-[#0B0C10]' : 'text-gray-400'}>{icon}</span> {label}</div>
    {badge > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-[#0B0C10] text-[#FACC15]' : 'bg-gray-200 text-gray-600'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${color}`}>{icon}</div>
    <div><p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</p><h3 className="text-3xl font-black text-[#121212]">{value}</h3></div>
  </div>
);

export default AdminDashboard;