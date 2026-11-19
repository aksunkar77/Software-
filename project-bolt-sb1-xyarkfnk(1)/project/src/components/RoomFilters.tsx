import { Users } from "lucide-react";
import { EQUIPMENT_OPTIONS, type Equipment } from "@/data/rooms";
import type { RoomFilter } from "@/lib/room-filter";

interface RoomFiltersProps {
  filter: RoomFilter;
  onChange: (next: RoomFilter) => void;
}

export default function RoomFilters({ filter, onChange }: RoomFiltersProps) {
  const toggleEquipment = (item: Equipment) => {
    const requiredEquipment = filter.requiredEquipment.includes(item)
      ? filter.requiredEquipment.filter((e) => e !== item)
      : [...filter.requiredEquipment, item];
    onChange({ ...filter, requiredEquipment });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="attendee-count" className="text-sm font-medium text-slate-700">
          Number of Attendees
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="attendee-count"
            type="number"
            min={1}
            value={filter.attendees}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onChange({ ...filter, attendees: Number.isNaN(parsed) ? 1 : Math.max(1, parsed) });
            }}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-slate-700 mb-1.5">Required Equipment</legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((item) => {
            const active = filter.requiredEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => toggleEquipment(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:ring-2 focus:ring-sky-200 focus:outline-none ${
                  active
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
