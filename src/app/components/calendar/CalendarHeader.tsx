"use client";

import { useState, useEffect } from "react";
import { addWeeks, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { ViewMode } from "./types";
import { showError, showSuccess } from "@/lib/toast";

interface CalendarHeaderProps {
  weekStart: Date;
  onWeekChange: (date: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddActivity: (data: {
    name: string;
    startTime: string;
    endTime: string;
    date: string;
    difficulty: "easy" | "medium" | "hard";
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function CalendarHeader({
  weekStart,
  onWeekChange,
  viewMode,
  onViewModeChange,
  onAddActivity,
  isLoading = false,
}: CalendarHeaderProps) {
  const [activityName, setActivityName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [duration, setDuration] = useState("0j 0m");
  const [submitting, setSubmitting] = useState(false);

  // Calculate duration whenever times change
  useEffect(() => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Handle next day
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0 && minutes === 0) {
      setDuration("0j 0m");
    } else if (minutes === 0) {
      setDuration(`${hours}j`);
    } else if (hours === 0) {
      setDuration(`${minutes}m`);
    } else {
      setDuration(`${hours}j ${minutes}m`);
    }
  }, [startTime, endTime]);

  const handlePrevWeek = () => {
    onWeekChange(addWeeks(weekStart, -1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(weekStart, 1));
  };

  const handleToday = () => {
    const today = new Date();
    onWeekChange(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activityName.trim()) {
      showError("Masukkan nama aktivitas");
      return;
    }

    setSubmitting(true);
    try {
      await onAddActivity({
        name: activityName,
        startTime,
        endTime,
        date: selectedDate,
        difficulty,
      });

      // Reset form
      setActivityName("");
      setStartTime("08:00");
      setEndTime("09:00");
      setDifficulty("medium");
      showSuccess("Aktivitas berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding activity:", error);
      showError("Gagal menambahkan aktivitas");
    } finally {
      setSubmitting(false);
    }
  };

  const weekEnd = addWeeks(weekStart, 1);

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-6">
      {/* Form Row */}
      <form onSubmit={handleSubmit} className="px-4 py-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Activity Name */}
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="Nama"
            className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          {/* Time Range with Duration */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
            />
            <span className="text-gray-300">→</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
            />
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap min-w-12">
              {duration}
            </span>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* View Mode Dropdown */}
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
            className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Minggu</option>
            <option value="today">Hari ini</option>
          </select>

          {/* Add Button */}
          <button
            type="submit"
            disabled={submitting || isLoading}
            className="flex-shrink-0 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-md text-sm transition whitespace-nowrap"
          >
            {submitting || isLoading ? "..." : "+ Tambahkan"}
          </button>
        </div>
      </form>

      {/* Navigation */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 rounded-md transition text-gray-600"
            title="Minggu sebelumnya"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-md transition text-gray-600"
            title="Minggu berikutnya"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={handleToday}
            className="ml-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition inline-flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Hari Ini
          </button>
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {format(weekStart, "dd MMM")} - {format(weekEnd, "dd MMM yyyy")}
        </div>
      </div>
    </div>
  );
}
