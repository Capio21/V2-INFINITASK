"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { Clock, CheckCircle, AlertTriangle, Archive, MessageCircle } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

interface Activity {
  id: number;
  status: "pending" | "complete" | "overdue";
  archive: boolean;
  date_started: string;
}

const TodoList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString());

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

  const pendingCount = activities.filter(a => a.status === "pending" && !a.archive).length;
  const completeCount = activities.filter(a => a.status === "complete" && !a.archive).length;
  const overdueCount = activities.filter(a => a.status === "overdue" && !a.archive).length;
  const archiveCount = activities.filter(a => a.archive).length;

  const totalTasks = pendingCount + completeCount + overdueCount;
  const completionPercentage = totalTasks > 0 ? (completeCount / totalTasks) * 100 : 0;

  const pieData = [
    { name: "Pending", value: pendingCount },
    { name: "Completed", value: completeCount },
    { name: "Overdue", value: overdueCount },
  ];
  const pieColors = ["#facc15", "#4ade80", "#f87171"];

  const lineData = activities.map((activity, index) => ({
    name: `Task ${index + 1}`,
    Completed: activity.status === "complete" ? 1 : 0,
    Pending: activity.status === "pending" ? 1 : 0,
    Overdue: activity.status === "overdue" ? 1 : 0,
  }));

  const handleChatClick = () => {
    window.open("https://tawk.to/chat/67e3a3defdf8c219086c03df/1in8jg7nt", "_blank");
  };

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 md:ml-64">
        <ToastContainer />

        {/* Header */}
        <br />
        <br />
        <div className="flex flex-col items-center mb-6">
  <header className="text-center mb-6">
    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
      Admin Task Dashboard
    </h1>
    <p className="text-sm text-gray-400 mt-2">
      Manage your daily tasks and track progress
    </p>
  </header>
  
  <div className="text-sm text-gray-300">
    📅 {currentDate} | ⏰ {currentTime}
  </div>
</div>


        {/* Top Bar */}
        <div className="flex justify-between items-center bg-gray-700 rounded-xl px-6 py-4 mb-6 shadow-md">
          <div className="text-lg font-semibold">📋 Task Overview</div>
          <button
            onClick={handleChatClick}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            <MessageCircle size={18} />
            <span>Chat with Admin</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 text-sm text-gray-300">Task Completion</div>
          <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-700 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-300 mt-1">
            {completionPercentage.toFixed(1)}% Completed
          </div>
        </div>

        {/* Task Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
          <Card icon={<Clock size={22} className="text-yellow-400" />} label="Pending Tasks" count={pendingCount} color="yellow" />
          <Card icon={<CheckCircle size={22} className="text-green-400" />} label="Completed Tasks" count={completeCount} color="green" />
          <Card icon={<AlertTriangle size={22} className="text-red-400" />} label="Overdue Tasks" count={overdueCount} color="red" />
          <Card icon={<Archive size={22} className="text-gray-400" />} label="Archived Tasks" count={archiveCount} color="gray" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">Status Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Completed" stroke="#4ade80" />
                <Line type="monotone" dataKey="Pending" stroke="#facc15" />
                <Line type="monotone" dataKey="Overdue" stroke="#f87171" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Card Component
const Card = ({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) => {
  const bgMap: Record<string, string> = {
    yellow: "bg-yellow-600",
    green: "bg-green-600",
    red: "bg-red-600",
    gray: "bg-gray-600",
  };
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:scale-105 transition-transform shadow-lg">
      <div className="flex items-center mb-3">
        {icon}
        <span className="text-lg font-semibold ml-3">{label}</span>
        <span className={`ml-auto ${bgMap[color]} text-white px-3 py-1 rounded-full text-sm`}>
          {count}
        </span>
      </div>
      <p className="text-gray-400 text-sm">Task summary</p>
    </div>
  );
};

export default TodoList;
