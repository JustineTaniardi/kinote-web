"use client";

import TimeColumn from "./TimeColumn";
import DayColumn from "./DayColumn";
import { TaskItem, ViewMode } from "./types";
import { getWeekDays, isCurrentDay, formatDayLabel } from "./utils/date";

interface CalendarGridProps {
  weekStart: Date;
  events: TaskItem[];
  viewMode: ViewMode;
}

export default function CalendarGrid({
  weekStart,
  events,
  viewMode,
}: CalendarGridProps) {
  const weekDays = getWeekDays(weekStart);
  const today = new Date();

  let displayDays: Date[] = [];

  if (viewMode === "week") {
    displayDays = weekDays;
  } else if (viewMode === "today") {
    displayDays = [today];
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col h-[calc(100vh-280px)]">
      {/* Header Row */}
      <div className="flex bg-white">
        {/* Time column header */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200 border-b">
          <div className="h-16 border-b border-gray-200 flex items-center justify-center px-2">
            <span className="text-xs text-gray-400 font-medium">Jam</span>
          </div>
        </div>

        {/* Day column headers */}
        <div className="flex flex-1">
          {displayDays.map((date) => {
            const isToday = isCurrentDay(date);
            return (
              <div key={`header-${date.toISOString()}`} className="flex-1 border-r border-gray-200 last:border-r-0">
                <div
                  className={`h-16 border-b border-gray-200 flex flex-col items-center justify-center font-semibold text-sm ${
                    isToday ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  }`}
                >
                  {formatDayLabel(date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex flex-1 overflow-auto">
        {/* Time column */}
        <TimeColumn />

        {/* Day columns */}
        <div className="flex flex-1">
          {displayDays.map((date) => (
            <DayColumn key={date.toISOString()} date={date} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
}
