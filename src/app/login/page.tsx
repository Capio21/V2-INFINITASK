"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Toast notifications
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!username || !password) {
      toast.error("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://infinitech-api5.site/api/login",
        { username, password },
        { withCredentials: true }
      );

      if (response.data.token) {
        sessionStorage.setItem("authToken", response.data.token);
        toast.success("Login successful!");
        
        setTimeout(() => {
          response.data.usertype === "admin"
            ? router.push("/DashBoard")
            : router.push("/todolist");
        }, 3000); // Delay for 3 seconds to show success modal
      } else {
        toast.error("Invalid credentials. Please try again.");
        setLoading(false);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please check your username and password.");
      } else {
        toast.error("Login failed. Please try again later.");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Head>
        <title>Login | Infinitech</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
  
      {/* Background Container */}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black px-4">
        {/* Background Image */}
        <Image
          src="/cram.png"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="absolute top-0 left-0 w-full h-full opacity-10"
        />
  
        {/* Login Card */}
        <div className="relative z-10 bg-white/30 backdrop-blur-md border border-blue-500 shadow-xl rounded-2xl p-8 w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/infini.png" alt="Infinitech Logo" className="w-28 h-28 rounded-full shadow-lg object-cover" />
          </div>
  
          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide">
            <span className="text-blue-400">INFINI</span>
            <span className="mx-2 text-gray-200">|</span>
            <span className="text-blue-100">Sign-in</span>
          </h2>
  
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-white font-semibold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (!inputValue.startsWith("INFINI-")) {
                    setUsername("INFINI-" + inputValue);
                  } else {
                    setUsername(inputValue);
                  }
                }}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
  
            {/* Password */}
            <div className="relative">
              <label className="block text-white font-semibold mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 rounded-lg bg-white/80 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-10 text-gray-500 hover:text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
              </button>
            </div>
  
            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg flex justify-center items-center transition duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
  
          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 text-sm sm:text-base">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-blue-300 hover:text-white transition  "
            >
              Back to Home
            </button>
            <a
              href="/Signup"
              className="text-blue-300 hover:text-white transition "
            >
              Create an account!
            </a>
          </div>
        </div>
      </div>
    </>
  );
  
}
