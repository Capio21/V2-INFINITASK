"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Adminbar from "../Components/adminsidebar"; // Assuming this is your sidebar component
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { ToastContainer } from "react-toastify";
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Importing icons
import authUser  from "../utils/authUser";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const TaskList = ({ tasks = [] }) => {
  const itemsPerPage = 5; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  // Get current tasks based on the current page
  const currentTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full">
      <h2 className="text-lg font-semibold text-center mb-2 text-blue-600">Tasks</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-blue-200 divide-y divide-blue-200">
          <thead>
            <tr>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-800 uppercase tracking-wider border-b border-blue-200">Title</th>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-800 uppercase tracking-wider border-b border-blue-200">User </th>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-800 uppercase tracking-wider border-b border-blue-200">Status</th>
              <th className="px-8 py-4 text-left text-lg font-bold text-gray-800 uppercase tracking-wider border-b border-blue-200">Due Date</th>
            </tr>
          </thead>
          <tbody className="bg-blue-50 divide-y divide-blue-200">
            {currentTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-800 border border-blue-200 flex items-center">
                  {task.status === 'complete' && <FaCheckCircle className="text-green-400 mr-2" />}
                  {task.status === 'overdue' && <FaExclamationCircle className="text-red-400 mr-2" />}
                  {task.title}
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-800 border border-blue-200">{task.user.username}</td>
                <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-800 border border-blue-200">{task.status}</td>
                <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-800 border border-blue-200">
                  {(() => {
                    const date = new Date(task.deadline);
                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                    const formattedDate = date.toLocaleDateString('en-US', options);
                    const parts = formattedDate.replace(',', '').split(' ');
                    const [month, day, year] = parts;
                    return `${day} - ${month} - ${year}`;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-800">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [taskCount, setTaskCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [taskData, setTaskData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await axios.get(`${API_BASE_URL}/tasks`);
        const tasks = tasksRes.data;

        setTaskCount(tasks.length);
        setPendingCount(tasks.filter((task) => task.status === "pending").length);
        setCompletedCount(tasks.filter((task) => task.status === "complete").length);

        // Calculate overdue tasks
        const now = new Date();
        const overdueTasks = tasks.filter((task) => new Date(task.deadline) < now && task.status !== "complete");
        setOverdueCount(overdueTasks.length);

        const usersRes = await axios.get(`${API_BASE_URL}/users`);
        const users = usersRes.data;

        setUserCount(users.length);

        const groupedUsers = users.reduce((acc, user) => {
          const date = new Date(user.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const formattedUserData = Object.keys(groupedUsers).map((date) => ({
          date,
          users: groupedUsers[date],
        }));

        setUserData(formattedUserData);
        setTaskData(tasks);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const data = [
    { name: 'Pending', value: pendingCount },
    { name: 'Completed', value: completedCount },
    { name: 'Overdue', value: overdueCount },
  ];

  const COLORS = ['#FFBB28', '#00C49F', '#FF4C4C'];

  return (
    <div className="flex flex-col max-h-full bg-blue-50 text-gray-800">
      <Adminbar />
  
      <div className="flex flex-1">
        {/* Sidebar / Adminbar */}
        <div className="sticky top-0 h-screen w-64 bg-blue-600 shadow-lg hidden md:block"></div>
  
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen p-4 md:p-9 w-full overflow-auto">
          <ToastContainer />
          <br />
          <br />
          <h1 className="text-5xl font-bold mb-4 text-blue-900 text-center">

            Dashboard<span className="text-lg text-blue-900"> | Admin</span>
          </h1>
  
          {/* Current Time */}
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-blue-900">
              {currentTime.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} - {currentTime.toLocaleTimeString()}
            </p>
          </div>
  
          {/* Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
            {[
              { label: "Total Tasks", count: taskCount, color: "text-gray-300" },
              { label: "Pending", count: pendingCount, color: "text-yellow-400" },
              { label: "Completed", count: completedCount, color: "text-gray-500" },
              { label: "Overdue", count: overdueCount, color: "text-red-400" },
              { label: "Total Users", count: userCount, color: "text-blue-400" },
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-lg text-center border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-800">{item.label}</h2>
                <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
              </div>
            ))}
          </div>
  
          {/* Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center border border-blue-200">
              <h2 className="text-lg font-semibold text-center mb-2 text-blue-600">Task Progress</h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
  
            <div className="bg-white p-4 rounded-xl shadow-lg w-full border border-blue-200">
              <h2 className="text-lg font-semibold text-center mb-2 text-blue-600">Users per Date</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#00C49F" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <br />
  
          {/* Task List Component - Now below the charts */}
          <TaskList tasks={taskData} />
        </div>
      </div>
    </div>
  );
}

export default authUser (Dashboard);