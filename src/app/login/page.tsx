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
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
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

      {/* Background Image */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 sm:px-0">
        <Image
          src="/cram.png"
          alt="Task Management Background"
          layout="fill"
          objectFit="cover"
          className="absolute top-0 left-0 w-full h-full opacity-20"
        />

        {/* Login Box */}
        <div className="relative bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm border border-blue-600">
            {/* Logo */}
        <div className="flex items-center justify-center">
          <img src="/infini.png" alt="Logo" className="w-36 h-36 rounded-full object-cover" /> {/* Make logo circular */}
        </div>
          <br />
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 text-center mb-4 sm:mb-6">
  <span className="uppercase">INFINI</span>
  <span className="mx-2">|</span>
  <span>Sign-in</span>
</h2>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-gray-700 text-sm sm:text-lg font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Check if the input value starts with "INFINI-"
                  if (!inputValue.startsWith("INFINI-")) {
                    setUsername("INFINI-" + inputValue);
                  } else {
                    setUsername(inputValue);
                  }
                }}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 bg-gray-100 text-gray-800 rounded-lg focus:ring focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password Field with Toggle */}
            <div className="relative">
              <label className="block text-gray-700 text-sm sm:text-lg font-medium mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 bg-gray-100 text-gray-800 rounded-lg focus:ring focus:ring-blue-500 pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-10 sm:top-11 text-gray-400 hover:text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center space-y-3">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-lg transition font-semibold flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full border-4 border-white border-t-transparent h-5 w-5 mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <button
                type="button"
                className="w-full bg-gray-300 hover:bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg text-sm sm:text-lg transition"
                onClick={() => router.push("/")}
              >
                ⬅ Back to Landing Page
              </button>
            </div>
          </form>

          <p className="text-sm sm:text-lg text-center text-gray-600 mt-4">
            New here?{" "}
            <a href="/Signup" className="text-blue-600 hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </>
  );
}