import { Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import type { ExplanationResult } from "@/lib/explanation";

interface ExplanationPanelProps {
  result: ExplanationResult | null;
  loading: boolean;
}

export default function ExplanationPanel({ result, loading }: ExplanationPanelProps) {
  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
          <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
            AI-generated explanation
          </span>
        </div>
        <p className="text-sm text-slate-500">Generating explanation…</p>
      </div>
    );
  }

  if (!result) return null;

  const isFallback = !result.ok;

  return (
    <div
      className={`mt-3 rounded-xl border p-4 ${
        isFallback ? "border-amber-200 bg-amber-50" : "border-sky-200 bg-sky-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isFallback ? (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        ) : (
          <Sparkles className="w-4 h-4 text-sky-600" />
        )}
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isFallback ? "text-amber-700" : "text-sky-700"
          }`}
        >
          AI-generated explanation{isFallback ? " (fallback)" : ""}
        </span>
      </div>
      <p className={`text-sm ${isFallback ? "text-amber-800" : "text-slate-700"}`}>
        {result.text}
      </p>
    </div>
  );
}
