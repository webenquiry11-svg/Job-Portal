'use client';

import React, { useState } from 'react';
import { FaTimes, FaArrowRight, FaArrowLeft, FaCheck, FaBriefcase } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePostJobMutation } from '@/features/jobapi';
import { useRouter } from 'next/navigation';

const JobPostPage = () => {
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  
  const router = useRouter();
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
      console.log('Posting Job:', formData);
      
      // Attach the employer ID so we know who posted this
      const profile = JSON.parse(localStorage.getItem('profile') || '{}');
      const employerId = profile?.result?._id;
      
      await postJob({ ...formData, employerId }).unwrap();
      toast.success('Job Posted & Matched Successfully!');
      
      // Redirect back to the Employer Dashboard after success
      setTimeout(() => router.push('/employer/dashboard'), 1500);

      // Clear the form and reset progress indicator
      setStep(1);
      setFormData({
        title: '', industry: '', workMode: 'On-site', location: '', skills: [],
        experience: '', salaryMin: '', salaryMax: '', salaryType: 'Annual',
        description: '', screeningQuestion: '', immediateJoiner: false, contactPreference: 'In-app chat',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to post job');
    }
  };

  const inputClass = "mt-1.5 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#121212] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Progress */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] flex items-center gap-3">
            <div className="bg-[#0F172A] p-2.5 rounded-xl shadow-lg shadow-slate-900/20">
              <FaBriefcase className="text-white text-lg" />
            </div>
            Create a New Job Post
          </h1>
          <div className="mt-6 flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0F172A] rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-300 ${step >= num ? 'bg-[#0F172A] text-white ring-4 ring-white' : 'bg-gray-200 text-gray-400 ring-4 ring-white'}`}>
                {step > num ? <FaCheck size={12} /> : num}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-gray-100 p-6 md:p-8">
          
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-[#121212] mb-4">Step 1: Role & Location</h2>
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

          {/* STEP 2: Skills & Compensation */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-[#121212] mb-4">Step 2: Skills & Compensation</h2>
              <div>
                <label className={labelClass}>Must-Have Skills (Press Enter to add)</label>
                <div className="mt-1.5 p-2 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#0F172A] transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-[#0F172A] px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
                        {skill} <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                      </span>
                    ))}
                  </div>
                  <input type="text" placeholder="e.g., React, Figma" className="w-full outline-none text-sm p-1" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillAdd} />
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
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="number" name="salaryMin" placeholder="Min" className={inputClass} value={formData.salaryMin} onChange={handleChange} />
                  <span className="text-gray-400 font-medium">-</span>
                  <input type="number" name="salaryMax" placeholder="Max" className={inputClass} value={formData.salaryMax} onChange={handleChange} />
                  <select name="salaryType" className={`${inputClass} !mt-0 !w-auto`} value={formData.salaryType} onChange={handleChange}>
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Smart Screening */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-[#121212] mb-4">Step 3: Smart Screening</h2>
              <div>
                <label className={labelClass}>Job Description</label>
                <textarea name="description" rows={5} placeholder="Describe the responsibilities, perks, and ideal candidate..." className={`${inputClass} resize-none`} value={formData.description} onChange={handleChange}></textarea>
              </div>
              <div>
                <label className={labelClass}>Screening Question (to prevent fake matches)</label>
                <input type="text" name="screeningQuestion" placeholder="e.g., Share a link to your best AR/VR project." className={inputClass} value={formData.screeningQuestion} onChange={handleChange} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="immediate" name="immediateJoiner" className="w-5 h-5 accent-[#0F172A] rounded border-gray-300" checked={formData.immediateJoiner} onChange={handleChange} />
                <label htmlFor="immediate" className="text-sm font-semibold text-gray-700 cursor-pointer">Requires Immediate Joiner (0-15 days notice)</label>
              </div>
            </div>
          )}

          {/* STEP 4: Preview & Publish */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[#121212] mb-2">Step 4: Preview & Match</h2>
              
              {/* Preview Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FACC15] text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-lg">PREVIEW</div>
                <h3 className="text-2xl font-bold text-[#0F172A]">{formData.title || 'Untitled Role'}</h3>
                <p className="text-sm text-gray-500 mt-1">{formData.industry} • {formData.workMode} • {formData.location}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">{s}</span>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 font-medium">Experience</p>
                    <p className="font-semibold text-[#121212]">{formData.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Salary</p>
                    <p className="font-semibold text-[#121212]">${formData.salaryMin} - ${formData.salaryMax} / {formData.salaryType}</p>
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

          {/* Form Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 text-gray-500 font-bold hover:text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2">
                <FaArrowLeft /> Back
              </button>
            ) : <div></div>}

            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                Next Step <FaArrowRight />
              </button>
            ) : (
          <button onClick={handleSubmit} disabled={isLoading} className="px-8 py-3 bg-[#FACC15] text-slate-900 font-black rounded-xl hover:bg-yellow-500 shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Posting...' : 'Post & Match'} <FaCheck />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default JobPostPage;
