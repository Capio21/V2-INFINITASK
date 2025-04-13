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
        const response = await axios.get(`http://127.0.0.1:8000/api/notifications?authToken=${token}`);
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
      await axios.put(`http://127.0.0.1:8000/api/notifications/${id}/markAsRead`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, status: "read" } : n));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;
      await axios.put(`http://127.0.0.1:8000/api/notifications/markAllAsRead?authToken=${token}`);
      setNotifications(notifications.map(n => ({ ...n, status: "read" })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <>
      {/* Top Navbar (Mobile) */}
      <div className="fixed top-0 left-0 w-full bg-blue-700 p-3 flex justify-between items-center text-white md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      
        <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
          <FaBell className="text-xl" />
          {notifications.filter(n => n.status === "unread").length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications.filter(n => n.status === "unread").length}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-gray-800 p-2 flex flex-col justify-between border-r border-blue-600 shadow-xl transition-transform duration-300 z-50 ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}>
        <div className="flex items-center p-2 justify-between">
          <button onClick={() => setIsOpen(!isOpen)} className="text-blue-600 text-3xl focus:outline-none md:hidden">
            <FaTimes />
          </button>
          <h2 className="text-blue-600 text-lg font-bold"></h2>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center">
          <img src="/infini.png" alt="Logo" className="w-36 h-36 rounded-full object-cover" /> {/* Make logo circular */}
        </div>


        <nav className="mt-6 space-y-3">
          {[
            { path: "/todolist", label: "Dashboard", icon: <FaHome /> },
            { path: "/Taskuser", label: "My Tasks", icon: <FaTasks /> },
            { path: "/ProjectUser ", label: "My Project", icon: <FaProjectDiagram /> },
            { path: "/UserProfile", label: "Profile", icon: <FaUserAlt /> },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className="relative w-full flex items-center text-left bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md border border-blue-600"
            >
              <span className="mr-3 text-lg text-blue-600">{item.icon}</span>
              <span className="text-white">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto w-full space-y-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-full bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-xl shadow-md flex items-center justify-center text-blue-600 font-medium transition-all border border-blue-600"
          >
            <FaBell className="mr-0.5 text-blue-600" />
            <span>Notifications</span>
            {notifications.filter(n => n.status === "unread").length > 0 && (
              <span className="absolute bottom-7 left-7 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {notifications.filter(n => n.status === "unread").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-xl shadow-md flex items-center justify-center text-blue-600 font-medium transition-all border border-blue-600"
          >
            <FaSignOutAlt className="mr-0.5 text-blue-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Responsive Overlay (Mobile) */}
      {isOpen && <div className="fixed inset-0 bg-gray-700 bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)}></div>}

      {/* Notification Panel */}
      <div className={`fixed top-14 right-2 bg-white shadow-md p-3 rounded-lg w-72 md:w-80 border border-blue-600 z-50 text-blue-800 transition-transform transform ${showNotifications ? "translate-x-0" : "translate-x-full"} duration-300`}>
        <div className="flex justify-between items-center border-b pb-1 mb-2 text-blue-600">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <button onClick={() => setShowNotifications(false)} className="hover:text-blue-400">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="flex justify-between text-xs mb-2">
          <button onClick={() => setActiveTab("unread")} className={`px-2 py-1 ${activeTab === "unread" ? "text-blue-600" : "text-gray-400"}`}>
            Unread
          </button>
          <button onClick={() => setActiveTab("read")} className={`px-2 py-1 ${activeTab === "read" ? "text-blue-600" : "text-gray-400"}`}>
            Read
          </button>
          <button onClick={markAllAsRead} className="text-blue-400 hover:underline text-xs sm:block hidden">
            Mark all as Read
          </button>
        </div>

        <ul className="max-h-48 overflow-auto">
          {notifications.filter(n => n.status === activeTab).length === 0 ? (
            <p className="text-center text-gray-500 text-xs">No {activeTab} notifications</p>
          ) : (
            notifications.filter(n => n.status === activeTab).map(notif => (
              <li
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className="py-2 px-2 bg-gray-200 rounded-lg mb-1 shadow-sm border-l-4 border-blue-600 cursor-pointer flex justify-between items-center"
              >
                <span className="text-xs">{notif.message}</span>
                {notif.status === "unread" && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white text-blue-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-md">
                Cancel
              </button>
              <button onClick={handleLogout} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">
                Logout
              </button>
            </div>
          </div>
        </div>
      )} 
    </>
  );
}