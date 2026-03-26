'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCompanyByIdQuery, useGetJobsByEmployerQuery } from '@/features/jobapi';
import { FaMapMarkerAlt, FaGlobe, FaUsers, FaBuilding, FaArrowLeft, FaSpinner, FaBriefcase, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`You are now following ${company.companyName}`);
    } else {
      toast.success(`Unfollowed ${company.companyName}`);
    }
  };

  const { data: company, isLoading: isLoadingCompany } = useGetCompanyByIdQuery(id, { skip: !id });
  const { data: jobs = [], isLoading: isLoadingJobs } = useGetJobsByEmployerQuery(id, { skip: !id });

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-400">
        <FaSpinner className="animate-spin text-3xl mb-4 text-[#0F172A]" />
      </div>
    );
  }

  if (!company) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-xl text-gray-600 bg-gray-50">Company not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* Header/Cover */}
      <div 
        className="h-64 bg-gradient-to-r from-[#0F172A] to-slate-800 relative bg-cover bg-center"
        style={{ backgroundImage: company.coverImage ? `url(${company.coverImage})` : undefined }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-6 h-full relative flex items-center">
           <button onClick={() => router.back()} className="absolute top-6 left-6 text-white hover:text-gray-300 transition-colors flex items-center gap-2 font-medium bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm">
              <FaArrowLeft /> Back
           </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-6 max-w-5xl -mt-16 relative z-10 animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col md:flex-row gap-6 items-start flex-1">
              <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-2xl p-1.5 shadow-lg -mt-16 flex-shrink-0 border border-gray-100">
                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-4xl font-bold text-[#0F172A] overflow-hidden">
                  {company.profilePicture ? (
                    <img src={company.profilePicture} alt={company.companyName} className="w-full h-full object-cover" />
                  ) : (
                    company.companyName?.charAt(0).toUpperCase() || 'C'
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#121212]">{company.companyName}</h1>
                <p className="text-gray-500 text-base md:text-lg mt-1 font-medium">{company.tagline || 'Leading the way in innovation.'}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-gray-500">
                  {company.location && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaMapMarkerAlt className="text-[#0F172A]" /> {company.location}</span>}
                  {company.industry && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaBuilding className="text-[#0F172A]" /> {company.industry}</span>}
                  {company.companySize && <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaUsers className="text-[#0F172A]" /> {company.companySize}</span>}
                  {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0F172A] hover:underline bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><FaGlobe /> Website</a>}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0 w-full md:w-auto">
              <button 
                onClick={handleFollowToggle}
                className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  isFollowing 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200' 
                    : 'bg-[#0F172A] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                }`}
              >
                {isFollowing ? <><FaCheck /> Following</> : <><FaPlus /> Follow Company</>}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#121212] mb-4">About Us</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{company.description || 'No description available for this company.'}</p>
            </div>

            {company.commitments && company.commitments.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-[#121212] mb-6">Our Commitments</h2>
                <div className="space-y-6">
                  {company.commitments.map((c: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-[#0F172A]">
                         <FaBuilding />
                      </div>
                      <div>
                         <h4 className="font-bold text-[#121212] text-sm md:text-base">{c.title}</h4>
                         <p className="text-sm text-gray-600 mt-1 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#121212] mb-6">Open Positions ({jobs.length})</h2>
              {isLoadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-gray-300" />
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-6">
                  {jobs.map((job: any) => (
                    <JobCard key={job._id} job={job} onViewDetails={() => setSelectedJob(job)} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">This company has no open positions at the moment.</p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {company.specialties && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-[#121212] mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {company.specialties.split(',').map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

const JobCard = ({ job, onViewDetails }: { job: any, onViewDetails: () => void }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
    <h3 className="font-bold text-lg text-[#121212] group-hover:text-[#0F172A]">{job.title}</h3>
    <p className="text-sm text-gray-500 mt-1">{job.location} • {job.workMode}</p>
    <div className="flex flex-wrap gap-2 mt-4">
      {job.skills.slice(0, 4).map((skill: string, i: number) => (
        <span key={i} className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{skill}</span>
      ))}
    </div>
    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
      <p className="text-sm font-bold text-[#121212]">${job.salaryMin} - ${job.salaryMax}</p>
      <button onClick={onViewDetails} className="text-sm font-bold text-white bg-[#0F172A] px-5 py-2 rounded-lg group-hover:bg-slate-800 transition-colors">
        View Details
      </button>
    </div>
  </div>
);

// Re-using the JobDetailsModal from Candidate Dashboard for consistency
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
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-3xl">
          <button className="px-8 py-3 bg-[#0F172A] text-white font-black rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
             Apply Now
          </button>
        </div>

      </div>
    </div>
  );
};