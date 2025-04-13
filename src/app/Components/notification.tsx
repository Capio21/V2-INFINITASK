"use client";

import { useState } from "react";
import { FaBell } from "react-icons/fa";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function TaskDrawer() {
  const [open, setOpen] = useState(false);
  
  // Example task list (you can replace this with dynamic data)
  const tasks = [
    { id: 1, title: "Task 1", status: "Pending" },
    { id: 2, title: "Task 2", status: "Completed" },
    { id: 3, title: "Task 3", status: "Overdue" },
  ];

  // Count the number of tasks
  const taskCount = tasks.length;

  return (
    <>
      {/* Button to Open Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" onClick={() => setOpen(true)}>
            <FaBell className="text-xl" />
            <span className="ml-2">My Tasks</span>
            {taskCount > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">
                {taskCount}
              </span>
            )}
          </Button>
        </DrawerTrigger>

        {/* Drawer Content */}
        <DrawerContent className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">My Tasks</h2>
            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
          </div>

          {/* Task List */}
          <ul className="mt-4 space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="p-3 bg-gray-100 rounded-md">
                {task.status === "Completed" ? "✅" : task.status === "Overdue" ? "🚨" : "📌"} {task.title} - {task.status}
              </li>
            ))}
          </ul>
        </DrawerContent>
      </Drawer>
    </>
  );
}