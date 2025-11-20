export default function TimeColumn() {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="w-20 flex-shrink-0 bg-white border-r border-gray-200">
      {/* Hours */}
      <div className="divide-y divide-gray-200">
        {hours.map((hour) => {
          const ampm = hour < 12 ? "AM" : "PM";
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return (
            <div
              key={hour}
              className="h-16 flex items-start justify-center pt-1 px-1"
            >
              <span className="text-xs text-gray-500 font-medium">
                {displayHour} {ampm}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
