'use client';

import React, { useEffect, useState } from 'react';
import { FaTimes, FaUser, FaBuilding, FaArrowLeft, FaCloudUploadAlt, FaCheck, FaCheckCircle } from 'react-icons/fa';
import { useRegisterMutation, useUpdateProfileMutation } from '@/features/authApi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface RegisterModalProps {
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'seeker' | 'employer' | null>(null);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

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
    description: '',
    gstNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.name === 'gstNumber' ? e.target.value.toUpperCase() : e.target.value });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('msg91-script-register')) {
      const script = document.createElement('script');
      script.id = 'msg91-script-register';
      script.src = "https://verify.msg91.com/otp-provider.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleVerifyPhoneAndProceed = (onSuccess: (verifiedOverride?: boolean) => void) => {
    if (!formData.phone) {
      toast.error("Please enter a phone number first.");
      return;
    }
    let cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    
    if ((window as any).initSendOTP) {
      (window as any).initSendOTP({
        widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "",
        tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || "",
        identifier: cleanPhone,
        success: (data: any) => {
          toast.success("Phone verified successfully!");
          setIsPhoneVerified(true);
          onSuccess(true); // Automatically proceed to next step / submit
        },
        failure: (error: any) => {
          toast.error(error?.message || "Failed to verify OTP via MSG91");
        }
      });
    } else {
      toast.error("MSG91 SDK is not loaded yet.");
    }
  };

  const handleVerifyPhone = () => {
    handleVerifyPhoneAndProceed(() => {});
  };

  const handleSubmit = async (verifiedOverride: boolean = false) => {
    if (!isRobotChecked) return;
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await register({ ...formData, role, isPhoneVerified: isPhoneVerified || verifiedOverride }).unwrap();
      
      // Normalize backend response to always have the 'result' key for consistency
      const normalizedUser = result.result || result.user || result;
      let finalProfileData = { ...result, result: normalizedUser };
      
      // Token ko pehle hi save karein taaki resume upload ki request authenticate ho sake
      localStorage.setItem('profile', JSON.stringify(finalProfileData));

      // Immediately upload resume if candidate attached one
      if (resumeFile && role === 'seeker') {
         try {
           const uploadData = new FormData();
           uploadData.append('_id', String(result.result._id));
           
           // Attach all form data so backend middlewares have full context (similar to profile update)
           Object.entries(formData).forEach(([key, value]) => {
             uploadData.append(key, String(value));
           });
           
           uploadData.append('resume', resumeFile);
           const updateRes = await updateProfile(uploadData).unwrap();
           finalProfileData = { ...finalProfileData, result: updateRes.result };
         } catch (resumeError: any) {
           console.error('Resume upload failed during registration:', resumeError);
           toast.error(resumeError?.data?.message || 'Registered successfully, but resume upload failed.');
         }
      }

      // Final updated data ko wapas save karein
      localStorage.setItem('profile', JSON.stringify(finalProfileData));
      toast.success('Registration successful! Welcome aboard.');
      console.log('Registration success:', finalProfileData);
      setTimeout(() => {
        onClose();
        if (role === 'employer') {
          router.push('/employer/dashboard');
        } else {
          router.push('/Candidate/Dashboard');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Failed to register:', error);
      toast.error(error?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Calculate progress
  const totalSteps = role === 'employer' ? 3 : 5;
  const progress = Math.min((step / totalSteps) * 100, 100);

  // Common Styles
  const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#121212] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const btnPrimary = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#e49d04]/20 text-sm font-bold text-[#0B0C10] bg-[#e49d04] hover:bg-[#cc8c03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e49d04] transition-all duration-200 transform hover:-translate-y-0.5";
  const btnDisabled = "w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-none text-sm font-bold text-white bg-gray-400 cursor-not-allowed transition-all duration-200";

  const renderStep1 = () => (
    <>
      <form className="space-y-4" onSubmit={(e) => { 
        e.preventDefault(); 
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        handleNext();
      }}>
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
        <button type="button" onClick={() => { onClose(); setTimeout(() => document.getElementById('nav-signin-btn')?.click(), 100); }} className="font-bold text-[#0F172A] hover:text-[#1E293B] transition-colors">
          Sign in
        </button>
      </p>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => { setRole('seeker'); handleNext(); }}
          className="p-6 border-2 border-gray-100 rounded-2xl text-center cursor-pointer hover:border-slate-800 hover:bg-slate-50/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0F172A] transition-colors duration-300"><FaUser className="text-2xl text-[#0F172A] group-hover:text-white transition-colors duration-300" /></div>
          <h3 className="font-bold text-lg text-[#121212] mb-2">I'm a Job Seeker</h3>
          <p className="text-xs text-gray-500 leading-relaxed">Find your next role, connect with companies, and build your career.</p>
        </div>
        <div
          onClick={() => { setRole('employer'); handleNext(); }}
          className="p-6 border-2 border-gray-100 rounded-2xl text-center cursor-pointer hover:border-slate-800 hover:bg-slate-50/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0F172A] transition-colors duration-300"><FaBuilding className="text-2xl text-[#0F172A] group-hover:text-white transition-colors duration-300" /></div>
          <h3 className="font-bold text-lg text-[#121212] mb-2">I'm an Employer</h3>
          <p className="text-xs text-gray-500 leading-relaxed">Hire top talent, post job openings, and manage your team.</p>
        </div>
      </div>
    </>
  );

  const renderSeekerStep3 = () => (
    <>
      <form className="space-y-4" onSubmit={(e) => { 
        e.preventDefault(); 
        if (!isPhoneVerified) {
          toast.error("Please verify your phone number using OTP to continue.");
          return;
        }
        handleNext(); 
      }}>
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
          <div className="flex items-center gap-2">
            <input id="phone" name="phone" type="tel" required placeholder="+91 9999999999" className={inputClass.replace('mt-1', 'mt-0')} value={formData.phone} onChange={handleChange} disabled={isPhoneVerified} />
            {isPhoneVerified ? (
              <span className="text-green-600 font-bold flex items-center gap-1 px-4 py-3 bg-green-50 rounded-xl whitespace-nowrap border border-green-200"><FaCheckCircle /> Verified</span>
            ) : (
              <button type="button" onClick={handleVerifyPhone} className="px-5 py-3 bg-[#121212] text-[#e49d04] font-bold rounded-xl whitespace-nowrap hover:bg-[#1F2833] transition-colors shadow-md">Send OTP</button>
            )}
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

  const renderSeekerStep4 = () => (
    <>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div>
          <label htmlFor="skills" className={labelClass}>Skills</label>
          <input id="skills" name="skills" type="text" placeholder="e.g. React, Node.js, Design" className={inputClass} value={formData.skills} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="resume" className={labelClass}>Upload your Resume</label>
          <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-200 border-dashed rounded-xl hover:border-slate-700 hover:bg-slate-50 transition-all duration-300 cursor-pointer group">
            <div className="space-y-1 text-center">
              <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 group-hover:text-slate-600 transition-colors" />
              <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[#0F172A] hover:text-[#1E293B] focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={(e) => {
                    if(e.target.files && e.target.files[0]) setResumeFile(e.target.files[0]);
                  }} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
              {resumeFile && (
                 <p className="text-sm font-bold text-[#0F172A] mt-2 border border-[#0F172A]/20 bg-[#0F172A]/5 py-1 px-3 rounded-full inline-block">
                    {resumeFile.name}
                 </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-slate-300 transition-colors">
          <input
            id="robot-check-seeker"
            type="checkbox"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="h-5 w-5 text-[#0F172A] focus:ring-[#0F172A] border-gray-300 rounded cursor-pointer transition-all"
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
      <form className="space-y-4" onSubmit={(e) => { 
        e.preventDefault(); 
        if (!isPhoneVerified) {
          toast.error("Please verify your phone number using OTP to continue.");
          return;
        }
        handleSubmit(); 
      }}>
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
          <div className="flex items-center gap-2">
            <input id="phone-employer" name="phone" type="tel" required placeholder="+91 9999999999" className={inputClass.replace('mt-1', 'mt-0')} value={formData.phone} onChange={handleChange} disabled={isPhoneVerified} />
            {isPhoneVerified ? (
              <span className="text-green-600 font-bold flex items-center gap-1 px-4 py-3 bg-green-50 rounded-xl whitespace-nowrap border border-green-200"><FaCheckCircle /> Verified</span>
            ) : (
              <button type="button" onClick={handleVerifyPhone} className="px-5 py-3 bg-[#121212] text-[#e49d04] font-bold rounded-xl whitespace-nowrap hover:bg-[#1F2833] transition-colors shadow-md">Send OTP</button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label htmlFor="gst-number" className={labelClass}>GST Number <span className="text-gray-400 normal-case font-medium text-[10px] ml-1">(Optional)</span></label>
          <input id="gst-number" name="gstNumber" type="text" placeholder="22AAAAA0000A1Z5" className={`${inputClass} uppercase`} value={formData.gstNumber} onChange={handleChange} maxLength={15} pattern="^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ][0-9a-zA-Z]{1}$" title="Please enter a valid 15-character Indian GST Number" />
          <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1"><FaCheckCircle className="text-[#e49d04]" /> Get a verification badge by submitting your GST No.</p>
        </div>
        <div>
          <label htmlFor="your-role" className={labelClass}>Your Role</label>
          <input id="your-role" name="yourRole" type="text" placeholder="e.g., Hiring Manager" required className={inputClass} value={formData.yourRole} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Company Description</label>
          <textarea id="description" name="description" rows={3} placeholder="Briefly describe your company..." className={inputClass} value={formData.description} onChange={handleChange}></textarea>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-slate-300 transition-colors">
          <input
            id="robot-check-employer"
            type="checkbox"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="h-5 w-5 text-[#0F172A] focus:ring-[#0F172A] border-gray-300 rounded cursor-pointer transition-all"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in-up overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-gray-100 w-full shrink-0">
           <div className="absolute top-0 left-0 h-full bg-[#0F172A] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0 bg-white z-10">
          {step > 1 ? (
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-500 hover:text-[#0F172A] hover:bg-gray-100 rounded-full transition-colors">
              <FaArrowLeft size={18} />
            </button>
          ) : (
            <div className="w-8"></div>
          )}
          
          <div className="flex-1 text-center px-2 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#121212] truncate">
              {step === 1 && "Create an Account"}
              {step === 2 && "Choose Account Type"}
              {step === 3 && role === 'seeker' && "Basic Information"}
              {step === 4 && role === 'seeker' && "Experience & Education"}
              {step === 5 && role === 'seeker' && "Skills & Resume"}
              {step === 3 && role === 'employer' && "Tell us about your company"}
            </h2>
            {step === 1 && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">Join thousands of professionals today.</p>}
            {step === 2 && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">What are you looking for?</p>}
          </div>

          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-[#EF4444] hover:bg-red-50 rounded-full transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
