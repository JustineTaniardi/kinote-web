"use client";

import React, { useEffect, useState } from "react";
import { StreakEntry } from "./StreakTypes";

interface Props {
  entry: StreakEntry;
  onOpen: (entry: StreakEntry) => void;
  onStart?: (entry: StreakEntry) => void;
}

function formatMinutes(mins: number) {
  if (!mins) return "0 min";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs} hr` : `${hrs} hr ${rem} min`;
}

function extractDaysText(days?: string[]): string {
  if (!days || days.length === 0) return "";
  return days.join(", ");
}

export default function ActivityItem({ entry, onOpen, onStart }: Props) {
  const [streakCount, setStreakCount] = useState(0);

  // Fetch streak count from API
  useEffect(() => {
    const fetchStreakCount = async () => {
      try {
        const response = await fetch(`/api/streaks/${entry.id}`);
        if (response.ok) {
          const streak = await response.json();
          // Count the histories for this streak
          if (streak.histories) {
            setStreakCount(streak.histories.length);
          }
        }
      } catch (error) {
        console.error("Error fetching streak count:", error);
        setStreakCount(0);
      }
    };

    if (entry.id) {
      fetchStreakCount();
    }
  }, [entry.id]);
  return (
    <div
      onClick={() => onOpen(entry)}
      className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm p-3 aspect-square cursor-pointer transition-shadow hover:shadow-md"
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {/* Title */}
      <div className="font-bold text-gray-900 text-sm mb-1 truncate">
        {entry.title}
      </div>

      {/* SubCategory : Days */}
      <div
        className="text-xs text-gray-600 mb-2"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {entry.category}
        {entry.subcategory ? ` : ${entry.subcategory}` : ""}
        {extractDaysText(entry.days) && ` • ${extractDaysText(entry.days)}`}
      </div>

      {/* Description - NO wrap, NO stretch */}
      <div
        className="text-xs text-gray-500 mb-2 flex-1"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {entry.description || "No description"}
      </div>

      {/* Separator line */}
      <div className="border-t border-gray-200 my-1.5"></div>

      {/* Three columns: Duration, Break, Streak */}
      <div className="grid grid-cols-3 gap-1 flex-1 mb-2">
        <div className="flex flex-col justify-center items-center text-center min-w-0">
          <span className="text-xs text-gray-500 truncate">Duration</span>
          <span className="text-xs font-semibold text-gray-900 truncate">
            {formatMinutes(entry.totalMinutes)}
          </span>
        </div>
        <div className="flex flex-col justify-center items-center text-center min-w-0">
          <span className="text-xs text-gray-500 truncate">Break</span>
          <span className="text-xs font-semibold text-gray-900 truncate">
            {entry.breakTime || "-"}
          </span>
        </div>
        <div className="flex flex-col justify-center items-center text-center min-w-0">
          <span className="text-xs text-gray-500 truncate">Streak</span>
          <span className="text-xs font-semibold text-gray-900 truncate">
            {streakCount}
          </span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart && onStart(entry);
        }}
        className="px-2 py-1 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800 transition w-full"
      >
        Start
      </button>
    </div>
  );
}
