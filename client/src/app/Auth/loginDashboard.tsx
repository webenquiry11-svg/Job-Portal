'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FaEnvelope, FaSearch, FaFileAlt, FaBell, FaBuilding, FaQuoteLeft, FaBriefcase, FaUsers, FaUser, FaHeadset, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaArrowRight, FaTimes, FaFilter, FaSpinner, FaQuestionCircle, FaShieldAlt, FaLock, FaFileContract, FaCoins, FaUnlock, FaChevronDown, FaCheckCircle } from 'react-icons/fa';
import LoginModal from './login/login';
import Link from 'next/link';
import { useGetAllJobsQuery } from '@/features/jobapi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

const LoginDashboard = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [appliedSearchTitle, setAppliedSearchTitle] = useState('');
  const [appliedSearchLocation, setAppliedSearchLocation] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterWorkMode, setFilterWorkMode] = useState('');
  const [filterExperience, setFilterExperience] = useState('');

  const { data: allJobs = [], isLoading } = useGetAllJobsQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearchTitle(searchTitle);
    setAppliedSearchLocation(searchLocation);
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isSearching = appliedSearchTitle || appliedSearchLocation || filterIndustry || filterWorkMode || filterExperience;

  const filteredRealJobs = allJobs.filter((job: any) => {
    const query = appliedSearchTitle.toLowerCase();
    const locQuery = appliedSearchLocation.toLowerCase();
    const matchesTitle = !query || job.title?.toLowerCase().includes(query) || job.employerId?.companyName?.toLowerCase().includes(query) || job.employerId?.name?.toLowerCase().includes(query) || job.skills?.some((s: string) => s.toLowerCase().includes(query));
    const matchesLocation = !locQuery || job.location?.toLowerCase().includes(locQuery);
    const matchesIndustry = !filterIndustry || job.industry === filterIndustry;
    const matchesWorkMode = !filterWorkMode || job.workMode === filterWorkMode;
    const matchesExperience = !filterExperience || job.experience === filterExperience;
    return matchesTitle && matchesLocation && matchesIndustry && matchesWorkMode && matchesExperience;
  }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const realJobsToShow = filteredRealJobs.slice(0, 6);

  const dummyJobs = [
    { 
      _id: 'dummy1', title: 'Senior UI/UX Designer', employerId: { companyName: 'Creative Solutions', name: 'Creative Solutions' }, workMode: 'Remote', location: 'Anywhere, India', salaryMin: 90000, salaryMax: 140000, createdAt: new Date(Date.now() - 86400000).toISOString(), skills: ['Figma', 'UI/UX', 'Prototyping'],
      description: 'We are looking for an experienced Senior UI/UX Designer to lead our design system. You will be responsible for creating highly intuitive and visually appealing interfaces for our core products. Must have a strong portfolio demonstrating user-centered design solutions.',
      experience: '4-6 Years', salaryType: 'Yearly', contactPreference: 'Email', immediateJoiner: true, screeningQuestion: 'Please share a link to your Dribbble/Behance portfolio.'
    },
    { 
      _id: 'dummy2', title: 'Lead Backend Engineer (Node.js)', employerId: { companyName: 'Innovatech', name: 'Innovatech' }, workMode: 'Hybrid', location: 'Bangalore, IN', salaryMin: 120000, salaryMax: 180000, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), skills: ['Node.js', 'AWS', 'PostgreSQL'],
      description: 'Join our engineering team to architect and scale our backend infrastructure. You will work on microservices, optimize database queries, and ensure system reliability for millions of requests per day.',
      experience: '5+ Years', salaryType: 'Yearly', contactPreference: 'Phone', immediateJoiner: false
    },
    { 
      _id: 'dummy3', title: 'Digital Marketing Manager', employerId: { companyName: 'MarketPro', name: 'MarketPro' }, workMode: 'On-site', location: 'Mumbai, IN', salaryMin: 70000, salaryMax: 110000, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), skills: ['SEO', 'SEM', 'Social Media'],
      description: 'Drive our digital presence by managing SEO, SEM, and social media campaigns. You will analyze performance metrics, optimize conversion rates, and collaborate with the content team to boost brand awareness.',
      experience: '3-5 Years', salaryType: 'Monthly', contactPreference: 'Email', immediateJoiner: true, screeningQuestion: 'What is the largest marketing budget you have managed?'
    },
    { 
      _id: 'dummy4', title: 'Data Scientist', employerId: { companyName: 'Data Insights Co.', name: 'Data Insights Co.' }, workMode: 'Remote', location: 'Anywhere, India', salaryMin: 110000, salaryMax: 160000, createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), skills: ['Python', 'ML', 'TensorFlow'],
      description: 'We are seeking a Data Scientist to build predictive models and extract actionable insights from large datasets. You should have strong mathematical fundamentals and proficiency in machine learning frameworks.',
      experience: '2-4 Years', salaryType: 'Yearly', contactPreference: 'Email', immediateJoiner: false
    },
  ];

  let displayJobs = [...realJobsToShow];
  const MIN_JOBS_TO_SHOW = 4;

  // Only add dummy jobs if no search is active and we have less than the minimum required jobs
  if (!isSearching && displayJobs.length < MIN_JOBS_TO_SHOW) {
      const dummyJobsNeeded = MIN_JOBS_TO_SHOW - displayJobs.length;
      displayJobs.push(...dummyJobs.slice(0, dummyJobsNeeded));
  }

  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        setUser(profile.result || profile.user || profile);
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleOpenModal = () => setIsLoginModalOpen(true);
    window.addEventListener('openLoginModal', handleOpenModal);
    return () => window.removeEventListener('openLoginModal', handleOpenModal);
  }, []);

  // Intercept the token coming back from Passport.js Redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Auto-redirect lowercase URLs to match the exact case of the folders
      const currentPath = window.location.pathname;
      if (currentPath === '/admin') {
        window.location.replace('/Admin');
        return;
      } else if (currentPath.toLowerCase() === '/admin/dashboard' && currentPath !== '/Admin/Dashboard') {
        window.location.replace('/Admin/Dashboard');
        return;
      } else if (currentPath.toLowerCase() === '/candidate/dashboard' && currentPath !== '/Candidate/Dashboard') {
        window.location.replace('/Candidate/Dashboard');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          localStorage.setItem('profile', JSON.stringify({ result: user, token }));
          toast.success('Successfully logged in with social account!');
          
          // Clean the URL so the token doesn't stay visible
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (user.role === 'employer') {
            window.location.href = '/employer/dashboard';
          } else {
            window.location.href = '/Candidate/Dashboard';
          }
        } catch (error) {
          console.error('Failed to parse social login data', error);
          toast.error('Social login failed.');
        }
      }
    }
  }, [router]);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') return 'http://localhost:5000';
      let url = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      if (window.location.protocol === 'https:' && url.startsWith('http://')) url = url.replace('http://', 'https://');
      return url;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  };

  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${getApiUrl()}/auth/microsoft`;
  };

  const handleProtectedAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user) {
      router.push(user.role === 'employer' ? '/employer/dashboard' : '/Candidate/Dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="grow flex flex-col">
      {/* REDESIGNED PREMIUM HERO SECTION */}
      <section className="relative bg-[#F8FAFC] overflow-hidden pt-20 lg:pt-32 pb-12 lg:pb-20">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#e49d04]/10 via-transparent to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute -left-40 top-40 w-150 h-150 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="w-full lg:w-[55%] text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-[#0B0C10] text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e49d04] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e49d04]"></span>
                </span>
                India's Premium Job Network
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#121212] mb-6 leading-[1.15] tracking-tight">
                Land your dream <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e49d04] to-yellow-600 relative inline-block">
                  career today.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400/50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="transparent"/></svg>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 font-medium mb-10 max-w-lg leading-relaxed">
                Connect with leading enterprises and innovative startups. Over <span className="text-[#0B0C10] font-bold">50 lakh+</span> opportunities waiting for you.
              </p>

              {/* Modern Search Bar */}
              <form onSubmit={handleSearch} className="bg-white p-2.5 rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row gap-2 max-w-4xl mb-12 relative z-20 transition-all hover:shadow-[0_20px_50px_rgb(228,157,4,0.1)]">
                <div className="flex items-center flex-1 hover:bg-gray-50 transition-colors rounded-3xl px-5 py-3">
                  <FaSearch className="text-[#e49d04] mr-3 text-lg shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Job title, skill, or company" 
                    className="w-full bg-transparent outline-none text-[#121212] text-sm md:text-base font-semibold placeholder-gray-400"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>
                
                <div className="hidden md:block w-px h-10 bg-gray-100 self-center"></div>
                
                <div className="flex items-center flex-1 hover:bg-gray-50 transition-colors rounded-3xl px-5 py-3 relative">
                  <FaMapMarkerAlt className="text-[#e49d04] mr-3 text-lg shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Location or 'Remote'" 
                    className="w-full bg-transparent outline-none text-[#121212] text-sm md:text-base font-semibold placeholder-gray-400"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                
                <button type="submit" className="w-full md:w-auto bg-[#0B0C10] hover:bg-[#1f2833] text-[#e49d04] shadow-lg shadow-black/10 font-bold py-4 px-10 rounded-[1.5rem] transition-all transform hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2">
                  Search <FaArrowRight className="text-sm" />
                </button>
              </form>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="flex -space-x-4">
                   <img className="w-12 h-12 rounded-full border-[3px] border-[#F8FAFC] object-cover shadow-sm hover:-translate-y-1 transition-transform cursor-pointer" src="https://img.freepik.com/free-photo/handsome-bearded-businessman-rubbing-hands-having-deal_176420-18778.jpg" alt="User" />
                   <img className="w-12 h-12 rounded-full border-[3px] border-[#F8FAFC] object-cover shadow-sm hover:-translate-y-1 transition-transform cursor-pointer" src="https://img.freepik.com/free-photo/close-up-portrait-smiling-young-woman-looking-camera_171337-17994.jpg" alt="User" />
                   <img className="w-12 h-12 rounded-full border-[3px] border-[#F8FAFC] object-cover shadow-sm hover:-translate-y-1 transition-transform cursor-pointer" src="https://img.freepik.com/free-photo/portrait-optimistic-businessman-blind-test-smiling_1262-21111.jpg" alt="User" />
                   <div className="w-12 h-12 rounded-full border-[3px] border-[#F8FAFC] bg-[#e49d04] flex items-center justify-center text-xs font-black text-[#0B0C10] shadow-sm">+2M</div>
                </div>
                <p className="text-sm font-semibold text-gray-600 max-w-[200px] leading-snug">
                  Trusted by over <span className="text-[#121212] font-black">2 Million</span> professionals.
                </p>
              </div>

            </div>

            {/* Right Graphic Section */}
            <div className="hidden lg:flex w-full lg:w-[45%] mt-12 lg:mt-0 relative justify-center lg:justify-end">
               <div className="relative w-full max-w-[500px]">
                  {/* Abstract Background Effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#e49d04]/10 to-transparent rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '6s' }}></div>
                  
                  {/* Abstract SVG Blob */}
                  <svg className="absolute top-0 -right-10 w-full h-full text-[#e49d04]/5 transform -rotate-6 scale-110" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.7,-2.1C98.6,13.8,94.4,30.1,84.7,42.7C75.1,55.3,60,64.2,45.2,72.1C30.4,80,15.2,86.9,-0.6,88C-16.4,89.1,-32.8,84.4,-47.5,76.1C-62.2,67.8,-75.2,55.9,-83.4,41.6C-91.6,27.3,-95,10.6,-92.9,-5.3C-90.8,-21.2,-83.2,-36.3,-72.6,-48C-62,-59.7,-48.4,-68.1,-34.5,-75.1C-20.6,-82.1,-10.3,-87.7,2.3,-91.6C14.9,-95.5,29.8,-93.7,44.7,-76.4Z" transform="translate(100 100)" />
                  </svg>
                  
                  {/* Hero Image */}
                  <img 
                    src="/HeroSection.png" 
                    alt="Click4Jobs Hero" 
                    className="relative z-10 w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)] transform transition-transform hover:scale-[1.03] duration-700"
                  />
               </div>
            </div>
          </div>
          
          {/* Moving Marquee to bottom of the section in a neat separated banner */}
          <div className="mt-12 lg:mt-20 pt-8 lg:pt-10 border-t border-gray-100">
             <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Top Companies Hiring Right Now</p>
             <div className="w-full relative max-w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-marquee {
                    animation: marquee 30s linear infinite;
                    width: max-content;
                  }
                  .carousel-container:hover .animate-marquee {
                    animation-play-state: paused;
                  }
                `}</style>
                
                <div className="carousel-container overflow-hidden w-full relative">
                  <div className="animate-marquee flex grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 items-center">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center justify-center gap-12 md:gap-20 pr-12 md:pr-20 shrink-0">
                        <img src="/hero%20logos/airtel.png" alt="Airtel" className="h-12 md:h-16 w-auto object-contain" />
                        <img src="/hero%20logos/bajaj.webp" alt="Bajaj" className="h-12 md:h-16 w-auto object-contain" />
                        <img src="/hero%20logos/flipkart.webp" alt="Flipkart" className="h-20 md:h-28 w-auto object-contain" />
                        <img src="/hero%20logos/icici.png" alt="ICICI" className="h-20 md:h-28 w-auto object-contain" />
                        <img src="/hero%20logos/myntra.webp" alt="Myntra" className="h-10 md:h-12 w-auto object-contain" />
                        <img src="/hero%20logos/reliance.png" alt="Reliance" className="h-7 md:h-8 w-auto object-contain" />
                        <img src="/hero%20logos/paytm.png" alt="Paytm" className="h-8 md:h-10 w-auto object-contain" />
                        <img src="/hero%20logos/tcs.png" alt="TCS" className="h-20 md:h-28 w-auto object-contain" />
                        <img src="/hero%20logos/tech%20mahindra.png" alt="Tech Mahindra" className="h-16 md:h-24 w-auto object-contain" />
                        <img src="/hero%20logos/zomato.png" alt="Zomato" className="h-20 md:h-28 w-auto object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white py-16 lg:py-24 scroll-mt-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-6">Empowering India’s Workforce Through Intelligent Matching</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-left">
                <p>Welcome to Click4Jobs, India’s most efficient and transparent hiring ecosystem. We recognize that the traditional job search process—for both candidates and employers—is often time-consuming and fragmented. Our mission is to bridge the gap between incredible talent and top-tier companies across the entire country, from bustling metropolitan hubs to rapidly growing Tier-2 and Tier-3 cities.</p>
                <p>We operate on a simple philosophy: <span className="font-bold text-[#121212]">Skills matter most.</span> By leveraging advanced AI-driven matching technology, Click4Jobs moves beyond keyword-stuffed resumes to connect employers with candidates who possess the exact verified skills they need. Whether you are a fresh graduate entering the workforce, a skilled tradesperson, or an executive seeking a national leadership role, our platform is built to accelerate your success.</p>
                  <p className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 font-medium text-center shadow-sm">Built and backed by the technical excellence of <a href="https://volgainfosys.com/" target="_blank" rel="noopener noreferrer" className="font-black text-[#e49d04] hover:underline cursor-pointer">Volga Infosys Pvt Ltd</a>, Click4Jobs combines years of IT innovation with modern recruitment needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Enhanced) */}
      <section id="how-it-works" className="bg-gray-50 py-16 lg:py-24 scroll-mt-16">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">How It Works</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Click4Jobs operates on a dual-sided, transparent model designed to maximize efficiency for both job seekers and hiring managers.</p>
            </div>
            
            {/* For Candidates Section */}
            <div className="relative mb-16 lg:mb-24">
                {/* Connecting background line */}
                <div className="hidden md:block absolute top-[55%] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-gray-200 -z-10"></div>
                
                <h3 className="text-2xl font-black text-[#121212] mb-10 text-center flex items-center justify-center gap-3">
                  <span className="bg-[#e49d04] text-white px-5 py-2.5 rounded-xl shadow-md border border-[#e49d04]">For Candidates</span>
                  <span className="text-[#121212] drop-shadow-sm">Seamless Discovery</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#e49d04]/50 relative group overflow-hidden hover:-translate-y-2">
                        <div className="absolute -right-4 -top-6 text-[120px] font-black text-gray-50 group-hover:text-[#e49d04]/5 transition-colors z-0 select-none">1</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#e49d04]/10 text-[#e49d04] rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                <FaUser size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-[#121212] mb-3 group-hover:text-[#e49d04] transition-colors">Create Your Profile</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">Register for free and build a comprehensive profile detailing your skills, experience, and location preferences anywhere in India.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#e49d04]/50 relative group overflow-hidden hover:-translate-y-2 md:translate-y-6">
                        <div className="absolute -right-4 -top-6 text-[120px] font-black text-gray-50 group-hover:text-[#e49d04]/5 transition-colors z-0 select-none">2</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#e49d04]/10 text-[#e49d04] rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                <FaSearch size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-[#121212] mb-3 group-hover:text-[#e49d04] transition-colors">AI-Powered Matching</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">Our intelligent algorithm analyzes your data and automatically aligns your profile with open roles that fit your exact qualifications.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#e49d04]/50 relative group overflow-hidden hover:-translate-y-2">
                        <div className="absolute -right-4 -top-6 text-[120px] font-black text-gray-50 group-hover:text-[#e49d04]/5 transition-colors z-0 select-none">3</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#e49d04]/10 text-[#e49d04] rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                <FaBell size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-[#121212] mb-3 group-hover:text-[#e49d04] transition-colors">Get Scouted</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">Instead of sending countless applications into a void, Click4Jobs puts your verified profile directly in front of active employers.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* For Employers Section */}
            <div className="relative">
                {/* Connecting background line */}
                <div className="hidden md:block absolute top-[55%] left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-gray-200 -z-10"></div>
                
                <h3 className="text-2xl font-black text-[#121212] mb-10 text-center flex items-center justify-center gap-3">
                  <span className="bg-[#121212] text-[#e49d04] px-5 py-2.5 rounded-xl shadow-md border border-[#121212]">For Employers</span>
                  <span className="text-[#121212] drop-shadow-sm">Credit-Based Precision</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#e49d04]/50 relative group overflow-hidden hover:-translate-y-2">
                        <div className="absolute -right-4 -top-6 text-[120px] font-black text-gray-50 group-hover:text-[#e49d04]/5 transition-colors z-0 select-none">1</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#e49d04]/10 text-[#e49d04] rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                <FaBuilding size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-[#121212] mb-3 group-hover:text-[#e49d04] transition-colors">Post Opportunities</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">List your open roles on our Pan-India network quickly and easily at no base cost.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#e49d04]/50 relative group overflow-hidden hover:-translate-y-2 md:translate-y-6">
                        <div className="absolute -right-4 -top-6 text-[120px] font-black text-gray-50 group-hover:text-[#e49d04]/5 transition-colors z-0 select-none">2</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#e49d04]/10 text-[#e49d04] rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                <FaCoins size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-[#121212] mb-3 group-hover:text-[#e49d04] transition-colors">Purchase Match Credits</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">Transition away from expensive, flat-fee job postings. Employers purchase secure "Match Credits" via their Click4Jobs dashboard.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#e49d04]/50 relative group overflow-hidden hover:-translate-y-2">
                        <div className="absolute -right-4 -top-6 text-[120px] font-black text-gray-50 group-hover:text-[#e49d04]/5 transition-colors z-0 select-none">3</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#e49d04]/10 text-[#e49d04] rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                <FaUnlock size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-[#121212] mb-3 group-hover:text-[#e49d04] transition-colors">Unlock Verified Talent</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">Use credits to unlock the contact information of highly-matched candidates or boost job visibility. You only spend when you are ready.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      {/* Popular Categories Section - EXACT IMAGE MATCH */}
      <section id="categories-section" className="bg-[#F8FAFC] py-16 md:py-28 scroll-mt-16 overflow-hidden relative z-10">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#e49d04]/10 via-transparent to-transparent -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent -z-10 pointer-events-none"></div>

          <div className="container mx-auto px-6 md:px-12 mb-12">
              <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-[#e49d04] text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
                      🔥 Hot & Trending
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-[#121212] mb-4 tracking-tight">Explore Popular Categories</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">Discover thousands of active job opportunities in the most in-demand industries right now.</p>
              </div>
          </div>

          <style>{`
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes scroll-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            @keyframes scroll-up {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            
            .category-carousel-container:hover .scroll-track-1,
            .category-carousel-container:hover .scroll-track-2 {
              animation-play-state: paused;
            }

            /* Desktop Default */
            .scroll-track-1 {
              animation: scroll-right 40s linear infinite;
              width: max-content;
              display: flex;
              flex-direction: row;
            }
            .scroll-track-2 {
              animation: scroll-left 40s linear infinite;
              width: max-content;
              display: flex;
              flex-direction: row;
            }
            .carousel-mask {
              mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
              -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            }

            /* Mobile Overrides */
            @media (max-width: 767px) {
              .scroll-track-1 {
                animation: scroll-up 30s linear infinite;
                width: 100%;
                height: max-content;
                flex-direction: column;
                align-items: center;
              }
              .scroll-track-2 {
                display: none !important;
              }
              .carousel-mask {
                height: 420px;
                mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
                -webkit-mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
              }
            }
          `}</style>

          <div className="category-carousel-container flex flex-col gap-5 relative w-full carousel-mask">
            {/* Top Row: Left to Right on Desktop / Bottom to Up on Mobile */}
            <div className="scroll-track-1 gap-5">
              {[...Array(4)].map((_, arrayIndex) => (
                <div key={arrayIndex} className="flex flex-col md:flex-row gap-5 shrink-0 w-full sm:w-auto items-center md:items-stretch">
                  {[
                    { name: 'Software Development', count: '12k+ openings', icon: <FaFileAlt /> },
                    { name: 'Data Science & AI', count: '8k+ openings', icon: <FaBuilding /> },
                    { name: 'UI/UX Design', count: '5k+ openings', icon: <FaUsers /> },
                    { name: 'Product Management', count: '4k+ openings', icon: <FaBriefcase /> },
                    { name: 'Digital Marketing', count: '9k+ openings', icon: <FaEnvelope /> },
                  ].map((cat, idx) => (
                        <div key={idx} onClick={() => handleProtectedAction()} className="flex items-center p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(228,157,4,0.2)] hover:-translate-y-1.5 hover:border-[#e49d04]/40 transition-all duration-500 cursor-pointer group w-[90vw] max-w-[360px] md:w-[360px] shrink-0 relative overflow-hidden z-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#e49d04]/10 to-transparent rounded-bl-[100%] -z-10 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-top-right"></div>
                             
                            <div className="w-16 h-16 shrink-0 rounded-[1.25rem] bg-orange-50 flex items-center justify-center text-[#e49d04] group-hover:bg-[#e49d04] group-hover:text-[#121212] transition-all duration-500 shadow-sm relative z-10 group-hover:-rotate-6">
                                <div className="text-2xl">{cat.icon}</div>
                            </div>
                            
                            <div className="ml-5 flex-grow min-w-0 text-left relative z-10">
                                <h3 className="font-bold text-[#121212] text-[17px] leading-tight truncate group-hover:text-[#e49d04] transition-colors duration-300">{cat.name}</h3>
                                <p className="text-sm text-gray-500 mt-1.5 font-medium flex items-center gap-2">
                                   <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> {cat.count}
                                </p>
                            </div>
                            
                            <div className="ml-2 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#121212] group-hover:text-[#e49d04] group-hover:border-[#121212] transition-all duration-500 relative z-10 transform group-hover:translate-x-1 group-hover:shadow-md">
                                <FaArrowRight size={14} />
                            </div>
                        </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom Row: Right to Left on Desktop / Hidden on Mobile */}
            <div className="scroll-track-2 gap-5">
              {[...Array(4)].map((_, arrayIndex) => (
                <div key={arrayIndex} className="flex flex-col md:flex-row gap-5 shrink-0 w-full sm:w-auto items-center md:items-stretch">
                  {[
                    { name: 'Sales & Business', count: '15k+ openings', icon: <FaMoneyBillWave /> },
                    { name: 'Human Resources', count: '3k+ openings', icon: <FaUser /> },
                    { name: 'Finance & Accounting', count: '6k+ openings', icon: <FaBriefcase /> },
                    { name: 'Customer Success', count: '7k+ openings', icon: <FaHeadset /> },
                    { name: 'IT & Networking', count: '4k+ openings', icon: <FaBuilding /> },
                  ].map((cat, idx) => (
                        <div key={idx} onClick={() => handleProtectedAction()} className="flex items-center p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(228,157,4,0.2)] hover:-translate-y-1.5 hover:border-[#e49d04]/40 transition-all duration-500 cursor-pointer group w-[90vw] max-w-[360px] md:w-[360px] shrink-0 relative overflow-hidden z-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#e49d04]/10 to-transparent rounded-bl-[100%] -z-10 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-top-right"></div>
                            
                            <div className="w-16 h-16 shrink-0 rounded-[1.25rem] bg-orange-50 flex items-center justify-center text-[#e49d04] group-hover:bg-[#e49d04] group-hover:text-[#121212] transition-all duration-500 shadow-sm relative z-10 group-hover:-rotate-6">
                                <div className="text-2xl">{cat.icon}</div>
                            </div>
                            
                            <div className="ml-5 flex-grow min-w-0 text-left relative z-10">
                                <h3 className="font-bold text-[#121212] text-[17px] leading-tight truncate group-hover:text-[#e49d04] transition-colors duration-300">{cat.name}</h3>
                                <p className="text-sm text-gray-500 mt-1.5 font-medium flex items-center gap-2">
                                   <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> {cat.count}
                                </p>
                            </div>
                            
                            <div className="ml-2 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#121212] group-hover:text-[#e49d04] group-hover:border-[#121212] transition-all duration-500 relative z-10 transform group-hover:translate-x-1 group-hover:shadow-md">
                                <FaArrowRight size={14} />
                            </div>
                        </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* Featured Jobs / Search Results Section - TEMPORARILY COMMENTED OUT */}
      {false && (
      <section id="jobs-section" className="bg-gray-50 py-16 lg:py-24 scroll-mt-16">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">
                  {isSearching ? 'Search Results' : 'Featured Jobs'}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Know your worth and find the job that fits your life.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <FaSpinner className="animate-spin text-4xl text-gray-300" />
                  </div>
                ) : displayJobs.length > 0 ? (
                    displayJobs.map((job: any) => (
                    <div key={job._id} onClick={() => setSelectedJob(job)} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-slate-200 hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
                           <div className={`text-9xl font-bold text-[#121212]`}>{(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()}</div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300 bg-[#0B0C10] text-[#e49d04]`}>
                                        {(job.employerId?.companyName || job.employerId?.name || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-xl text-[#121212] group-hover:text-[#cc8c03] transition-colors mb-1 truncate">{job.title}</h3>
                                        <p className="text-gray-500 font-medium text-sm truncate">{job.employerId?.companyName || job.employerId?.name || 'Company'}</p>
                                    </div>
                                </div>
                                <span className="bg-slate-50 text-[#0B0C10] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-slate-200 shrink-0 ml-2">{job.workMode || 'Full Time'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center text-gray-500 text-sm truncate"><FaMapMarkerAlt className="mr-2 text-[#e49d04] shrink-0" /> <span className="truncate">{job.location || 'Remote'}</span></div>
                                <div className="flex items-center text-gray-500 text-sm truncate"><FaMoneyBillWave className="mr-2 text-green-500 shrink-0" /> <span className="truncate">₹{job.salaryMin || 0} - ₹{job.salaryMax || 0}</span></div>
                                <div className="flex items-center text-gray-500 text-sm truncate"><FaClock className="mr-2 text-blue-500 shrink-0" /> <span className="truncate">{new Date(job.createdAt).toLocaleDateString()}</span></div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex gap-2 overflow-hidden pr-2">
                                    {job.skills?.slice(0, 3).map((tag: string, i: number) => (
                                        <span key={i} className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors truncate max-w-[80px]">#{tag}</span>
                                    ))}
                                </div>
                                <button onClick={(e) => handleProtectedAction(e)} className="text-[#0B0C10] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all hover:text-[#cc8c03] shrink-0">
                                    Apply Now <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                ))) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No jobs found matching your criteria. Try adjusting your search.
                  </div>
                )}
            </div>
            <div className="text-center mt-12">
                <button onClick={() => {
                    if (isSearching) {
                        setAppliedSearchTitle('');
                        setAppliedSearchLocation('');
                        setSearchTitle('');
                        setSearchLocation('');
                        setFilterIndustry('');
                        setFilterWorkMode('');
                        setFilterExperience('');
                    } else {
                        handleProtectedAction();
                    }
                }} className="px-8 py-3.5 bg-[#e49d04] text-[#0B0C10] font-bold rounded-full hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all duration-300 transform hover:-translate-y-1">
                    {isSearching ? 'Clear Search' : 'View All Jobs'}
                </button>
            </div>
          </div>
      </section>
      )}

      {/* Testimonials Section (New) */}
      <section className="bg-white py-16 lg:py-24 relative">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">What Our Users Say</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Hear from people who have found success.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                    <div className="mb-6">
                        <FaQuoteLeft className="text-slate-200 text-4xl" />
                    </div>
                    <p className="text-gray-600 italic mb-6 flex-grow leading-relaxed">"I found my dream job within a week of signing up. The process was incredibly smooth and the company recommendations were spot on."</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                        <div className="w-10 h-10 bg-[#0B0C10] rounded-full flex items-center justify-center text-[#e49d04] font-bold shadow-md text-sm">PS</div>
                        <div>
                            <h4 className="font-bold text-[#121212] text-sm">Priya Sharma</h4>
                            <p className="text-xs text-[#0B0C10] font-medium">Software Engineer</p>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                    <div className="mb-6"><FaQuoteLeft className="text-yellow-200 text-4xl" /></div>
                    <p className="text-gray-600 italic mb-6 flex-grow leading-relaxed">"As a recruiter, this platform has been a game-changer. We've found some of our best talent here. Highly recommended!"</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                        <div className="w-10 h-10 bg-[#e49d04] rounded-full flex items-center justify-center text-[#0B0C10] font-bold shadow-md text-sm">RV</div>
                        <div>
                            <h4 className="font-bold text-[#121212] text-sm">Rahul Verma</h4>
                            <p className="text-xs text-[#e49d04] font-medium">HR Manager</p>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                    <div className="mb-6"><FaQuoteLeft className="text-slate-200 text-4xl" /></div>
                    <p className="text-gray-600 italic mb-6 flex-grow leading-relaxed">"The interface is so user-friendly and the job alerts kept me in the loop. I didn't miss a single opportunity."</p>
                     <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                        <div className="w-10 h-10 bg-[#0B0C10] rounded-full flex items-center justify-center text-[#e49d04] font-bold shadow-md text-sm">AD</div>
                        <div>
                            <h4 className="font-bold text-[#121212] text-sm">Ananya Desai</h4>
                            <p className="text-xs text-[#0B0C10] font-medium">Product Designer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Legal & Info Sections */}
      <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
         <div className="container mx-auto px-6 md:px-12 max-w-5xl space-y-16 lg:space-y-24">
            
            {/* FAQ */}
            <div id="faq" className="scroll-mt-24">
              <h2 className="text-3xl font-bold text-[#121212] mb-8 flex items-center gap-3"><FaQuestionCircle className="text-[#e49d04]" /> Frequently Asked Questions (FAQs)</h2>
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                   <h3 className="text-xl font-bold text-[#121212] border-b border-gray-100 pb-2">For Candidates</h3>
                   <div>
                     <h4 className="font-bold text-[#121212] mb-2">Q: Do I have to pay to use Click4Jobs?</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">A: No. Core access for job seekers is 100% free. You can create a profile, upload your resume, and be matched with employers across India at no cost.</p>
                   </div>
                   <div>
                     <h4 className="font-bold text-[#121212] mb-2">Q: Is this platform only for specific industries?</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">A: Not at all. Click4Jobs caters to a wide spectrum of industries and job roles, from entry-level positions to specialized technical and management roles across all states in India.</p>
                   </div>
                   <div>
                     <h4 className="font-bold text-[#121212] mb-2">Q: How can I increase my chances of getting hired?</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">A: Ensure your profile is 100% complete. Be specific about your skills, verify your past experiences, and keep your location preferences updated. The more accurate your data, the better our AI can match you.</p>
                   </div>
                 </div>
                 <div className="space-y-6">
                   <h3 className="text-xl font-bold text-[#121212] border-b border-gray-100 pb-2">For Employers</h3>
                   <div>
                     <h4 className="font-bold text-[#121212] mb-2">Q: How does the credit system work?</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">A: You purchase a package of Match Credits. Browsing anonymized candidate profiles and seeing their "Match Score" is free. You only spend a credit when you choose to unlock a candidate's full identity and contact details.</p>
                   </div>
                   <div>
                     <h4 className="font-bold text-[#121212] mb-2">Q: Can I hire for multiple cities at once?</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">A: Yes. Click4Jobs is a Pan-India platform. You can post roles specific to a single city, or cast a wider net to find talent willing to relocate from anywhere in the country.</p>
                   </div>
                   <div>
                     <h4 className="font-bold text-[#121212] mb-2">Q: What payment methods do you accept?</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">A: We use secure, RBI-regulated payment gateways and accept all major Credit/Debit cards, Net Banking, and UPI for seamless credit top-ups.</p>
                   </div>
                 </div>
              </div>
            </div>

            {/* Trust & Safety */}
            <div id="trust-safety" className="scroll-mt-24 bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100">
              <h2 className="text-3xl font-bold text-[#121212] mb-6 flex items-center gap-3"><FaShieldAlt className="text-[#e49d04]" /> Trust & Safety (Anti-Fraud Policy)</h2>
              <p className="text-gray-600 mb-6"><strong className="text-[#121212]">Your Safety is Our Priority:</strong> Click4Jobs is committed to maintaining a secure and transparent hiring environment. However, the internet requires vigilance. Please adhere to the following safety guidelines:</p>
              <ul className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
                <li><strong className="text-[#121212]">Never Pay for a Job:</strong> Click4Jobs will never ask candidates for money to register, schedule an interview, or secure a job. If an employer asks you for a "security deposit," "laptop fee," or "training fee," it is a scam. Report them immediately at <a href="mailto:helpdesk@click4jobs.in" className="text-[#e49d04] font-bold hover:underline">helpdesk@click4jobs.in</a>.</li>
                <li><strong className="text-[#121212]">Verify the Employer:</strong> While we vet companies on our platform, always do your own research before attending an interview or sharing sensitive documents like your Aadhar or PAN card.</li>
                <li><strong className="text-[#121212]">Secure Communication:</strong> Keep your initial communications on the platform or via official company email addresses. Be wary of employers who insist on conducting all business via personal WhatsApp numbers before an official interview.</li>
              </ul>
            </div>

         </div>
      </section>

      {/* CTA Section (New) */}
      <section className="py-4 relative bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="bg-[#F8FAFC] rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            
            {/* Subtle Abstract Background - matches portal clean look */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#e49d04" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.7,-2.1C98.6,13.8,94.4,30.1,84.7,42.7C75.1,55.3,60,64.2,45.2,72.1C30.4,80,15.2,86.9,-0.6,88C-16.4,89.1,-32.8,84.4,-47.5,76.1C-62.2,67.8,-75.2,55.9,-83.4,41.6C-91.6,27.3,-95,10.6,-92.9,-5.3C-90.8,-21.2,-83.2,-36.3,-72.6,-48C-62,-59.7,-48.4,-68.1,-34.5,-75.1C-20.6,-82.1,-10.3,-87.7,2.3,-91.6C14.9,-95.5,29.8,-93.7,44.7,-76.4Z" transform="translate(100 100)" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e49d04]/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="px-6 py-8 md:py-10 text-center relative z-10 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-[#121212] text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                  <span className="text-base">🚀</span> Elevate Your Future
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#121212] mb-6 tracking-tight leading-tight">
                    Ready to Start Your <br className="hidden sm:block" />
                    <span className="text-[#e49d04] relative inline-block">
                      Career Journey?
                      <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400/40" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="transparent"/></svg>
                    </span>
                </h2>
                
                <p className="text-gray-600 font-medium text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of professionals who have advanced their careers with Click4Jobs. Create your account today and unlock a world of opportunities.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => handleProtectedAction()} className="w-full sm:w-auto bg-[#0B0C10] hover:bg-[#1f2833] text-[#e49d04] shadow-lg shadow-black/10 font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                        {user ? 'Go to Dashboard' : 'Get Started Now'} <FaArrowRight />
                    </button>
                    <Link href="/Subscription/Pricing" className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 font-bold py-4 px-10 rounded-full shadow-sm hover:shadow-md hover:border-[#e49d04]/30 hover:text-[#e49d04] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        View Pricing Plans
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {/* Job Details Modal for Guests */}
      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          onApply={() => {
            setSelectedJob(null);
            handleProtectedAction();
          }} 
        />
      )}

    </div>
  );
};

const JobDetailsModal = ({ job, onClose, onApply }: any) => {
  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
      <div className="p-6 md:px-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-2xl font-bold text-[#121212] flex items-center gap-3">
          <div className="bg-[#e49d04] p-2 rounded-xl shadow-md"><FaBriefcase className="text-[#0B0C10] text-sm" /></div>
          Job Details
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md"><FaTimes size={18} /></button>
      </div>
      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
        <h3 className="text-3xl font-bold text-[#0B0C10]">{job.title}</h3>
        <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2"><span className="text-gray-700">{job.employerId?.companyName || job.employerId?.name || 'Company'}</span> • <span>{job.workMode}</span> • <span>{job.location}</span></p>
        <div className="flex flex-wrap gap-2 mt-6">
          {job.skills && job.skills.length > 0 ? job.skills.map((s: string, i: number) => (
            <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-[#121212]">{s}</span>
          )) : <span className="text-sm text-gray-400 italic">No skills specified</span>}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-sm">
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Experience</p><p className="font-bold text-[#121212] text-base">{job.experience || 'Not specified'}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Salary ({job.salaryType})</p><p className="font-bold text-[#121212] text-base">₹{job.salaryMin || '0'} - ₹{job.salaryMax || '0'}</p></div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">Job Description</p><p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p></div>
        {job.screeningQuestion && <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Screening Question</p><p className="font-semibold text-[#121212] text-sm">{job.screeningQuestion}</p></div>}
        <div className="mt-6 flex items-center gap-4">{job.immediateJoiner && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold">Immediate Joiner Required</span>}<span className="text-xs font-medium text-gray-500">Contact via: <span className="font-bold text-gray-700">{job.contactPreference}</span></span></div>
      </div>
      <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-3xl">
        <button onClick={onApply} className="px-8 py-3 bg-[#e49d04] text-[#0B0C10] font-black rounded-xl hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
          Proceed to Apply <FaArrowRight />
        </button>
      </div>
    </div>
  </div>
  );
};

export default LoginDashboard;