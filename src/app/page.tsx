"use client";

import React, {useRef, useState, useEffect } from "react";

import Image from "next/image";
import authUser  from "./utils/authUser";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const openChat = () => {
    window.open("https://tawk.to/chat/67e3a3defdf8c219086c03df/1in8jg7nt", "_blank");
  };

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // Adjust the time as needed

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#0A2540] to-[#010409] p-4">
        <div className="relative w-full max-w-sm sm:max-w-md h-[280px] sm:h-[320px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-[inset_0_0_25px_rgba(0,0,0,0.5),0_20px_50px_rgba(0,0,0,0.6)] border-[5px] border-[#1e293b] flex flex-col items-center justify-center transform transition-all duration-500 hover:scale-105 hover:rotate-[0.5deg] hover:shadow-[0_30px_60px_rgba(72,178,255,0.3)]">
          
          {/* Floating Logo (slightly higher) */}
          <div className="absolute top-[43%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse z-10">
            <div className="p-4 border-[6px] border-[#48B2FF] rounded-full bg-gradient-to-tr from-[#0A2540] via-transparent to-[#48B2FF] shadow-[0_0_30px_#48B2FF]">
              <img
                src="infini.png"
                alt="Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-full shadow-[0_0_20px_rgba(72,178,255,0.5)]"
              />
            </div>
          </div>
    
          {/* INFINITECH Text Branding (slightly lower) */}
          <div className="absolute bottom-10 sm:bottom-8 z-20">
            <div className="flex flex-wrap gap-1 sm:gap-2 text-xl sm:text-3xl font-extrabold tracking-wider text-[#48B2FF]">
              {['I', 'N', 'F', 'I', 'N', 'I', 'T', 'E', 'C', 'H'].map((letter, i) => (
                <span
                  key={i}
                  style={{
                    animation: 'bounceUp 1s infinite alternate',
                    animationDelay: `${i * 0.1}s`,
                    display: 'inline-block',
                    filter: 'drop-shadow(0 0 5px #48B2FF)',
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
    
          {/* Keyboard Base */}
          <div className="absolute -bottom-5 w-[80%] h-3 bg-gradient-to-t from-gray-700 to-gray-800 rounded-b-2xl mx-auto shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"></div>
    
          {/* Trackpad */}
          <div className="absolute -bottom-9 w-[38%] h-2 bg-gray-600 rounded-xl shadow-inner"></div>
        </div>
    
        {/* Animation Keyframes */}
        <style jsx>{`
          @keyframes bounceUp {
            0% {
              transform: translateY(1.2rem);
              opacity: 0.2;
            }
            100% {
                          transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-blue-600 py-4 shadow-lg fixed top-0 w-full border-b-4 border-blue-800 z-50">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="text-white text-2xl font-bold drop-shadow-lg">
            <a href="/" className="transform hover:scale-110 transition duration-300">
              InfiniTask
            </a>
          </div>
          <img src="/infini.png" alt="Logo" className="w-9 " />
        </div>
      </header>
      <br />
      <br />
      <br />
      <br />

      {/* Hero Section */}
      <section className="py-5 flex items-center justify-end animate__animated animate__fadeIn animate__delay-1s">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6 lg:px-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl font-bold sm:text-6xl text-blue-600">Stay Organized with InfiniTask</h1>
            <p className="mt-6 text-lg text-gray-600">🚀 Stay organized, boost productivity, and never miss a deadline with our intuitive task management system.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
              <a href="/login" className="px-8 py-3 text-lg font-semibold rounded bg-blue-500 text-white hover:bg-blue-600 transition">Access Dashboard</a>
              <a href="/Signup" className="px-8 py-3 text-lg font-semibold border border-blue-600 rounded hover:bg-blue-100 transition">Create an Account</a>
            </div>
          </div>
          <br />
          <div className="lg:w-3/6 flex justify-center">
            <img src="https://img.freepik.com/free-vector/male-animator-sitting-computer-desk-creating-project-graphic-motion-designer-sitting-workplace-studio-developing-web-game-flat-vector-illustration-design-art-concept_74855-22510.jpg?semt=ais_hybrid&w=740" alt="Task Management" className="w-full max-w-2xl rounded-lg shadow-md animate__animated animate__fadeIn animate__delay-2s" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl font-bold text-blue-400 animate__animated animate__fadeIn">Managing Your Tasks Made Easier</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto animate__animated animate__fadeIn animate__delay-1s">
            Explore powerful tools to help you stay organized, focused, and productive every single day.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="space-y-20 mt-20">
          {/* Feature 1 */}
          <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-12 animate__animated animate__fadeInUp animate__delay-2s">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/dashboard-development-illustration-download-in-svg-png-gif-file-formats--woman-ux-user-web-software-pack-seo-illustrations-2918526.png"
              alt="Dashboard"
              className="w-full md:w-1/2 rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-all duration-300"
            />
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-blue-400">Dashboard Overview</h3>
              <p className="mt-4 text-lg text-gray-300">
                Our centralized dashboard gives you a complete picture of your productivity. From upcoming tasks and urgent deadlines to project milestones and progress charts, everything you need is displayed in a clean and actionable format—so you never miss a beat or forget what matters most.
                </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="container mx-auto px-6 lg:px-12 flex flex-col-reverse md:flex-row items-center gap-12 animate__animated animate__fadeInUp animate__delay-3s">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-blue-400">Personal Task Management</h3>
              <p className="mt-4 text-lg text-gray-300">
                Organize your daily life with a flexible task list that adapts to your priorities. Set personal goals, assign due dates, mark progress, and categorize activities so you can stay accountable and avoid overwhelm. Your to-do list will feel less like a chore and more like a clear plan for success.
              </p>
            </div>
            <img
              src="https://img.freepik.com/free-vector/dashboard-concept-illustration_114360-1447.jpg"
              alt="Personal Tasks"
              className="w-full md:w-1/2 rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-all duration-300"
            />
          </div>

          {/* Feature 3 */}
          <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-12 animate__animated animate__fadeInUp animate__delay-4s">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/dashboard-on-the-tablet-illustration-download-in-svg-png-gif-file-formats--device-technology-mobile-wrapped-hands-pack-miscellaneous-illustrations-3423824.png"
              alt="Profile Management"
              className="w-full md:w-1/2 rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-all duration-300"
            />
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-blue-400">Personalized Profile Settings</h3>
              <p className="mt-4 text-lg text-gray-300">
                Take full control of your user experience with customizable profile settings. From updating personal details and managing privacy preferences to setting notification styles and language options, everything is designed to reflect your style and workflow. It's your workspace—just the way you like it.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="container mx-auto px-6 lg:px-12 flex flex-col-reverse md:flex-row items-center gap-12 animate__animated animate__fadeInUp animate__delay-5s">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-blue-400">Admin Panel & Team Tools</h3>
              <p className="mt-4 text-lg text-gray-300">
                Designed for team leaders and project coordinators, the Admin Panel gives you the power to assign roles, delegate tasks, monitor real-time progress, and communicate effectively. Stay on top of team dynamics and ensure every project stays on track—no micromanaging required.
              </p>
            </div>
            <img
              src="https://img.freepik.com/free-vector/information-tab-concept-illustration_114360-4868.jpg?semt=ais_hybrid&w=740"
              alt="Admin Panel"
              className="w-full md:w-1/2 rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-all duration-300"
            />
          </div>
        </div>
      </section>

{/* Contact Section */}
<section className="mt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
  <div className="max-w-7xl mx-auto text-center px-6">
    <h2 className="text-4xl font-bold text-blue-400 mb-3">
      Get in Touch
    </h2>
    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
      Have questions about task management? We're here to help and would love to hear from you.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
    {[
  {
    icon: "📍",
    title: "Location",
    content: "Unit 311, Campus Rueda Bldg., Urban Avenue, Makati City, Metro Manila 1230"
  },
  {
    icon: "📞",
    title: "Phone",
    content: "+63 966 751 5747"
  },
  {
    
      icon: "📧",
      title: "Email",
      content: "infinitechcorp.ph@gmail.com",
      isLink: true,
      size: "text-sm", // You can increase this too if needed
      iconSize: "text-6xl" // 👈 Add this custom property for large icon
    
    
  },
  {
    icon: "⏰",
    title: "Business Hours",
    content: "Mon - Fri: 8 AM - 5 PM"
  },
  {
    icon: "💬",
    title: "Chat with us",
    content: "Click below to start a chat",
    isButton: true
  }
].map((item, index) => (
  <div
    key={index}
    className="bg-white/5 backdrop-blur-md border border-blue-700 p-8 rounded-2xl shadow-lg text-center w-full max-w-[260px] transform transition hover:scale-105 hover:shadow-xl"
  >
    <div className="text-5xl mb-5">{item.icon}</div>
    <h3 className="text-2xl font-semibold text-blue-300 mb-3">{item.title}</h3>

    {item.isLink ? (
      <a
        href={`mailto:${item.content}`}
        className={`text-blue-400 underline hover:text-blue-300 transition ${item.size || "text-base"}`}
      >
        {item.content}
      </a>
    ) : item.isButton ? (
      <button
        onClick={openChat}
        className="mt-3 px-6 py-3 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
      >
        Click it
      </button>
    ) : (
      <p className="text-gray-300 text-base">{item.content}</p>
    )}
  </div>
))}

    </div>
  </div>
</section>


      {/* Footer Section */}
      <footer className="bg-blue-600 py-6">
        <div className="container mx-auto text-center">
          <p className="text-white">© {new Date().getFullYear()} InfiniTask. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default authUser (HeroSection);