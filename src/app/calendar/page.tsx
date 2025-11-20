"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarGrid from "../components/calendar/CalendarGrid";
import { TaskItem, ViewMode } from "../components/calendar/types";
import { useAuth } from "@/lib/hooks/useAuth";

export default function CalendarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      
      // Get month from weekStart
      const year = weekStart.getFullYear();
      const month = String(weekStart.getMonth() + 1).padStart(2, "0");
      const monthParam = `${year}-${month}`;
      
      const response = await fetch(`/api/calendar?month=${monthParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Convert backend tasks to TaskItem format
        const formattedTasks: TaskItem[] = (data || []).map((task: any) => ({
          id: task.id.toString(),
          title: task.title,
          startTime: task.deadline || new Date().toISOString(),
          endTime: task.deadline || new Date().toISOString(),
          difficulty: task.difficulty?.name?.toLowerCase() || "medium",
          description: task.description,
          status: task.status?.name,
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, weekStart]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTasks();
    }
  }, [user, authLoading, fetchTasks]);

  const handleAddActivity = async (data: {
    name: string;
    startTime: string;
    endTime: string;
    date: string;
    difficulty: "easy" | "medium" | "hard";
  }) => {
    setIsLoading(true);
    try {
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);

      const startDateTime = new Date(data.date);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(data.date);
      endDateTime.setHours(endHour, endMin, 0, 0);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.name,
          deadline: startDateTime.toISOString(),
          description: `${data.startTime} to ${data.endTime}`,
          difficultyId: data.difficulty === "easy" ? 1 : data.difficulty === "medium" ? 2 : 3,
          statusId: 1,
        }),
      });

      if (response.ok) {
        // Refetch all tasks from database to ensure consistency
        await fetchTasks();
      } else {
        console.error("Failed to create task:", response.statusText);
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFB]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Header with Controls */}
          <CalendarHeader
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddActivity={handleAddActivity}
            isLoading={isLoading}
          />

          {/* Calendar Grid */}
          <CalendarGrid
            weekStart={weekStart}
            events={tasks}
            viewMode={viewMode}
          />
        </div>
      </main>
    </div>
  );
}
