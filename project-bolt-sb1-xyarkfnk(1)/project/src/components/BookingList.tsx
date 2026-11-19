import { Calendar } from "lucide-react";
import { minutesToHHMM, formatDuration } from "@/lib/time";
import type { Booking } from "@/data/rooms";

interface BookingListProps {
  bookings: Booking[];
}

export default function BookingList({ bookings }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">No existing bookings for this room.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {bookings.map((booking, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
        >
          <Calendar className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{booking.label}</p>
            <p className="text-xs text-slate-500">
              {minutesToHHMM(booking.start)} – {minutesToHHMM(booking.end)}
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 flex-shrink-0">
            {formatDuration(booking.end - booking.start)}
          </span>
        </li>
      ))}
    </ul>
  );
}
