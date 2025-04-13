"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";

interface User {
  id: number;
  username: string;
}

interface TaskFormData {
  user_id: string; // Keep as string for the select input
  title: string;
  description: string;
  time_started: string;
  time_ended: string;
  deadline: string;
  status: "pending" | "canceled" | "complete" | "overdue";
  tags?: string; // Optional
  time_spent?: string;
  progress?: string;
}

interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  time_started: string;
  time_ended: string;
  time_spent: string;
  progress: string;
  created_at: string;
  updated_at: string;
}

const TaskForm: React.FC<{
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
}> = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://infinitech-api5.site/api/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users.");
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (editingTask) {
      setValue("user_id", editingTask.user_id.toString());
      setValue("title", editingTask.title);
      setValue("description", editingTask.description);
      setValue("time_started", editingTask.time_started);
      setValue("time_ended", editingTask.time_ended);
      setValue("deadline", editingTask.deadline);
      setValue("status", editingTask.status as "pending" | "canceled" | "complete" | "overdue");
      setValue("progress", editingTask.progress);
      setValue("time_spent", editingTask.time_spent);
    }
  }, [editingTask, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const taskData = {
        ...data,
        user_id: parseInt(data.user_id), // Convert user_id to number
      };

      if (editingTask) {
        await axios.put(`https://infinitech-api5.site/api/tasks/${editingTask.id}`, taskData);
        setTasks(tasks.map((task) => (task.id === editingTask.id ? { ...task, ...taskData } : task)));
        setEditingTask(null);
        toast.success("Task updated successfully!");
      } else {
        const response = await axios.post("https://infinitech-api5.site/api/tasks", taskData);
        setTasks([...tasks, response.data]);
        toast.success("Task created successfully!");
      }

      reset();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Error saving task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 bg-blue-900 rounded-2xl shadow-2xl w-auto max-w-9xl mx-auto border border-blue-600"
    >
      <h2 className="text-2xl mb-4 text-center font-extrabold text-white">
        TO-DO LIST MANAGER
      </h2>

      <div className="flex flex-col space-y-4">
        {/* User Selection */}
        <div className="relative">
          <label htmlFor="user_id" className="block text-white text-lg mb-1 font-bold">
            User
          </label>
          <select
            id="user_id"
            {...register("user_id", { required: "User  selection is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.user_id ? 'border-red-500' : ''}`}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} className="font-bold">
                {user.username}
              </option>
            ))}
          </select>
          {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id.message}</p>}
        </div>

        {/* Task Title */}
        <div className="relative">
          <label htmlFor="title" className="block text-white text-lg mb-1 font-bold">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title", { required: "Title is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Target Time */}
        <div className="relative">
          <label htmlFor="time_started" className="block text-white text-lg mb-1 font-bold">
            Target Time
          </label>
          <input
            id="time_started"
            type="datetime-local"
            {...register("time_started", { required: "Target time is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.time_started ? 'border-red-500' : ''}`}
          />
          {errors.time_started && <p className="text-red-500 text-sm">{errors.time_started.message}</p>}
        </div>

        {/* Time Ended */}
        <div className="relative">
          <label htmlFor="time_ended" className="block text-white text-lg mb-1 font-bold">
            Time Ended
          </label>
          <input
            id="time_ended"
            type="datetime-local"
            {...register("time_ended", { required: "Time ended is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.time_ended ? 'border-red-500' : ''}`}
          />
          {errors.time_ended && <p className="text-red-500 text-sm">{errors.time_ended.message}</p>}
        </div>

        {/* Deadline */}
        <div className="relative">
          <label htmlFor="deadline" className="block text-white text-lg mb-1 font-bold">
            Deadline
          </label>
          <input
            id="deadline"
            type="datetime-local"
            {...register("deadline", { required: "Deadline is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.deadline ? 'border-red-500' : ''}`}
          />
          {errors.deadline && <p className="text-red-500 text-sm">{errors.deadline.message}</p>}
        </div>

        {/* Status */}
        <div className="relative">
          <label htmlFor="status" className="block text-white text-lg mb-1 font-bold">
            Status
          </label>
          <select
            id="status"
            {...register("status", { required: "Status selection is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.status ? 'border-red-500' : ''}`}
          >
            <option value="pending">Pending</option>
            <option value="canceled">Canceled</option>
            <option value="complete">Complete</option>
            <option value="overdue">Overdue</option>
          </select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
        </div>

        {/* Tags */}
        <div className="relative">
          <label htmlFor="tags" className="block text-white text-lg mb-1 font-bold">
            Tags
          </label>
          <select
            id="tags"
            {...register("tags")}
            className="text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold"
          >
            <option value="">Select Tag</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Description */}
        <div className="relative mt-4">
          <label htmlFor="description" className="block text-white text-lg mb-1 font-bold">
            Description
          </label>
          <textarea
            id="description"
            {...register("description", { required: "Description is required" })}
            className={`text-blue-900 p-2 w-full bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg font-bold ${errors.description ? 'border-red-500' : ''}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6 justify-between flex-wrap">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 text-lg font-bold"
          disabled={loading}
        >
          {loading ? "Saving..." : editingTask ? "Update Task" : "Submit"}
        </button>

        {editingTask && (
          <button
            type="button"
            onClick={cancelEdit}
            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 text-lg font-bold"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;