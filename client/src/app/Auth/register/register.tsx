'use client';

import React, { useState } from 'react';
import { FaTimes, FaUser, FaBuilding, FaArrowLeft } from 'react-icons/fa';

interface RegisterModalProps {
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'seeker' | 'employer' | null>(null);
  const [isRobotChecked, setIsRobotChecked] = useState(false);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const renderStep1 = () => (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input id="name" name="name" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="email-register" className="block text-sm font-medium text-gray-700">Email address</label>
          <input id="email-register" name="email" type="email" autoComplete="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="password-register" className="block text-sm font-medium text-gray-700">Password</label>
          <input id="password-register" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input id="confirm-password" name="confirm-password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Continue
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button className="font-medium text-blue-600 hover:text-blue-500">
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
      <h2 className="text-2xl font-bold text-center mb-2">Join as a Job Seeker or Employer</h2>
      <p className="text-center text-gray-500 mb-8">Get started by telling us what you're looking for.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => { setRole('seeker'); handleNext(); }}
          className="p-6 border-2 border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
        >
          <FaUser className="mx-auto text-4xl text-blue-600 mb-4" />
          <h3 className="font-bold text-lg text-gray-900">I'm a Job Seeker</h3>
          <p className="text-sm text-gray-600 mt-1">Find your next role, connect with companies.</p>
        </div>
        <div
          onClick={() => { setRole('employer'); handleNext(); }}
          className="p-6 border-2 border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
        >
          <FaBuilding className="mx-auto text-4xl text-blue-600 mb-4" />
          <h3 className="font-bold text-lg text-gray-900">I'm an Employer</h3>
          <p className="text-sm text-gray-600 mt-1">Hire top talent, post job openings.</p>
        </div>
      </div>
    </>
  );

  const renderSeekerStep3 = () => (
    <>
      <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors">
        <FaArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-center mb-6">Basic Information</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700">Professional Headline</label>
          <input id="headline" name="headline" type="text" placeholder="e.g., Senior Software Engineer at TechCorp" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input id="location" name="location" type="text" placeholder="e.g., San Francisco, CA" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
      <h2 className="text-2xl font-bold text-center mb-6">Experience & Education</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
            <select id="experience" name="experience" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">Select Level</option>
              <option>Entry Level</option>
              <option>Mid Level</option>
              <option>Senior Level</option>
              <option>Executive</option>
            </select>
          </div>
          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
            <input id="education" name="education" type="text" placeholder="Highest Degree" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
      <h2 className="text-2xl font-bold text-center mb-6">Skills & Resume</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (isRobotChecked) onClose(); /* Final step */ }}>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
          <input id="skills" name="skills" type="text" placeholder="e.g. React, Node.js, Design" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">Upload your Resume</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
            </div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
          <input
            id="robot-check-seeker"
            type="checkbox"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="robot-check-seeker" className="ml-3 block text-sm text-gray-700 cursor-pointer select-none">
            I am not a robot
          </label>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={!isRobotChecked} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isRobotChecked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}>
            Complete Registration
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
      <h2 className="text-2xl font-bold text-center mb-6">Tell us about your company</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (isRobotChecked) onClose(); /* Final step */ }}>
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">Company Name</label>
          <input id="company-name" name="company-name" type="text" placeholder="e.g., TechCorp Inc." required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="company-size" className="block text-sm font-medium text-gray-700">Company Size</label>
          <select id="company-size" name="company-size" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option>1-10 employees</option>
            <option>11-50 employees</option>
            <option>51-200 employees</option>
            <option>201-500 employees</option>
            <option>501+ employees</option>
          </select>
        </div>
        <div>
          <label htmlFor="phone-employer" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input id="phone-employer" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
            <input id="industry" name="industry" type="text" placeholder="e.g. Technology" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
            <input id="website" name="website" type="url" placeholder="https://example.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="your-role" className="block text-sm font-medium text-gray-700">Your Role</label>
          <input id="your-role" name="your-role" type="text" placeholder="e.g., Hiring Manager" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Company Description</label>
          <textarea id="description" name="description" rows={3} placeholder="Briefly describe your company..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
          <input
            id="robot-check-employer"
            type="checkbox"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="robot-check-employer" className="ml-3 block text-sm text-gray-700 cursor-pointer select-none">
            I am not a robot
          </label>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={!isRobotChecked} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isRobotChecked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}>
            Complete Registration
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
          <FaTimes size={24} />
        </button>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default RegisterModal;
