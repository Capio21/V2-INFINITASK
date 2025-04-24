"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Sidebar from "../Components/Sidebar"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import { ToastContainer, toast } from "react-toastify"
import authUser from "../utils/authUser"
import { Edit, Save, X, Clock, CheckCircle, AlertTriangle, Archive, Grid, Bookmark } from "lucide-react"

interface Activity {
  id: number
  status: "pending" | "complete" | "overdue"
  archive: boolean
  date_started: string
}

const TodoPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState("tasks")

  const API_BASE_URL = "https://infinitech-api5.site"

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken")
    if (!authToken) return router.push("/login")

    axios
      .get(`${API_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        setUser(res.data.user)
        setUsername(res.data.user.username)
        setEmail(res.data.user.email)
        setImagePreview(
          res.data.user.profile_image
            ? `${API_BASE_URL}/${res.data.user.profile_image}`
            : "/default-avatar.png",
        )
        setLoading(false)
      })
      .catch(() => router.push("/login"))

    axios
      .get(`${API_BASE_URL}/api/activities/${authToken}`)
      .then((res) => Array.isArray(res.data) && setActivities(res.data))
      .catch((err) => console.error("Error fetching activities", err))
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    const authToken = sessionStorage.getItem("authToken")
    const formData = new FormData()
    formData.append("username", username)
    formData.append("email", email)
    if (profileImage) formData.append("profile_image", profileImage)

    try {
      await axios.post(`${API_BASE_URL}/api/update-profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      })
      toast.success("Profile updated successfully!")
      setEditing(false)
      setShowModal(false)
    } catch (err) {
      toast.error("Update failed!")
    }
  }

  const pendingCount = activities.filter((a) => a.status === "pending" && !a.archive).length
  const completeCount = activities.filter((a) => a.status === "complete" && !a.archive).length
  const overdueCount = activities.filter((a) => a.status === "overdue" && !a.archive).length
  const archiveCount = activities.filter((a) => a.archive).length
  const totalTasks = pendingCount + completeCount + overdueCount
  const completionPercentage = totalTasks ? (completeCount / totalTasks) * 100 : 0

  const groupedData = activities.reduce(
    (acc, activity) => {
      if (!activity.date_started) return acc
      if (!acc[activity.date_started]) {
        acc[activity.date_started] = {
          date: activity.date_started,
          pending: 0,
          complete: 0,
          overdue: 0,
        }
      }
      acc[activity.date_started][activity.status] += 1
      return acc
    },
    {} as Record<string, { date: string; pending: number; complete: number; overdue: number }>,
  )

  const chartData = Object.values(groupedData)

  return (
    <div className="flex min-h-auto bg-gray-900 text-white">
      
      <Sidebar />
      <ToastContainer />
      
     
      <div className="sticky top-0 h-screen w-64 bg-blue-100 shadow-lg hidden md:block"></div>
      <div className="flex-grow h-auto">
  
          <div className="w-full text-center">
          <br />
          <br />
          <br />
            <h1 className="text-4xl h-auto font-extrabold bg-gradient-to-r from-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
              Admin Task Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-2">Manage your daily tasks and track progress</p>
          </div>

        {/* TikTok-style Profile Header */}
        <div className=" relative">
          {/* Cover Photo/Background */}
          <br />
          <br />
          <div className="h-auto bg-gray-900"></div>
          <br />
          <br />

          {/* Profile Section */}
          <div className="px-4 relative -mt-16 pb-4 border-b border-blue-900">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
           {/* Profile Image */}
<div className="flex justify-center">
  <div className="flex flex-col sm:flex-row items-center">
    <div className="relative mx-auto sm:mx-0">
      <img
        src={imagePreview || "/default-avatar.png"}
        alt="Profile"
        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-black object-cover"
        onError={(e) => {
          e.currentTarget.src = "/default-avatar.png";
        }}
      />
      <button
        onClick={() => setShowModal(true)}
        className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full"
      >
        <Edit size={18} />
      </button>
    </div>

    {/* User Info */}
    <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
      <h2 className="text-xl font-bold">@{username}</h2>
      <p className="text-gray-400 text-sm">{email}</p>
    </div>
  </div>
</div>

                {/* Stats */}
                <div className="flex justify-around mt-6 text-center">
                  <div>
                    <div className="font-bold">{totalTasks}</div>
                    <div className="text-gray-400 text-xs">Tasks</div>
                  </div>
                  <div>
                    <div className="font-bold">{completeCount}</div>
                    <div className="text-gray-400 text-xs">Completed</div>
                  </div>
                  <div>
                    <div className="font-bold">{pendingCount}</div>
                    <div className="text-gray-400 text-xs">Pending</div>
                  </div>
                  <div>
                    <div className="font-bold">{overdueCount}</div>
                    <div className="text-gray-400 text-xs">Overdue</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === "tasks" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
              }`}
            >
              <Grid size={18} className="inline mr-1" />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === "stats" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
              }`}
            >
              <Bookmark size={18} className="inline mr-1" />
              Stats
            </button>
          
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {activeTab === "tasks" && (
            <div className="space-y-4">
             

              {/* Task Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pending Tasks */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center mb-3">
                    <Clock size={18} className="text-yellow-500 mr-2" />
                    <span className="font-medium">Pending Tasks</span>
                    <span className="ml-auto bg-gray-800 text-yellow-500 px-2 py-0.5 rounded-full text-xs">
                      {pendingCount}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Tasks waiting to be completed</p>
                  <div className="flex mt-3 space-x-2"></div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center mb-3">
                    <CheckCircle size={18} className="text-green-500 mr-2" />
                    <span className="font-medium">Completed Tasks</span>
                    <span className="ml-auto bg-gray-800 text-green-500 px-2 py-0.5 rounded-full text-xs">
                      {completeCount}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Tasks you've successfully completed</p>
                  <div className="flex mt-3"></div>
                </div>

                {/* Overdue Tasks */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center mb-3">
                    <AlertTriangle size={18} className="text-red-500 mr-2" />
                    <span className="font-medium">Overdue Tasks</span>
                    <span className="ml-auto bg-gray-800 text-red-500 px-2 py-0.5 rounded-full text-xs">
                      {overdueCount}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Tasks that need immediate attention</p>
                  <div className="flex mt-3"></div>
                </div>

                {/* Archived Tasks */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center mb-3">
                    <Archive size={18} className="text-gray-400 mr-2" />
                    <span className="font-medium">Archived Tasks</span>
                    <span className="ml-auto bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-xs">
                      {archiveCount}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Tasks you've archived for later</p>
                  <div className="flex mt-3"></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="text-lg font-medium mb-4">Activity Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "white",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="complete"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#FBBF24"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="overdue"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "archived" && (
            <div className="text-center py-12">
              <Archive size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium">No Archived Tasks</h3>
              <p className="text-gray-400 text-sm mt-2">When you archive tasks, they'll appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-[90%] max-w-md border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={imagePreview || "/default-avatar.png"}
                  alt="Preview"
                  className="w-36 h-36 rounded-full object-cover border-2 border-gray-700"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png"
                  }}
                />
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                  <Edit size={16} />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
              >
                <Save size={16} className="mr-2" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default authUser(TodoPage)
