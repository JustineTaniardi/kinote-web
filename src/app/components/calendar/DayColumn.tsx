import { TaskItem } from "./types";
import EventCard from "./EventCard";
import {
  isSameDayCheck,
  getEventDimensions,
} from "./utils/date";

interface DayColumnProps {
  date: Date;
  events: TaskItem[];
}

export default function DayColumn({ date, events }: DayColumnProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for this day
  const dayEvents = events.filter((event) =>
    isSameDayCheck(new Date(event.startTime), date)
  );

  // Group events by the hour they start in
  const eventsByHour: Record<number, TaskItem[]> = {};
  dayEvents.forEach((event) => {
    const eventStart = new Date(event.startTime);
    const startHour = eventStart.getHours();
    if (!eventsByHour[startHour]) {
      eventsByHour[startHour] = [];
    }
    eventsByHour[startHour].push(event);
  });

  return (
    <div className="flex-1 border-r border-gray-200 last:border-r-0 bg-white flex flex-col">
      {/* Hour rows */}
      <div className="flex-1 divide-y divide-gray-200 relative">
        {hours.map((hour) => (
          <div key={hour} className="h-16 relative flex-shrink-0">
            {/* Render events for this hour */}
            {eventsByHour[hour] &&
              eventsByHour[hour].map((event) => {
                const { top, height } = getEventDimensions(
                  event.startTime,
                  event.endTime,
                  hour
                );
                return (
                  <EventCard
                    key={`${event.id}-${hour}`}
                    event={event}
                    top={top}
                    height={height}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
