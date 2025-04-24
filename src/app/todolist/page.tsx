"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import authUser  from "../utils/authUser";
import { ToastContainer } from "react-toastify";

interface Activity {
  id: number;
  status: "pending" | "complete" | "overdue";
  archive: boolean;
  date_started: string;
}

const TodoList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString()
  );
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem("isLightMode") === "true";
  });

  const API_BASE_URL = "https://infinitech-api5.site/api";

  useEffect(() => {
    fetchActivities();
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDate(new Date().toLocaleDateString());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const fetchActivities = async () => {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/activities/${authToken}`);
      if (response.data && Array.isArray(response.data)) {
        setActivities(response.data);
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const pendingCount = activities.filter((activity) => activity.status === "pending" && !activity.archive).length;
  const completeCount = activities.filter((activity) => activity.status === "complete" && !activity.archive).length;
  const overdueCount = activities.filter((activity) => activity.status === "overdue" && !activity.archive).length;
  const archiveCount = activities.filter((activity) => activity.archive).length;

  const totalTasks = pendingCount + completeCount + overdueCount;
  const completionPercentage = totalTasks > 0 ? (completeCount / totalTasks) * 100 : 0;

  const groupedData = activities.reduce(
    (acc, activity) => {
      if (!activity.date_started) return acc;
      if (!acc[activity.date_started]) {
        acc[activity.date_started] = {
          date: activity.date_started,
          pending: 0,
          complete: 0,
          overdue: 0,
        };
      }
      acc[activity.date_started][activity.status] += 1;
      return acc;
    },
    {} as Record<string, { date: string; pending: number; complete: number; overdue: number }>
  );

  const chartData = Object.values(groupedData);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleChatClick = () => {
    window.open("https://tawk.to/chat/67e3a3defdf8c219086c03df/1in8jg7nt", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />
      <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block">
      </div>
  
      {/* Main Content */}
      <div className="flex-grow px-4 py-6 overflow-y-auto">
        <ToastContainer />
  
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <br />
          <br />
          <h1 className="text-4xl font-bold text-blue-400 mb-2">DASHBOARD | USER</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-700 px-4 py-2 rounded-full font-semibold text-sm shadow">
              Overview
            </div>
            <button
              onClick={handleChatClick}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow transition"
            >
              💬 Chat with Admin
            </button>
          </div>
          <p className="mt-2 text-sm text-blue-300">
            📅 {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })} | ⏰ {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
  
        {/* Task Completion Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">📈 Task Completion</h2>
          <div className="w-full bg-blue-300 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-blue-900 transition-all"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="text-right text-sm mt-1 text-blue-100">
            {completionPercentage.toFixed(2)}% Completed
          </div>
        </div>
  
       {/* Status Cards (Feed-style) */}
<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {[
    { label: "Pending", count: pendingCount, icon: "🕒", border: "border-yellow-600" },
    { label: "Complete", count: completeCount, icon: "✅", border: "border-green-600" },
    { label: "Overdue", count: overdueCount, icon: "⚠️", border: "border-red-600" },
    { label: "Archived", count: archiveCount, icon: "📦", border: "border-orange-600" },
  ].map((item, i) => (
    <div
      key={i}
      className={`flex flex-col justify-between p-6 rounded-2xl shadow-lg bg-gray-900 border-4 ${item.border} transform transition hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{item.icon}</span>
        <span className="text-2xl font-bold">{item.count}</span>
      </div>
      <h3 className="text-lg font-semibold mt-2">{item.label}</h3>
    </div>
  ))}
</div>

  
        {/* Chart Section */}
        <div className="mt-10 bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-blue-300 mb-4">📊 Task Status Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="pending" stroke="#FACC15" strokeWidth={2} />
              <Line type="monotone" dataKey="complete" stroke="#22C55E" strokeWidth={2} />
              <Line type="monotone" dataKey="overdue" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
  
};

export default authUser (TodoList);
