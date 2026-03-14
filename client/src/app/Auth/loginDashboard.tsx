'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft, FaEnvelope, FaSearch, FaFileAlt, FaBell, FaBuilding, FaQuoteLeft, FaBriefcase, FaUsers, FaHeadset, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaArrowRight } from 'react-icons/fa';

const LoginDashboard = () => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(imageContainerRef.current,
      { y: 100, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2 }
    );

    // Floating animation
    gsap.to(imageContainerRef.current, {
      y: -15,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  useEffect(() => {
    const text = "Fits Your Life";
    let isDeleting = false;
    let currentText = '';
    let timer: NodeJS.Timeout;

    const type = () => {
      if (isDeleting) {
        currentText = text.substring(0, currentText.length - 1);
      } else {
        currentText = text.substring(0, currentText.length + 1);
      }

      setDisplayText(currentText);

      let typeSpeed = 100;

      if (isDeleting) {
        typeSpeed = 50;
      }

      if (!isDeleting && currentText === text) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        typeSpeed = 500;
      }

      timer = setTimeout(type, typeSpeed);
    };

    timer = setTimeout(type, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section */}
      <div className="bg-white min-h-[calc(100vh-80px)] flex items-center relative overflow-hidden text-[#121212]">

        <div className="container mx-auto px-6 md:px-12 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Side */}
        <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#121212] leading-tight tracking-tight">
              Find The Job That <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F172A] to-[#1E293B]">
                {displayText}
                <span className="text-[#0F172A] animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              We bring you the best job opportunities from top companies. Get started by creating an account or signing in.
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Sign in with</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5">
              <FcGoogle className="mr-3" size={24} />
              Continue with Google
            </button>
            
            <button className="w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5">
              <FaMicrosoft className="mr-3 text-blue-600" size={24} />
              Continue with Microsoft
            </button>

            <button className="w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5">
              <FaEnvelope className="mr-3 text-gray-500" size={24} />
              Continue with Email
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center lg:text-left pt-4">
            By continuing, you agree to our <a href="#" className="underline hover:text-[#0F172A]">Terms of Service</a> and <a href="#" className="underline hover:text-[#0F172A]">Privacy Policy</a>.
          </p>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block relative">
          <div ref={imageContainerRef} className="relative">
             <img src="/hiring-illustration.svg" alt="Hiring Illustration" className="w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </div>
      </div>

      {/* Trusted Companies Section (New) */}
      <div className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-12">
            <p className="text-center text-gray-500 text-sm font-semibold uppercase tracking-wider mb-8">Trusted by leading companies</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="text-xl font-bold flex items-center gap-2 text-gray-500"><FaBuilding /> Acme Corp</div>
                <div className="text-xl font-bold flex items-center gap-2 text-gray-500"><FaBuilding /> Global Tech</div>
                <div className="text-xl font-bold flex items-center gap-2 text-gray-500"><FaBuilding /> Future Inc</div>
                <div className="text-xl font-bold flex items-center gap-2 text-gray-500"><FaBuilding /> Innovation Labs</div>
                <div className="text-xl font-bold flex items-center gap-2 text-gray-500"><FaBuilding /> Stark Ind</div>
            </div>
        </div>
      </div>

      {/* Features Section (Enhanced) */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">How It Works</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Finding your dream job is easier than ever with our streamlined process.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="w-14 h-14 bg-slate-100 text-[#0F172A] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaSearch size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">1. Search Jobs</h3>
                    <p className="text-gray-600 leading-relaxed">Browse through thousands of job listings from top companies to find the perfect match for your skills.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="w-14 h-14 bg-amber-100 text-[#FACC15] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaFileAlt size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">2. Apply Easily</h3>
                    <p className="text-gray-600 leading-relaxed">Create your profile, upload your resume, and apply to multiple jobs with just a single click.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EF4444] to-[#E11D48] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="w-14 h-14 bg-red-100 text-[#EF4444] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FaBell size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#121212] mb-3">3. Get Notified</h3>
                    <p className="text-gray-600 leading-relaxed">Stay updated with real-time notifications on your application status and new job alerts.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Popular Categories Section */}
      <div className="bg-white py-24">
          <div className="container mx-auto px-6 md:px-12">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">Popular Categories</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore thousands of jobs in the most in-demand industries.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                      { name: 'Development', count: '1.2k+ Jobs', icon: <FaBriefcase />, color: 'bg-slate-100 text-[#0F172A]' },
                      { name: 'Design', count: '800+ Jobs', icon: <FaFileAlt />, color: 'bg-amber-100 text-[#FACC15]' },
                      { name: 'Marketing', count: '600+ Jobs', icon: <FaSearch />, color: 'bg-red-100 text-[#EF4444]' },
                      { name: 'Management', count: '400+ Jobs', icon: <FaUsers />, color: 'bg-gray-100 text-gray-600' },
                      { name: 'Finance', count: '300+ Jobs', icon: <FaBuilding />, color: 'bg-slate-100 text-[#0F172A]' },
                      { name: 'Customer Service', count: '900+ Jobs', icon: <FaHeadset />, color: 'bg-amber-100 text-[#FACC15]' },
                      { name: 'Health Care', count: '500+ Jobs', icon: <FaBriefcase />, color: 'bg-red-100 text-[#EF4444]' },
                      { name: 'Sales', count: '700+ Jobs', icon: <FaBell />, color: 'bg-gray-100 text-gray-600' },
                  ].map((cat, idx) => (
                      <div key={idx} className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${cat.color}`}>
                              {cat.icon}
                          </div>
                          <h3 className="font-bold text-[#121212] text-lg mb-1 group-hover:text-[#0F172A] transition-colors">{cat.name}</h3>
                          <p className="text-sm text-gray-500">{cat.count}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">Featured Jobs</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Know your worth and find the job that fits your life.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {[
                    { title: 'Senior Software Engineer', company: 'TechCorp', type: 'Full Time', location: 'Remote', salary: '$120k - $150k', logo: 'T', color: 'bg-[#0F172A]', tags: ['Engineering', 'Senior'] },
                    { title: 'Product Designer', company: 'CreativeStudio', type: 'Part Time', location: 'New York', salary: '$80k - $100k', logo: 'C', color: 'bg-[#FACC15]', tags: ['Design', 'Creative'] },
                    { title: 'Marketing Manager', company: 'GrowthInc', type: 'Full Time', location: 'London', salary: '$90k - $110k', logo: 'G', color: 'bg-[#EF4444]', tags: ['Marketing', 'Management'] },
                    { title: 'Data Analyst', company: 'DataFlow', type: 'Contract', location: 'Remote', salary: '$60k - $80k', logo: 'D', color: 'bg-[#121212]', tags: ['Data', 'Analysis'] },
                ].map((job, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-slate-200 hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
                           <div className={`text-9xl font-bold text-[#121212]`}>{job.logo}</div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${job.color === 'bg-[#FACC15]' ? 'text-[#121212]' : 'text-white'} ${job.color}`}>
                                        {job.logo}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-[#121212] group-hover:text-[#0F172A] transition-colors mb-1">{job.title}</h3>
                                        <p className="text-gray-500 font-medium text-sm">{job.company}</p>
                                    </div>
                                </div>
                                <span className="bg-slate-50 text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-slate-200">{job.type}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center text-gray-500 text-sm"><FaMapMarkerAlt className="mr-2 text-gray-400" /> {job.location}</div>
                                <div className="flex items-center text-gray-500 text-sm"><FaMoneyBillWave className="mr-2 text-gray-400" /> {job.salary}</div>
                                <div className="flex items-center text-gray-500 text-sm"><FaClock className="mr-2 text-gray-400" /> Posted 2 days ago</div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex gap-2">
                                    {job.tags?.map((tag, i) => (
                                        <span key={i} className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">#{tag}</span>
                                    ))}
                                </div>
                                <button className="text-[#0F172A] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Apply Now <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="text-center mt-12">
                <button className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:border-[#0F172A] hover:text-[#0F172A] hover:bg-slate-50 transition-all duration-300">View All Jobs</button>
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
                        <div className="w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm">SJ</div>
                        <div>
                            <h4 className="font-bold text-[#121212] text-sm">Sarah Johnson</h4>
                            <p className="text-xs text-[#0F172A] font-medium">Software Engineer</p>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                    <div className="mb-6">
                        <FaQuoteLeft className="text-amber-100 text-4xl" />
                    </div>
                    <p className="text-gray-600 italic mb-6 flex-grow leading-relaxed">"As a recruiter, this platform has been a game-changer. We've found some of our best talent here. Highly recommended!"</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                        <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center text-[#121212] font-bold shadow-md text-sm">MC</div>
                        <div>
                            <h4 className="font-bold text-[#121212] text-sm">Michael Chen</h4>
                            <p className="text-xs text-[#FACC15] font-medium">HR Manager</p>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                    <div className="mb-6">
                        <FaQuoteLeft className="text-red-100 text-4xl" />
                    </div>
                    <p className="text-gray-600 italic mb-6 flex-grow leading-relaxed">"The interface is so user-friendly and the job alerts kept me in the loop. I didn't miss a single opportunity."</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                        <div className="w-10 h-10 bg-[#EF4444] rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm">ED</div>
                        <div>
                            <h4 className="font-bold text-[#121212] text-sm">Emily Davis</h4>
                            <p className="text-xs text-[#EF4444] font-medium">Product Designer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CTA Section (New) */}
      <div className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0F172A] z-0"></div>
          <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Start Your Career Journey?</h2>
              <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of professionals who have advanced their careers with JobPortal. Create your account today.</p>
              <button className="bg-white text-[#0F172A] font-bold py-4 px-10 rounded-full shadow-xl hover:bg-slate-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                  Get Started Now
              </button>
          </div>
      </div>
    </div>
  );
};

export default LoginDashboard;