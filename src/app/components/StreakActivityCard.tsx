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

export default function StreakActivityCard({ entry, onOpen, onStart }: Props) {
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
      className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm p-4 aspect-square cursor-pointer transition-shadow hover:shadow-md w-full"
    >
      {/* Title */}
      <div className="text-base font-bold text-gray-900 mb-2">
        {entry.title}
      </div>

      {/* Sub Category */}
      <div className="text-sm text-gray-600 mb-3">
        {entry.category}
        {entry.subcategory ? ` : ${entry.subcategory}` : ""}
      </div>

      {/* Description */}
      <div className="text-xs text-gray-500 mb-3 line-clamp-2">
        {entry.description ||
          "Please add your description here. Keep it short and simple :)"}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-2"></div>

      {/* Stats: Duration, Break, Streak - 3 equal boxes */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        <div className="flex flex-col justify-center items-center text-center">
          <span className="text-xs text-gray-500 mb-1">Duration</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatMinutes(entry.totalMinutes)}
          </span>
        </div>
        <div className="flex flex-col justify-center items-center text-center">
          <span className="text-xs text-gray-500 mb-1">Break</span>
          <span className="text-sm font-semibold text-gray-900">
            {entry.breakTime || "-"}
          </span>
        </div>
        <div className="flex flex-col justify-center items-center text-center">
          <span className="text-xs text-gray-500 mb-1">Streak</span>
          <span className="text-sm font-semibold text-gray-900">
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
        className="mt-3 px-3 py-2 bg-[#161D36] text-white rounded-lg text-sm font-semibold hover:bg-[#1a2140] transition w-full"
      >
        Start
      </button>
    </div>
  );
}
