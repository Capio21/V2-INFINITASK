"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaBars, FaTimes, FaHome, FaTasks, FaUserAlt, FaProjectDiagram, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Pusher from 'pusher-js';

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 768); // Default open if screen is large
  const [activeTab, setActiveTab] = useState("unread");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateSidebarState = () => {
      setIsOpen(window.innerWidth >= 768); // Open sidebar if screen is large
    };

    updateSidebarState(); // Set initial state
    window.addEventListener("resize", updateSidebarState);

    return () => {
      window.removeEventListener("resize", updateSidebarState);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        if (!token) return;
        const response = await axios.get(`https://infinitech-api5.site/api/notifications?authToken=${token}`);
        if (response.status === 200) {
          setNotifications(response.data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const pusher = new Pusher('366bc5628b9a180070ae', {
      cluster: 'ap1',
      encrypted: true,
      logToConsole: true
    });

    const channel = pusher.subscribe('notifications');

    channel.bind('NotificationSent', (data) => {
      console.log("New Notification Received:", data);
      setNotifications(prev => [data, ...prev]);
      fetchNotifications();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    router.push("/login");
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`https://infinitech-api5.site/api/notifications/${id}/markAsRead`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, status: "read" } : n));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;
      await axios.put(`https://infinitech-api5.site/api/notifications/markAllAsRead?authToken=${token}`);
      setNotifications(notifications.map(n => ({ ...n, status: "read" })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <>
     {/* Top Navbar (Mobile) */}
<div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#0f172a] p-3 flex justify-between items-center text-cyan-300 md:hidden shadow-md z-50">
  <button onClick={() => setIsOpen(!isOpen)} className="text-2xl hover:text-cyan-100 transition">
    {isOpen ? <FaTimes /> : <FaBars />}
  </button>

  <div className="flex items-center space-x-4">
    <button onClick={() => setShowNotifications(!showNotifications)} className="relative hover:text-cyan-100 transition">
      <FaBell className="text-xl" />
      {notifications.filter(n => n.status === "unread").length > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {notifications.filter(n => n.status === "unread").length}
        </span>
      )}
    </button>

    <button 
      onClick={() => setShowLogoutModal(true)} 
      className="text-sm px-3 py-1 bg-gray-800 border border-cyan-500 rounded-md hover:bg-gray-700 hover:text-white transition shadow-sm"
    >
      Logout
    </button>
  </div>
</div>


   {/* Cyber Sidebar */}
<aside className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900 p-3 flex flex-col justify-between border-r border-blue-500 shadow-2xl transition-transform duration-300 z-[1000] font-mono ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}>
  {/* Top Close Button */}
  <div className="flex items-center justify-between mb-4">
    <button onClick={() => setIsOpen(!isOpen)} className="text-cyan-400 text-2xl focus:outline-none md:hidden hover:text-blue-400 transition">
      <FaTimes />
    </button>
   
  </div>

  {/* Logo */}
  <div className="flex items-center justify-center mb-4">
    <img src="/infini.png" alt="Logo" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md" />
  </div>

  {/* Navigation Links */}
  <nav className="mt-4 space-y-3">
    {[
      { path: "/todolist", label: "Dashboard", icon: <FaHome /> },
      { path: "/Taskuser", label: "My Tasks", icon: <FaTasks /> },
      { path: "/ProjectUser", label: "My Project", icon: <FaProjectDiagram /> },
      { path: "/UserProfile", label: "Profile", icon: <FaUserAlt /> },
    ].map((item, index) => (
      <button
        key={index}
        onClick={() => router.push(item.path)}
        className="w-full flex items-center bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md border border-blue-500 hover:shadow-cyan-500/50"
      >
        <span className="mr-3 text-lg text-cyan-400">{item.icon}</span>
        <span className="text-blue-100">{item.label}</span>
      </button>
    ))}
  </nav>

  {/* Bottom Buttons */}
  <div className="mt-auto w-full space-y-3">
    <button
      onClick={() => setShowNotifications(!showNotifications)}
      className="relative w-full bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-xl shadow-md flex items-center justify-center text-cyan-400 font-medium transition-all border border-blue-500 hover:shadow-cyan-400/50"
    >
      <FaBell className="mr-1 text-cyan-400" />
      <span>Notifications</span>
      {notifications.filter(n => n.status === "unread").length > 0 && (
        <span className="absolute bottom-7 left-6 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          {notifications.filter(n => n.status === "unread").length}
        </span>
      )}
    </button>

    <button
      onClick={() => setShowLogoutModal(true)}
      className="w-full bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-xl shadow-md flex items-center justify-center text-red-400 font-medium transition-all border border-red-500 hover:shadow-red-400/50"
    >
      <FaSignOutAlt className="mr-1 text-red-400" />
      <span>Logout</span>
    </button>
  </div>
</aside>

      {/* Responsive Overlay (Mobile) */}
      {isOpen && <div className="fixed inset-0 bg-gray-700 bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)}></div>}

  {/* Cyber Notification Panel */}
<div className={`fixed top-14 right-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 shadow-xl p-4 rounded-xl w-72 md:w-80 border border-blue-500 z-50 text-blue-300 transition-transform transform ${showNotifications ? "translate-x-0" : "translate-x-full"} duration-300 font-mono`}>
  <div className="flex justify-between items-center border-b border-blue-500 pb-2 mb-3">
    <h3 className="text-sm font-semibold tracking-wide text-blue-400">NOTIFICATIONS</h3>
    <button onClick={() => setShowNotifications(false)} className="hover:text-cyan-400 transition-colors duration-150">
      <FaTimes size={16} />
    </button>
  </div>

  <div className="flex justify-between text-xs mb-3 text-blue-400">
    <button onClick={() => setActiveTab("unread")} className={`px-3 py-1 rounded-md transition duration-150 ${activeTab === "unread" ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-700"}`}>
      Unread
    </button>
    <button onClick={() => setActiveTab("read")} className={`px-3 py-1 rounded-md transition duration-150 ${activeTab === "read" ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-700"}`}>
      Read
    </button>
    <button onClick={markAllAsRead} className="text-blue-400 hover:underline hidden sm:block">
      Mark all as Read
    </button>
  </div>

  <ul className="max-h-52 overflow-y-auto pr-1 custom-scrollbar">
    {notifications.filter(n => n.status === activeTab).length === 0 ? (
      <p className="text-center text-gray-500 text-xs">No {activeTab} notifications</p>
    ) : (
      notifications.filter(n => n.status === activeTab).map(notif => (
        <li
          key={notif.id}
          onClick={() => markAsRead(notif.id)}
          className="py-2 px-3 bg-gray-800 rounded-md mb-2 border-l-4 border-cyan-500 cursor-pointer flex justify-between items-center hover:bg-gray-700 transition"
        >
          <span className="text-xs text-blue-200">{notif.message}</span>
          {notif.status === "unread" && <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>}
        </li>
      ))
    )}
  </ul>
</div>

      {/* Cyber Blue & Gray Logout Modal */}
{showLogoutModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a]/70 backdrop-blur-sm z-[999]">
    <div className="bg-gradient-to-br from-[#1f2937] via-[#0f172a] to-[#111827] border border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)] text-cyan-300 p-6 rounded-xl w-96 transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 tracking-wider uppercase text-cyan-400">Confirm Logout</h2>
      <p className="text-sm text-cyan-100 mb-6">Are you sure you want to logout?</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-cyan-300 border border-cyan-600 rounded-md transition hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
        >
          Cancel
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md border border-cyan-300 transition hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
