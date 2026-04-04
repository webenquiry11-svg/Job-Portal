'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCheck, FaArrowLeft, FaTimes } from 'react-icons/fa';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');

  const employerPlans = [
    {
      name: 'Basic',
      description: 'Perfect for startups and small businesses hiring for a single role.',
      price: isAnnual ? '0' : '0',
      duration: 'forever',
      features: [
        { text: '1 Active Job Posting', included: true },
        { text: 'Standard Job Visibility', included: true },
        { text: 'Basic Applicant Tracking', included: true },
        { text: 'Email Support', included: true },
        { text: 'Featured Job Placement', included: false },
        { text: 'Resume Database Access', included: false },
      ],
      buttonText: 'Get Started Free',
      popular: false,
      color: 'bg-white text-[#121212] border-gray-200'
    },
    {
      name: 'Professional',
      description: 'Ideal for growing companies with ongoing recruitment needs.',
      price: isAnnual ? '49' : '59',
      duration: 'per month',
      features: [
        { text: 'Up to 10 Active Job Postings', included: true },
        { text: 'Featured Job Visibility', included: true },
        { text: 'Advanced Applicant Tracking', included: true },
        { text: 'Priority 24/7 Support', included: true },
        { text: 'Resume Database Access (100/mo)', included: true },
        { text: 'Dedicated Account Manager', included: false },
      ],
      buttonText: 'Choose Professional',
      popular: true,
      color: 'bg-[#0B0C10] text-white border-[#0B0C10]'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations needing volume hiring and custom solutions.',
      price: isAnnual ? '199' : '249',
      duration: 'per month',
      features: [
        { text: 'Unlimited Job Postings', included: true },
        { text: 'Maximum Job Visibility', included: true },
        { text: 'Custom Applicant Tracking', included: true },
        { text: 'Priority 24/7 Support', included: true },
        { text: 'Unlimited Resume Database', included: true },
        { text: 'Dedicated Account Manager', included: true },
      ],
      buttonText: 'Contact Sales',
      popular: false,
      color: 'bg-white text-[#121212] border-gray-200'
    }
  ];

  const candidatePlans = [
    {
      name: 'Basic',
      description: 'Essential tools to start your career journey and apply to jobs.',
      price: isAnnual ? '0' : '0',
      duration: 'forever',
      features: [
        { text: 'Standard Profile Visibility', included: true },
        { text: 'Apply to Unlimited Jobs', included: true },
        { text: 'Basic Application Tracking', included: true },
        { text: 'Email Support', included: true },
        { text: 'Highlighted "Pro" Badge', included: false },
        { text: 'See Who Viewed Your Profile', included: false },
      ],
      buttonText: 'Get Started Free',
      popular: false,
      color: 'bg-white text-[#121212] border-gray-200'
    },
    {
      name: 'Pro Seeker',
      description: 'Boost your profile and stand out to top recruiters automatically.',
      price: isAnnual ? '9' : '12',
      duration: 'per month',
      features: [
        { text: 'Highlighted "Pro" Badge', included: true },
        { text: 'Priority Application Placement', included: true },
        { text: 'See Who Viewed Your Profile', included: true },
        { text: 'Advanced Application Tracking', included: true },
        { text: 'Resume AI Analysis', included: true },
        { text: '1-on-1 Career Coaching', included: false },
      ],
      buttonText: 'Upgrade to Pro',
      popular: true,
      color: 'bg-[#0B0C10] text-white border-[#0B0C10]'
    },
    {
      name: 'Career Plus',
      description: 'Maximum visibility and dedicated career support for fast growth.',
      price: isAnnual ? '29' : '39',
      duration: 'per month',
      features: [
        { text: 'Top 3 Placement in Applicant Lists', included: true },
        { text: 'Direct Messaging to Recruiters', included: true },
        { text: 'Unlimited Resume AI Analysis', included: true },
        { text: '1-on-1 Career Coaching (Monthly)', included: true },
        { text: 'Interview Prep Sessions', included: true },
        { text: 'Priority 24/7 Support', included: true },
      ],
      buttonText: 'Get Career Plus',
      popular: false,
      color: 'bg-white text-[#121212] border-gray-200'
    }
  ];

  const currentPlans = userType === 'employer' ? employerPlans : candidatePlans;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#FACC15] selection:text-[#0B0C10]">
      {/* Header */}
      <div className="pt-12 pb-24 px-6 relative overflow-hidden bg-[#0B0C10]">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] pointer-events-none"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[#FACC15]/20 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="container mx-auto relative z-10">
           <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 font-medium">
             <FaArrowLeft /> Back to Home
           </Link>
           
           <div className="text-center max-w-3xl mx-auto">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
               Simple, transparent <span className="text-[#FACC15]">pricing</span>
             </h1>
             <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
               Choose the perfect plan for your {userType === 'employer' ? 'hiring' : 'career'} needs. No hidden fees, cancel anytime.
             </p>
             
             {/* Toggles */}
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               {/* User Type Toggle */}
               <div className="inline-flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                 <button onClick={() => setUserType('candidate')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${userType === 'candidate' ? 'bg-white text-[#0B0C10] shadow-md' : 'text-gray-300 hover:text-white'}`}>
                   For Candidates
                 </button>
                 <button onClick={() => setUserType('employer')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${userType === 'employer' ? 'bg-white text-[#0B0C10] shadow-md' : 'text-gray-300 hover:text-white'}`}>
                   For Employers
                 </button>
               </div>
               
               <div className="hidden sm:block w-px h-8 bg-gray-700"></div>
               
               {/* Billing Toggle */}
               <div className="inline-flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                 <button onClick={() => setIsAnnual(false)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-[#0B0C10] shadow-md' : 'text-gray-300 hover:text-white'}`}>
                   Monthly
                 </button>
                 <button onClick={() => setIsAnnual(true)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-[#FACC15] text-[#0B0C10] shadow-md' : 'text-gray-300 hover:text-white'}`}>
                   Annually <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase rounded-full tracking-wider">Save 20%</span>
                 </button>
               </div>
             </div>
           </div>
         </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 pb-24 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
           {currentPlans.map((plan, idx) => (
             <div key={idx} className={`rounded-3xl border ${plan.popular ? 'border-[#FACC15] shadow-2xl shadow-[#FACC15]/10 md:-mt-8' : 'border-gray-200 shadow-lg shadow-gray-200/50'} ${plan.color} overflow-hidden transition-transform duration-300 hover:-translate-y-2`}>
               {plan.popular && <div className="bg-[#FACC15] text-[#0B0C10] text-center py-2 text-xs font-black uppercase tracking-widest">Most Popular Choice</div>}
               <div className="p-8 md:p-10">
                 <h3 className={`text-2xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-[#0B0C10]'}`}>{plan.name}</h3>
                 <p className={`text-sm h-12 mb-6 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                 <div className="mb-8"><span className="text-5xl font-black">${plan.price}</span><span className={`text-sm font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>/{plan.duration}</span></div>
                 <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 ${plan.popular ? 'bg-[#FACC15] text-[#0B0C10] hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20' : 'bg-gray-100 text-[#0B0C10] hover:bg-gray-200 border border-gray-200'}`}>{plan.buttonText}</button>
               </div>
               <div className={`p-8 md:p-10 border-t ${plan.popular ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                 <ul className="space-y-4">
                   {plan.features.map((feature, i) => (
                     <li key={i} className="flex items-start gap-3">
                       <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? (plan.popular ? 'bg-[#FACC15] text-[#0B0C10]' : 'bg-green-100 text-green-600') : (plan.popular ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400')}`}>
                         {feature.included ? <FaCheck size={10} /> : <FaTimes size={10} />}
                       </div>
                       <span className={`text-sm font-medium ${feature.included ? (plan.popular ? 'text-gray-200' : 'text-gray-700') : (plan.popular ? 'text-gray-600' : 'text-gray-400 line-through')}`}>{feature.text}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           ))}
        </div>
        <div className="text-center mt-20">
          <p className="text-gray-500 font-medium">Need a custom plan for your {userType === 'employer' ? 'enterprise' : 'career transition'}? <a href="#" className="text-[#0B0C10] font-bold border-b-2 border-[#FACC15] hover:text-[#FACC15] transition-colors pb-0.5">Contact our sales team</a></p>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;