import { CheckCircle2, XCircle } from "lucide-react";
import type { AvailabilityResult } from "@/lib/availability";

interface ResultBannerProps {
  result: AvailabilityResult | null;
}

export default function ResultBanner({ result }: ResultBannerProps) {
  if (!result) return null;

  const isAvailable = result.available;
  const Icon = isAvailable ? CheckCircle2 : XCircle;
  const config = isAvailable
    ? { border: "border-green-400", bg: "bg-green-50", icon: "text-green-600", badgeBg: "bg-green-500", reason: "text-green-800" }
    : { border: "border-red-400", bg: "bg-red-50", icon: "text-red-600", badgeBg: "bg-red-500", reason: "text-red-800" };

  return (
    <div className={`rounded-xl border-2 ${config.border} ${config.bg} p-4 animate-in fade-in duration-300`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center rounded-md ${config.badgeBg} px-3 py-1 text-sm font-bold uppercase tracking-wider text-white`}>
          {isAvailable ? "Available" : "Unavailable"}
        </span>
        <Icon className={`w-5 h-5 ${config.icon}`} />
      </div>
      <p className={`text-sm ${config.reason}`}>{result.reason}</p>
    </div>
  );
}
