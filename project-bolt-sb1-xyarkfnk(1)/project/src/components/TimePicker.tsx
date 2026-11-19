import { Clock } from "lucide-react";
import { DAY_MINUTES, minutesToHHMM, hhmmToMinutes } from "@/lib/time";

interface TimePickerProps {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  id: string;
  helperText?: string;
  error?: string;
}

export default function TimePicker({ label, value, onChange, id, helperText, error }: TimePickerProps) {
  const hhmm = minutesToHHMM(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) return;
    const minutes = hhmmToMinutes(raw);
    onChange(Math.max(0, Math.min(DAY_MINUTES, minutes)));
  };

  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${hasError ? "text-red-400" : "text-slate-400"}`} />
        <input
          id={id}
          type="time"
          value={hhmm}
          onChange={handleChange}
          className={`w-full rounded-lg border-2 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          }`}
        />
      </div>
      {hasError ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
