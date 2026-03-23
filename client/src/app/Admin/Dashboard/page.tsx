'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaBriefcase, FaSignOutAlt, FaChartBar, FaCog, FaUserShield, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner } from 'react-icons/fa';
import { useGetPendingGstVerificationsQuery, useUpdateGstVerificationStatusMutation } from '@/features/apiSlice';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gstVerifications');

  useEffect(() => {
    // Check if admin is logged in, otherwise redirect to login page
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      router.push('/Admin');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('profile'); // Clear admin profile on logout
    toast.success('Logged out successfully');
    router.push('/Admin');
  };

  // Show a loading spinner or placeholder while checking login status
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-[#121212]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
           <div className="bg-[#0F172A] p-2.5 rounded-xl shadow-lg shadow-slate-900/20">
             <FaUserShield className="text-white text-lg" />
           </div>
           <span className="text-xl font-bold tracking-tight">Admin<span className="text-[#0F172A]">Portal</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<FaChartBar />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<FaUsers />} label="Manage Users" active={activeTab === 'manageUsers'} onClick={() => setActiveTab('manageUsers')} />
          <SidebarItem icon={<FaBriefcase />} label="Manage Jobs" active={activeTab === 'manageJobs'} onClick={() => setActiveTab('manageJobs')} />
          <SidebarItem icon={<FaHourglassHalf />} label="GST Verifications" active={activeTab === 'gstVerifications'} onClick={() => setActiveTab('gstVerifications')} />
          <SidebarItem icon={<FaCog />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 hover:bg-red-50 w-full p-3 rounded-xl transition-colors font-bold">
            <FaSignOutAlt className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="mb-10 flex justify-between items-center p-8">
            <div>
                <h1 className="text-3xl font-bold text-[#121212]">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'manageUsers' && 'Manage Users'}
                    {activeTab === 'manageJobs' && 'Manage Jobs'}
                    {activeTab === 'gstVerifications' && 'GST Verifications'}
                    {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">Welcome to the admin control panel.</p>
            </div>
            <button onClick={handleLogout} className="md:hidden flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors font-bold text-sm">
                <FaSignOutAlt className="text-lg" /> Logout
            </button>
        </header>

        {activeTab === 'overview' && (
            <div className="p-6 lg:p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard title="Total Users" value="1,245" icon={<FaUsers />} color="text-blue-600" bg="bg-blue-50" />
                    <StatCard title="Active Jobs" value="342" icon={<FaBriefcase />} color="text-green-600" bg="bg-green-50" />
                    <StatCard title="Pending Reports" value="12" icon={<FaChartBar />} color="text-amber-600" bg="bg-amber-50" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold mb-6 text-[#121212]">Recent Platform Activity</h2>
                    <div className="space-y-4">
                        <ActivityRow text="New employer registered: TechCorp Inc." time="2 mins ago" />
                        <ActivityRow text="New job posted: Senior Frontend Developer" time="1 hour ago" />
                        <ActivityRow text="User profile flagged for review." time="3 hours ago" />
                        <ActivityRow text="New job seeker registered: Jane Doe." time="5 hours ago" />
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'gstVerifications' && <GstVerificationSection />}
        {/* Add other sections here based on activeTab */} 
      </main>
    </div>
  );
}

// New Component for GST Verifications
const GstVerificationSection = () => {
  const { data, isLoading, error, refetch } = useGetPendingGstVerificationsQuery();
  const [updateGstStatus, { isLoading: isUpdatingStatus }] = useUpdateGstVerificationStatusMutation();

  const handleUpdateStatus = async (employerId: string, status: 'approved' | 'rejected') => {
    const adminProfile = JSON.parse(localStorage.getItem('profile') || '{}');
    const adminId = adminProfile?.result?._id; // Assuming admin ID is stored in profile

    if (!adminId) {
      toast.error("Admin ID not found. Please log in again.");
      return;
    }

    try {
      await updateGstStatus({ employerId, status, adminId }).unwrap();
      toast.success(`GST verification ${status} successfully!`);
      refetch(); // Refresh the list of pending verifications
    } catch (err: any) {
      console.error("Failed to update GST status:", err);
      toast.error(err.data?.message || "Failed to update GST status.");
    }
  };

  if (isLoading) return <div className="p-8">Loading pending GST verifications...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading GST verifications: {JSON.stringify(error)}</div>;

  return ( // This component should be rendered within the main content area
    <div className="p-6 lg:p-10 flex-1">
      <h2 className="text-2xl font-bold text-[#121212] mb-6">Pending GST Verifications</h2>
      {data?.pendingVerifications?.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          No pending GST verification requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.pendingVerifications?.map((employer: any) => (
            <div key={employer._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#121212]">{employer.companyName}</h3>
              <p className="text-sm text-gray-600">GST Number: <span className="font-semibold">{employer.gstNumber}</span></p>
              <p className="text-sm text-gray-600">Email: <span className="font-semibold">{employer.email}</span></p>
              <p className="text-sm text-gray-600">Phone: <span className="font-semibold">{employer.phone}</span></p>
              <p className="text-sm text-gray-600">Location: <span className="font-semibold">{employer.location}</span></p>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleUpdateStatus(employer._id, 'approved')}
                  disabled={isUpdatingStatus}
                  className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCheckCircle /> {isUpdatingStatus ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(employer._id, 'rejected')}
                  disabled={isUpdatingStatus}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                > 
                  <FaTimesCircle /> {isUpdatingStatus ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 font-medium ${active ? 'bg-[#0F172A] text-white shadow-lg shadow-slate-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-[#0F172A]'}`}>
    <span className="text-lg">{icon}</span> {label}
  </button>
);


const StatCard = ({ title, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${bg} ${color}`}>
      {icon} 
    </div>
    <div>
      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-[#121212]">{value}</h3>
    </div>
  </div>
);

const ActivityRow = ({ text, time }: any) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
    <p className="text-sm font-medium text-[#121212]">{text}</p>
    <span className="text-xs font-bold text-gray-400">{time}</span>
  </div>
);

export default AdminDashboard;