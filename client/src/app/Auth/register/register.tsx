'use client';

import React, { useState } from 'react';
import { FaTimes, FaUser, FaBuilding, FaArrowLeft, FaCloudUploadAlt, FaCheck } from 'react-icons/fa';
import { useRegisterMutation } from '@/features/authApi';

interface RegisterModalProps {
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'seeker' | 'employer' | null>(null);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    headline: '',
    location: '',
    phone: '',
    experience: '',
    education: '',
    skills: '',
    companyName: '',
    companySize: '1-10 employees',
    industry: '',
    website: '',
    yourRole: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!isRobotChecked) return;
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const result = await register({ ...formData, role }).unwrap();
      localStorage.setItem('profile', JSON.stringify({ ...result }));
      setSuccessMessage('Registration successful! Welcome aboard.');
      console.log('Registration success:', result);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Calculate progress
  const totalSteps = role === 'employer' ? 3 : 5;
  const progress = Math.min((step / totalSteps) * 100, 100);

  // Common Styles
  const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const btnPrimary = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-violet-500/20 text-sm font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-all duration-200 transform hover:-translate-y-0.5";
  const btnDisabled = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-none text-sm font-bold text-white bg-gray-400 cursor-not-allowed transition-all duration-200";

  const renderStep1 = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#121212]">Create an Account</h2>
        <p className="text-sm text-gray-500 mt-2">Join thousands of professionals today.</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div>
          <label htmlFor="name" className={labelClass}>Full Name</label>
          <input id="name" name="name" type="text" placeholder="John Doe" required className={inputClass} value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email-register" className={labelClass}>Email address</label>
          <input id="email-register" name="email" type="email" autoComplete="email" placeholder="john@example.com" required className={inputClass} value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="password-register" className={labelClass}>Password</label>
          <input id="password-register" name="password" type="password" placeholder="••••••••" required className={inputClass} value={formData.password} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="confirm-password" className={labelClass}>Confirm Password</label>
          <input id="confirm-password" name="confirmPassword" type="password" placeholder="••••••••" required className={inputClass} value={formData.confirmPassword} onChange={handleChange} />
        </div>
        <div className="pt-4">
          <button type="submit" className={btnPrimary}>
            Continue
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-xs text-gray-500">
        Already have an account?{' '}
        <button className="font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
          Sign in
        </button>
      </p>
    </>
  );

  const renderStep2 = () => (
    <>
      <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-center mb-2 text-[#121212]">Join as a Job Seeker or Employer</h2>
      <p className="text-center text-gray-500 mb-8 text-sm">Get started by telling us what you're looking for.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => { setRole('seeker'); handleNext(); }}
          className="p-6 border-2 border-gray-100 rounded-2xl text-center cursor-pointer hover:border-violet-600 hover:bg-violet-50/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#7C3AED] transition-colors duration-300"><FaUser className="text-2xl text-[#7C3AED] group-hover:text-white transition-colors duration-300" /></div>
          <h3 className="font-bold text-lg text-[#121212] mb-2">I'm a Job Seeker</h3>
          <p className="text-xs text-gray-500 leading-relaxed">Find your next role, connect with companies, and build your career.</p>
        </div>
        <div
          onClick={() => { setRole('employer'); handleNext(); }}
          className="p-6 border-2 border-gray-100 rounded-2xl text-center cursor-pointer hover:border-violet-600 hover:bg-violet-50/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#7C3AED] transition-colors duration-300"><FaBuilding className="text-2xl text-[#7C3AED] group-hover:text-white transition-colors duration-300" /></div>
          <h3 className="font-bold text-lg text-[#121212] mb-2">I'm an Employer</h3>
          <p className="text-xs text-gray-500 leading-relaxed">Hire top talent, post job openings, and manage your team.</p>
        </div>
      </div>
    </>
  );

  const renderSeekerStep3 = () => (
    <>
      <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-center mb-6 text-[#121212]">Basic Information</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div>
          <label htmlFor="headline" className={labelClass}>Professional Headline</label>
          <input id="headline" name="headline" type="text" placeholder="e.g., Senior Software Engineer" required className={inputClass} value={formData.headline} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Location</label>
          <input id="location" name="location" type="text" placeholder="e.g., San Francisco, CA" required className={inputClass} value={formData.location} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className={inputClass} value={formData.phone} onChange={handleChange} />
        </div>
        <div className="pt-4">
          <button type="submit" className={btnPrimary}>
            Next Step
          </button>
        </div>
      </form>
    </>
  );

  const renderSeekerStep4 = () => (
    <>
      <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-center mb-6 text-[#121212]">Experience & Education</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="experience" className={labelClass}>Experience</label>
            <select id="experience" name="experience" className={inputClass} value={formData.experience} onChange={handleChange}>
              <option value="">Select Level</option>
              <option>Entry Level</option>
              <option>Mid Level</option>
              <option>Senior Level</option>
              <option>Executive</option>
            </select>
          </div>
          <div>
            <label htmlFor="education" className={labelClass}>Education</label>
            <input id="education" name="education" type="text" placeholder="Highest Degree" className={inputClass} value={formData.education} onChange={handleChange} />
          </div>
        </div>
        <div className="pt-4">
          <button type="submit" className={btnPrimary}>
            Next Step
          </button>
        </div>
      </form>
    </>
  );

  const renderSeekerStep5 = () => (
    <>
      <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-center mb-6 text-[#121212]">Skills & Resume</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div>
          <label htmlFor="skills" className={labelClass}>Skills</label>
          <input id="skills" name="skills" type="text" placeholder="e.g. React, Node.js, Design" className={inputClass} value={formData.skills} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="resume" className={labelClass}>Upload your Resume</label>
          <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-200 border-dashed rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 cursor-pointer group">
            <div className="space-y-1 text-center">
              <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 group-hover:text-violet-500 transition-colors" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[#7C3AED] hover:text-[#6D28D9] focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
            </div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-colors">
          <input
            id="robot-check-seeker"
            type="checkbox"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="h-5 w-5 text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300 rounded cursor-pointer transition-all"
          />
          <label htmlFor="robot-check-seeker" className="ml-3 block text-sm text-gray-700 cursor-pointer select-none">
            I am not a robot
          </label>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={!isRobotChecked || isLoading} className={isRobotChecked && !isLoading ? btnPrimary : btnDisabled}>
            {isLoading ? 'Registering...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </>
  );

  const renderEmployerStep3 = () => (
    <>
      <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-center mb-6 text-[#121212]">Tell us about your company</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div>
          <label htmlFor="company-name" className={labelClass}>Company Name</label>
          <input id="company-name" name="companyName" type="text" placeholder="e.g., TechCorp Inc." required className={inputClass} value={formData.companyName} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="company-size" className={labelClass}>Company Size</label>
          <select id="company-size" name="companySize" required className={inputClass} value={formData.companySize} onChange={handleChange}>
            <option>1-10 employees</option>
            <option>11-50 employees</option>
            <option>51-200 employees</option>
            <option>201-500 employees</option>
            <option>501+ employees</option>
          </select>
        </div>
        <div>
          <label htmlFor="phone-employer" className={labelClass}>Phone Number</label>
          <input id="phone-employer" name="phone" type="tel" placeholder="+1 (555) 000-0000" className={inputClass} value={formData.phone} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className={labelClass}>Industry</label>
            <input id="industry" name="industry" type="text" placeholder="e.g. Technology" className={inputClass} value={formData.industry} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="website" className={labelClass}>Website</label>
            <input id="website" name="website" type="url" placeholder="https://example.com" className={inputClass} value={formData.website} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label htmlFor="your-role" className={labelClass}>Your Role</label>
          <input id="your-role" name="yourRole" type="text" placeholder="e.g., Hiring Manager" required className={inputClass} value={formData.yourRole} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Company Description</label>
          <textarea id="description" name="description" rows={3} placeholder="Briefly describe your company..." className={inputClass} value={formData.description} onChange={handleChange}></textarea>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-colors">
          <input
            id="robot-check-employer"
            type="checkbox"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="h-5 w-5 text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300 rounded cursor-pointer transition-all"
          />
          <label htmlFor="robot-check-employer" className="ml-3 block text-sm text-gray-700 cursor-pointer select-none">
            I am not a robot
          </label>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={!isRobotChecked || isLoading} className={isRobotChecked && !isLoading ? btnPrimary : btnDisabled}>
            {isLoading ? 'Registering...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        if (role === 'seeker') return renderSeekerStep3();
        if (role === 'employer') return renderEmployerStep3();
        // Fallback in case role is not set, though UI flow should prevent this
        return renderStep2();
      case 4:
        if (role === 'seeker') return renderSeekerStep4();
        return renderStep2();
      case 5:
        if (role === 'seeker') return renderSeekerStep5();
        return renderStep2();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-gray-100 w-full">
           <div className="absolute top-0 left-0 h-full bg-[#7C3AED] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors z-10">
          <FaTimes size={24} />
        </button>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {successMessage ? (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <FaCheck className="text-3xl text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#121212] mb-2">Success!</h3>
              <p className="text-gray-500 text-center">{successMessage}</p>
            </div>
          ) : (
            renderCurrentStep()
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
