import { SearchX } from "lucide-react";

export default function NoMatchingRooms() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <SearchX className="w-6 h-6 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">No rooms match your filters</p>
      <p className="text-xs text-slate-500 max-w-xs">
        Try fewer attendees or remove an equipment requirement to see available rooms.
      </p>
    </div>
  );
}
