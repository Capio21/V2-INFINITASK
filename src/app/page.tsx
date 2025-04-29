"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "../app/style.css"

export default function LandingPage() {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const features = [
    {
      title: "Dashboard Overview",
      description:
        "Our centralized dashboard gives you a complete picture of your productivity. From upcoming tasks and urgent deadlines to project milestones and progress charts, everything you need is displayed in a clean and actionable format—so you never miss a beat or forget what matters most.",
      image:
        "https://cdni.iconscout.com/illustration/premium/thumb/dashboard-development-illustration-download-in-svg-png-gif-file-formats--woman-ux-user-web-software-pack-seo-illustrations-2918526.png",
      alt: "Dashboard",
    },
    {
      title: "Personal Task Management",
      description:
        "Organize your daily life with a flexible task list that adapts to your priorities. Set personal goals, assign due dates, mark progress, and categorize activities so you can stay accountable and avoid overwhelm. Your to-do list will feel less like a chore and more like a clear plan for success.",
      image: "https://img.freepik.com/free-vector/dashboard-concept-illustration_114360-1447.jpg",
      alt: "Personal Tasks",
    },
    {
      title: "Personalized Profile Settings",
      description:
        "Take full control of your user experience with customizable profile settings. From updating personal details and managing privacy preferences to setting notification styles and language options, everything is designed to reflect your style and workflow. It's your workspace—just the way you like it.",
      image:
        "https://cdni.iconscout.com/illustration/premium/thumb/dashboard-on-the-tablet-illustration-download-in-svg-png-gif-file-formats--device-technology-mobile-wrapped-hands-pack-miscellaneous-illustrations-3423824.png",
      alt: "Profile Management",
    },
    {
      title: "Admin Panel & Team Tools",
      description:
        "Designed for team leaders and project coordinators, the Admin Panel gives you the power to assign roles, delegate tasks, monitor real-time progress, and communicate effectively. Stay on top of team dynamics and ensure every project stays on track—no micromanaging required.",
      image:
        "https://img.freepik.com/free-vector/information-tab-concept-illustration_114360-4868.jpg?semt=ais_hybrid&w=740",
      alt: "Admin Panel",
    },
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === features.length - 1 ? 0 : prev + 1))
  }, [features.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? features.length - 1 : prev - 1))
  }, [features.length])

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex)
  }

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => {
      clearInterval(interval)
    }
  }, [nextSlide])

  return (
    <div className="landing-page">
       <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/20 shadow-sm">
  <div className="container mx-auto flex items-center justify-between px-4 py-3">
    <div className="logo">
      <Image src="/infini.png" alt="Infini Task Logo" width={80} height={25} />
    </div>
    <nav className="nav">
      <ul className="nav-menu flex gap-6 text-white font-medium">
        {/* You can add nav links here if needed */}
      </ul>
    </nav>
    <div className="auth-buttons flex gap-4">
    
      <Link
        href="/Signup"
        className="signup-btn bg-deepskyblue text-white px-4 py-2 rounded-full shadow hover:bg-sky-500 transition"
      >
        Sign-up and Gets started
      </Link>
    </div>
  </div>
</header>

      <main>
        {/* Hero Section with Background Video */}
        <section id="home" className="hero">
          <div className="video-background">
            <video autoPlay loop muted playsInline>
              <source src="/videos/background-vid.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="overlay"></div>
          </div>
          <div className="container hero-content">
            <h1>
              Manage Tasks with <span>Infinite</span> Possibilities
            </h1>
            <p>
              Infini Task helps you organize your work, boost productivity, and achieve more with a simple, intuitive
              task management system.
            </p>
            <div className="hero-buttons">
              <Link href="/login" className="primary-btn">
                Access your Dashboard
              </Link>
            </div>
          </div>
        </section>
        {/* How It Works */}
        <section id="how-it-works" className="how-it-works">
                    <br />
          <div className="container">
            <div className="section-header">
              <h2>How Infini Task Works</h2>
              <p>Get started in minutes and transform your productivity</p>
            </div>
            <div className="steps">
              {steps.map((step, index) => (
                <div key={index} className="step">
                  <div className="step-number">{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
                    <br />
        </section>

        {/* Features Section - Carousel */}
        <section className="bg-gray-900 py-20">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl font-bold text-blue-400 animate__animated animate__fadeIn">
              Managing Your Tasks Made Easier
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto animate__animated animate__fadeIn animate__delay-1s">
              Explore powerful tools to help you stay organized, focused, and productive every single day.
            </p>
          </div>

          {/* Carousel Container */}
          <div
            className="relative overflow-hidden mt-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Slides Container */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                      <div className="w-full md:w-1/2 flex justify-center">
                        <img
                          src={feature.image || "/placeholder.svg"}
                          alt={feature.alt}
                          className="w-full max-w-md rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-all duration-300"
                        />
                      </div>
                      <div className="w-full md:w-1/2 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-blue-400">{feature.title}</h3>
                        <p className="mt-4 text-lg text-gray-300">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-blue-400 text-blue-400 hover:text-gray-900 p-3 rounded-full transition-colors duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-blue-400 text-blue-400 hover:text-gray-900 p-3 rounded-full transition-colors duration-300"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Carousel Controls */}
          <div className="container mx-auto px-6 lg:px-12 mt-8">
            <div className="flex flex-col items-center gap-4">
              {/* Indicator Dots */}
              <div className="flex space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index ? "bg-blue-400 w-6" : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md h-1 bg-gray-800 rounded-full mt-2">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${((currentSlide + 1) / features.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

{/* About Section */}
<section id="about" className="about py-10 px-5 md:px-20 bg-gray-50">
  <div className="container mx-auto">
    <div className="section-header text-center mb-8">
      <h2 className="text-3xl font-bold mb-2">About Infini Task</h2>
      <p className="text-gray-600">Empowering office teams to stay organized, efficient, and ahead of deadlines</p>
    </div>
    <div className="flex flex-col md:flex-row items-center gap-10">
      <div className="about-text flex-1">
        <p className="text-gray-700 mb-4">
          Infini Task is your all-in-one platform designed specifically for office employees and teams who want to organize their daily tasks efficiently. From setting priorities to tracking project progress, Infini Task makes it easy to collaborate and stay productive.
        </p>
        <p className="text-gray-700 mb-4">
          Whether you're managing internal projects, handling client work, or simply keeping your team's workflow smooth, Infini Task offers powerful tools with a user-friendly experience. Plan, assign, and complete tasks — all in one place.
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Organize office tasks and projects effortlessly</li>
          <li>Assign responsibilities and track deadlines</li>
          <li>Boost team collaboration and accountability</li>
          <li>Stay on top of priorities even on busy days</li>
        </ul>
      </div>
      <div className="about-image flex-1">
        <Image
          src="/infini.png"
          alt="Infini Task for Office Teams"
          width={500}
          height={400}
          className="rounded-lg shadow-md w-full object-cover"
        />
      </div>
    </div>
  </div>
</section>


        {/* Contact Section */}
        <section className="mt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
          <div className="max-w-7xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold text-blue-400 mb-3">Get in Touch</h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Have questions? We're here to help and would love to hear from you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
              {[
                {
                  icon: "📞",
                  title: "Phone",
                  content: "+1 (123) 456-7890",
                },
                {
                  icon: "📧",
                  title: "Email",
                  content: "info@infinitask.com",
                  isLink: true,
                },
                {
                  icon: "📍",
                  title: "Address",
                  content: "123 Task Street, Productivity City, 12345",
                },
                {
                  icon: "⏰",
                  title: "Business Hours",
                  content: "Mon - Fri: 9 AM - 6 PM",
                },
                {
                  icon: "💬",
                  title: "Chat with us",
                  content: "Click below to start a chat",
                  isButton: true,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-md border border-blue-700 p-6 md:p-8 rounded-2xl shadow-lg text-center w-full max-w-[260px] transform transition hover:scale-105 hover:shadow-xl"
                >
                  <div className="text-4xl md:text-5xl mb-5">{item.icon}</div>
                  <h3 className="text-xl md:text-2xl font-semibold text-blue-300 mb-3">{item.title}</h3>

                  {item.isLink ? (
                    <a
                      href={`mailto:${item.content}`}
                      className="text-blue-400 underline hover:text-blue-300 text-sm break-words overflow-hidden text-ellipsis w-full block max-w-[200px] mx-auto"
                    >
                      {item.content}
                    </a>
                  ) : item.isButton ? (
                    <button
                      onClick={() => alert("Chat function coming soon!")}
                      className="mt-3 px-6 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
                      Click it
                    </button>
                  ) : (
                    <p className="text-gray-300 text-sm break-words">{item.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
      </main>

      <footer className="bg-gray-900 text-white py-8">
  <div className="container mx-auto px-4">
    <div className="flex flex-col items-center text-center">
     
      <p className="text-sm text-gray-400">Simplify your tasks. Amplify your productivity.</p>
    </div>
  </div>
</footer>

    </div>
  )
}

const steps = [
  {
    title: "Sign Up",
    description: "Create your account in seconds and get started.",
  },
  {
    title: "Create Tasks",
    description: "Add your tasks, set priorities, deadlines, and organize them into projects.",
  },
  {
    title: "Boost Productivity",
    description: "Track progress, collaborate with your team, and achieve your goals faster.",
  },
]
