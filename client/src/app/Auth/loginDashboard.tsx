'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FaEnvelope, FaSearch, FaFileAlt, FaBell, FaBuilding, FaQuoteLeft, FaBriefcase, FaUsers, FaUser, FaHeadset, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaArrowRight, FaTimes, FaFilter, FaSpinner, FaQuestionCircle, FaShieldAlt, FaLock, FaFileContract, FaCoins, FaUnlock, FaChevronDown } from 'react-icons/fa';
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

  const displayJobs = allJobs.filter((job: any) => {
    const query = appliedSearchTitle.toLowerCase();
    const locQuery = appliedSearchLocation.toLowerCase();
    const matchesTitle = !query || job.title?.toLowerCase().includes(query) || job.employerId?.companyName?.toLowerCase().includes(query) || job.employerId?.name?.toLowerCase().includes(query) || job.skills?.some((s: string) => s.toLowerCase().includes(query));
    const matchesLocation = !locQuery || job.location?.toLowerCase().includes(locQuery);
    const matchesIndustry = !filterIndustry || job.industry === filterIndustry;
    const matchesWorkMode = !filterWorkMode || job.workMode === filterWorkMode;
    const matchesExperience = !filterExperience || job.experience === filterExperience;
    return matchesTitle && matchesLocation && matchesIndustry && matchesWorkMode && matchesExperience;
  }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const isSearching = appliedSearchTitle || appliedSearchLocation || filterIndustry || filterWorkMode || filterExperience;

  // Intercept the token coming back from Passport.js Redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
            router.push('/employer/dashboard');
          } else {
            router.push('/Condidate/Dashboard');
          }
        } catch (error) {
          console.error('Failed to parse social login data', error);
          toast.error('Social login failed.');
        }
      }
    }
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/microsoft`;
  };

  return (
    <div className="grow flex flex-col">
      {/* NEW HERO SECTION - EXACT IMAGE MATCH */}
      <section className="relative bg-[#f8f9fc] overflow-hidden pt-6 lg:pt-10 pb-12">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            
            {/* Left Content */}
            <div className="w-full lg:w-3/5 text-left">
              <span className="inline-flex items-center justify-center py-1.5 px-4 rounded-full bg-yellow-50 text-[#e49d04] text-xs font-black tracking-widest uppercase mb-6 border border-yellow-100 shadow-sm">
                INDIA&apos;S #1 JOB PLATFORM
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-[#121212] mb-6 leading-tight">
                Your job search <br /> <span className="text-[#e49d04] relative">ends here</span>
              </h1>
              <p className="text-xl text-gray-600 font-medium mb-10">
                Discover 50 lakh+ career opportunities
              </p>

              {/* Modern Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2.5 max-w-4xl mb-12">
                <div className="flex items-center flex-1 px-4 py-2 w-full">
                  <FaSearch className="text-[#e49d04] mr-3 text-lg" />
                  <input 
                    type="text" 
                    placeholder="Search jobs by &apos;title&apos;" 
                    className="w-full outline-none text-gray-700 text-base font-medium placeholder-gray-400"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>
                <div className="hidden md:block w-px h-10 bg-gray-100"></div>
                <div className="flex items-center flex-1 px-4 py-2 w-full relative">
                  <FaBriefcase className="text-[#e49d04] mr-3 text-lg" />
                  <select 
                    className="w-full outline-none text-gray-700 text-base font-medium bg-transparent appearance-none cursor-pointer"
                    value={filterExperience}
                    onChange={(e) => setFilterExperience(e.target.value)}
                  >
                    <option value="">Your Experience</option>
                    <option value="Entry Level (0-2 Yrs)">Fresher</option>
                    <option value="Mid Level (3-5 Yrs)">1-3 Years</option>
                    <option value="Senior Level (5+ Yrs)">3-5 Years</option>
                    <option value="Executive">5+ Years</option>
                  </select>
                  <FaChevronDown className="absolute right-4 text-gray-400 text-xs pointer-events-none" />
                </div>
                <div className="hidden md:block w-px h-10 bg-gray-100"></div>
                <div className="flex items-center flex-1 px-4 py-2 w-full">
                  <FaMapMarkerAlt className="text-[#e49d04] mr-3 text-lg" />
                  <input 
                    type="text" 
                    placeholder="Search for an area or city" 
                    className="w-full outline-none text-gray-700 text-base font-medium placeholder-gray-400"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full md:w-auto bg-[#e49d04] hover:bg-[#cc8c03] text-[#0B0C10] shadow-lg shadow-[#e49d04]/20 font-bold py-3.5 px-8 rounded-xl transition-all ml-0 md:ml-2 mt-2 md:mt-0 transform hover:-translate-y-0.5">
                  Search jobs
                </button>
              </form>

              {/* Proud to Support Section */}
              <div className="mb-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Proud to Support</p>
                <div className="flex items-center gap-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Gov" className="h-10" />
                  <img src="https://www.startupindia.gov.in/content/dam/invest-india/new_startup_india_logo.png" alt="DPIIT" className="h-8" />
                </div>
              </div>

              {/* Trusted By Section */}
              <div className="w-full relative max-w-full overflow-hidden">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Trusted by 1000+ enterprises and 7 lakh+ MSMEs for hiring</p>
                
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
                
                <div className="carousel-container overflow-hidden w-full relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                  <div className="animate-marquee flex grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center justify-center gap-12 md:gap-16 pr-12 md:pr-16 shrink-0">
                        <img src="https://cdn.worldvectorlogo.com/logos/google-1-1.svg" alt="Google" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/amazon-2.svg" alt="Amazon" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/microsoft-5.svg" alt="Microsoft" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/infosys.svg" alt="Infosys" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/tata-consultancy-services.svg" alt="TCS" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/wipro-logo-new-1.svg" alt="Wipro" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/tech-mahindra-1.svg" alt="Tech Mahindra" className="h-4 md:h-6 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/flipkart.svg" alt="Flipkart" className="h-6 md:h-8 w-auto object-contain" />
                        <img src="https://cdn.worldvectorlogo.com/logos/ibm.svg" alt="IBM" className="h-6 md:h-8 w-auto object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic Section */}
            <div className="w-full lg:w-2/5 mt-12 lg:mt-0 relative flex justify-center">
               <div className="relative">
                  {/* Circle background effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                  {/* Lottie Animation */}
                  <iframe 
                    src="https://embed.lottiefiles.com/animation/74393" 
                    className="relative z-10 w-full max-w-md aspect-square pointer-events-none"
                    style={{ border: "none", background: "transparent" }}
                    title="Hero Animation"
                  ></iframe>
                  {/* Floating Phone App Detail */}
                  <div className="absolute top-1/2 -left-4 z-20 bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 transform -rotate-6">
                    <div className="bg-[#0B0C10] text-[#e49d04] p-3 rounded-xl flex items-center gap-3 shadow-inner">
                        <div className="w-8 h-8 bg-[#e49d04] rounded-lg flex items-center justify-center text-sm font-black text-[#0B0C10] shadow-sm">C</div>
                        <span className="text-sm font-bold tracking-wide pr-2">Click4Jobs</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <div id="about" className="bg-white py-24 scroll-mt-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-6">Empowering India’s Workforce Through Intelligent Matching</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-left">
                <p>Welcome to Click4Jobs, India’s most efficient and transparent hiring ecosystem. We recognize that the traditional job search process—for both candidates and employers—is often time-consuming and fragmented. Our mission is to bridge the gap between incredible talent and top-tier companies across the entire country, from bustling metropolitan hubs to rapidly growing Tier-2 and Tier-3 cities.</p>
                <p>We operate on a simple philosophy: <span className="font-bold text-[#121212]">Skills matter most.</span> By leveraging advanced AI-driven matching technology, Click4Jobs moves beyond keyword-stuffed resumes to connect employers with candidates who possess the exact verified skills they need. Whether you are a fresh graduate entering the workforce, a skilled tradesperson, or an executive seeking a national leadership role, our platform is built to accelerate your success.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section (Enhanced) */}
      <div id="how-it-works" className="bg-gray-50 py-24 scroll-mt-16">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">How It Works</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Click4Jobs operates on a dual-sided, transparent model designed to maximize efficiency for both job seekers and hiring managers.</p>
            </div>
            
            <h3 className="text-2xl font-bold text-[#121212] mb-8 text-center"><span className="text-[#e49d04]">For Candidates:</span> Seamless Discovery</h3>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B0C10] to-[#1F2833] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-14 h-14 bg-[#0B0C10] text-[#e49d04] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaUser size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">1. Create Your Profile</h3>
                    <p className="text-gray-600 leading-relaxed">Register for free and build a comprehensive profile detailing your skills, experience, and location preferences anywhere in India.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e49d04] to-[#cc8c03] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaSearch size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">2. AI-Powered Matching</h3>
                    <p className="text-gray-600 leading-relaxed">Our intelligent algorithm analyzes your data and automatically aligns your profile with open roles that fit your exact qualifications.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B0C10] to-[#1F2833] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-14 h-14 bg-[#0B0C10] text-[#e49d04] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaBell size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">3. Get Scouted</h3>
                    <p className="text-gray-600 leading-relaxed">Instead of sending countless applications into a void, Click4Jobs puts your verified profile directly in front of active employers. When there is a match, you are notified instantly.</p>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-[#121212] mb-8 text-center"><span className="text-[#e49d04]">For Employers:</span> Credit-Based Precision</h3>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B0C10] to-[#1F2833] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-14 h-14 bg-[#0B0C10] text-[#e49d04] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaBuilding size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">1. Post Opportunities</h3>
                    <p className="text-gray-600 leading-relaxed">List your open roles on our Pan-India network quickly and easily at no base cost.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e49d04] to-[#cc8c03] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaCoins size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">2. Purchase Match Credits</h3>
                    <p className="text-gray-600 leading-relaxed">Transition away from expensive, flat-fee job postings. Employers purchase secure "Match Credits" via their Click4Jobs dashboard.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B0C10] to-[#1F2833] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-14 h-14 bg-[#0B0C10] text-[#e49d04] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaUnlock size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">3. Unlock Verified Talent</h3>
                    <p className="text-gray-600 leading-relaxed">Use your credits strategically to unlock the contact information of highly-matched candidates, trigger technical assessments, or boost your job listing’s visibility. You only spend credits when you are ready to engage with top-tier talent.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Popular Categories Section */}
      <div id="categories-section" className="bg-white py-24 scroll-mt-16">
          <div className="container mx-auto px-6 md:px-12">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">Popular Categories</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore thousands of jobs in the most in-demand industries.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                      { name: 'Development', count: '1.2k+ Jobs', icon: <FaBriefcase />, color: 'bg-[#0B0C10] text-[#e49d04]' },
                      { name: 'Design', count: '800+ Jobs', icon: <FaFileAlt />, color: 'bg-yellow-100 text-yellow-600' },
                      { name: 'Marketing', count: '600+ Jobs', icon: <FaSearch />, color: 'bg-[#0B0C10] text-[#e49d04]' },
                      { name: 'Management', count: '400+ Jobs', icon: <FaUsers />, color: 'bg-yellow-100 text-yellow-600' },
                      { name: 'Finance', count: '300+ Jobs', icon: <FaBuilding />, color: 'bg-[#0B0C10] text-[#e49d04]' },
                      { name: 'Customer Service', count: '900+ Jobs', icon: <FaHeadset />, color: 'bg-yellow-100 text-yellow-600' },
                      { name: 'Health Care', count: '500+ Jobs', icon: <FaBriefcase />, color: 'bg-[#0B0C10] text-[#e49d04]' },
                      { name: 'Sales', count: '700+ Jobs', icon: <FaBell />, color: 'bg-yellow-100 text-yellow-600' },
                  ].map((cat, idx) => (
                      <div key={idx} className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${cat.color}`}>
                              {cat.icon}
                          </div>
                          <h3 className="font-bold text-[#121212] text-lg mb-1 group-hover:text-[#cc8c03] transition-colors">{cat.name}</h3>
                          <p className="text-sm text-gray-500">{cat.count}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Featured Jobs / Search Results Section */}
      <div id="jobs-section" className="bg-gray-50 py-24 scroll-mt-16">
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
                                <div className="flex items-center text-gray-500 text-sm truncate"><FaMoneyBillWave className="mr-2 text-green-500 shrink-0" /> <span className="truncate">${job.salaryMin || 0} - ${job.salaryMax || 0}</span></div>
                                <div className="flex items-center text-gray-500 text-sm truncate"><FaClock className="mr-2 text-blue-500 shrink-0" /> <span className="truncate">{new Date(job.createdAt).toLocaleDateString()}</span></div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex gap-2 overflow-hidden pr-2">
                                    {job.skills?.slice(0, 3).map((tag: string, i: number) => (
                                        <span key={i} className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors truncate max-w-[80px]">#{tag}</span>
                                    ))}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setIsLoginModalOpen(true); }} className="text-[#0B0C10] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all hover:text-[#cc8c03] shrink-0">
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
                        setIsLoginModalOpen(true);
                    }
                }} className="px-8 py-3.5 bg-[#e49d04] text-[#0B0C10] font-bold rounded-full hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all duration-300 transform hover:-translate-y-1">
                    {isSearching ? 'Clear Search' : 'View All Jobs'}
                </button>
            </div>
          </div>
      </div>

      {/* Testimonials Section (New) */}
      <div className="bg-white py-24 relative">
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
      </div>

      {/* Legal & Info Sections */}
      <div className="bg-white py-24 border-t border-gray-100">
         <div className="container mx-auto px-6 md:px-12 max-w-5xl space-y-24">
            
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
                <li><strong className="text-[#121212]">Never Pay for a Job:</strong> Click4Jobs will never ask candidates for money to register, schedule an interview, or secure a job. If an employer asks you for a "security deposit," "laptop fee," or "training fee," it is a scam. Report them immediately.</li>
                <li><strong className="text-[#121212]">Verify the Employer:</strong> While we vet companies on our platform, always do your own research before attending an interview or sharing sensitive documents like your Aadhar or PAN card.</li>
                <li><strong className="text-[#121212]">Secure Communication:</strong> Keep your initial communications on the platform or via official company email addresses. Be wary of employers who insist on conducting all business via personal WhatsApp numbers before an official interview.</li>
              </ul>
            </div>

         </div>
      </div>

      {/* CTA Section (New) */}
      <div className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0B0C10] z-0"></div>
          <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Start Your Career Journey?</h2>
                  <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of professionals who have advanced their careers with Click4Jobs. Create your account today.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => setIsLoginModalOpen(true)} className="bg-[#e49d04] text-[#0B0C10] font-bold py-4 px-10 rounded-full shadow-xl hover:bg-[#cc8c03] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                      Get Started Now
                  </button>
                  <Link href="/Subscription/Pricing" className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-10 rounded-full shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                      View Pricing Plans
                  </Link>
              </div>
          </div>
      </div>

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
            setIsLoginModalOpen(true);
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
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Salary ({job.salaryType})</p><p className="font-bold text-[#121212] text-base">${job.salaryMin || '0'} - ${job.salaryMax || '0'}</p></div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">Job Description</p><p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p></div>
        {job.screeningQuestion && <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Screening Question</p><p className="font-semibold text-[#121212] text-sm">{job.screeningQuestion}</p></div>}
        <div className="mt-6 flex items-center gap-4">{job.immediateJoiner && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold">Immediate Joiner Required</span>}<span className="text-xs font-medium text-gray-500">Contact via: <span className="font-bold text-gray-700">{job.contactPreference}</span></span></div>
      </div>
      <div className="p-6 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-3xl">
        <button onClick={onApply} className="px-8 py-3 bg-[#e49d04] text-[#0B0C10] font-black rounded-xl hover:bg-[#cc8c03] shadow-lg shadow-[#e49d04]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
          Login to Apply <FaArrowRight />
        </button>
      </div>
    </div>
  </div>
  );
};

export default LoginDashboard;