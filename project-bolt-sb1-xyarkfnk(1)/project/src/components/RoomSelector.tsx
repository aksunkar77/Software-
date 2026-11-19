import { MapPin, Lock } from "lucide-react";
import type { Room } from "@/data/rooms";

interface RoomSelectorProps {
  rooms: Room[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedId, onSelect }: RoomSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="room-select" className="text-sm font-medium text-slate-700">
        Select Room
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          id="room-select"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} — {room.building}
              {room.blocked ? " (Blocked)" : ""}
            </option>
          ))}
        </select>
      </div>
      {rooms.find((r) => r.id === selectedId)?.blocked && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 mt-0.5">
          <Lock className="w-3.5 h-3.5" />
          This room is blocked and cannot be booked.
        </div>
      )}
    </div>
  );
}
