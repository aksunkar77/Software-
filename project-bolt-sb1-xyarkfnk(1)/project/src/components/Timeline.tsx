import { DAY_MINUTES, minutesToHHMM } from "@/lib/time";
import type { Booking } from "@/data/rooms";

interface TimelineProps {
  bookings: Booking[];
  requestedStart: number | null;
  requestedEnd: number | null;
  currentTime: number;
}

export default function Timeline({ bookings, requestedStart, requestedEnd, currentTime }: TimelineProps) {
  const hours = Array.from({ length: 25 }, (_, i) => i * 60);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">00:00</span>
        <span className="text-xs font-medium text-slate-500">12:00</span>
        <span className="text-xs font-medium text-slate-500">24:00</span>
      </div>

      <div className="relative h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
        {/* Hour gridlines */}
        {hours.map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${(m / DAY_MINUTES) * 100}%` }}
          />
        ))}

        {/* Current time marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20"
          style={{ left: `${(currentTime / DAY_MINUTES) * 100}%` }}
          title={`Current time: ${minutesToHHMM(currentTime)}`}
        >
          <div className="absolute -top-0.5 -left-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
        </div>

        {/* Existing bookings */}
        {bookings.map((booking, i) => {
          const left = (booking.start / DAY_MINUTES) * 100;
          const width = ((booking.end - booking.start) / DAY_MINUTES) * 100;
          return (
            <div
              key={i}
              className="absolute top-2 bottom-2 rounded-md bg-sky-500/80 flex items-center justify-center overflow-hidden z-10"
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${booking.label}: ${minutesToHHMM(booking.start)}–${minutesToHHMM(booking.end)}`}
            >
              {width > 8 && (
                <span className="text-[10px] font-medium text-white px-1 truncate">
                  {booking.label}
                </span>
              )}
            </div>
          );
        })}

        {/* Requested interval */}
        {requestedStart !== null && requestedEnd !== null && requestedStart < requestedEnd && (
          <div
            className="absolute top-7 bottom-2 rounded-md border-2 border-dashed z-15 flex items-center justify-center overflow-hidden"
            style={{
              left: `${(requestedStart / DAY_MINUTES) * 100}%`,
              width: `${((requestedEnd - requestedStart) / DAY_MINUTES) * 100}%`,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
            }}
            title={`Requested: ${minutesToHHMM(requestedStart)}–${minutesToHHMM(requestedEnd)}`}
          >
            {((requestedEnd - requestedStart) / DAY_MINUTES) * 100 > 6 && (
              <span className="text-[10px] font-medium text-indigo-600 px-1 truncate">
                Requested
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded bg-sky-500/80" /> Existing bookings
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded border-2 border-dashed border-indigo-500 bg-indigo-500/15" /> Requested slot
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-0.5 h-3 bg-amber-400" /> Current time
        </span>
      </div>
    </div>
  );
}
