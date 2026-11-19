import { useState, useMemo, useCallback, useRef, type ReactNode } from "react";
import { Building2, Search, Sparkles } from "lucide-react";
import { rooms, CURRENT_TIME_DEFAULT, type Room } from "@/data/rooms";
import { checkAvailability, getSlotMessages, MAX_DURATION, type AvailabilityResult } from "@/lib/availability";
import { filterRooms, type RoomFilter } from "@/lib/room-filter";
import { minutesToHHMM, formatDuration } from "@/lib/time";
import { explainAvailability, deriveReasonCode, type ExplanationResult } from "@/lib/explanation";
import TimePicker from "@/components/TimePicker";
import RoomSelector from "@/components/RoomSelector";
import RoomFilters from "@/components/RoomFilters";
import NoMatchingRooms from "@/components/NoMatchingRooms";
import ResultBanner from "@/components/ResultBanner";
import Timeline from "@/components/Timeline";
import BookingList from "@/components/BookingList";
import ExplanationPanel from "@/components/ExplanationPanel";

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-7">
      <h2 className="text-sm font-semibold text-slate-800 mb-1">{title}</h2>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [roomFilter, setRoomFilter] = useState<RoomFilter>({ attendees: 1, requiredEquipment: [] });
  const [startTime, setStartTime] = useState(600);
  const [endTime, setEndTime] = useState(660);
  const [currentTime, setCurrentTime] = useState(CURRENT_TIME_DEFAULT);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const explanationReqId = useRef(0);

  const matchingRooms = useMemo(() => filterRooms(rooms, roomFilter), [roomFilter]);

  const selectedRoom: Room | null = useMemo(
    () => matchingRooms.find((r) => r.id === selectedRoomId) ?? null,
    [matchingRooms, selectedRoomId]
  );

  const duration = endTime - startTime;
  const validSlot = startTime < endTime;

  const cancelExplanation = () => {
    explanationReqId.current += 1;
    setExplanation(null);
    setExplanationLoading(false);
  };

  const handleCheck = () => {
    if (!selectedRoom) return;
    setResult(checkAvailability(selectedRoom, startTime, endTime, currentTime));
    cancelExplanation();
  };

  const handleExplain = useCallback(async () => {
    if (!selectedRoom || !result) return;
    const reqId = explanationReqId.current + 1;
    explanationReqId.current = reqId;
    setExplanationLoading(true);
    setExplanation(null);
    const code = deriveReasonCode(result);
    const res = await explainAvailability({
      roomName: selectedRoom.name,
      startTime: minutesToHHMM(startTime),
      endTime: minutesToHHMM(endTime),
      isAvailable: result.available,
      reasonCode: code,
    }, { delayMs: 400 });
    if (explanationReqId.current !== reqId) return;
    setExplanation(res);
    setExplanationLoading(false);
  }, [selectedRoom, result, startTime, endTime]);

  const handleRoomChange = (id: string) => {
    setSelectedRoomId(id);
    setResult(null);
    cancelExplanation();
  };

  const handleFilterChange = (next: RoomFilter) => {
    const matches = filterRooms(rooms, next);
    setRoomFilter(next);
    setSelectedRoomId(matches.some((r) => r.id === selectedRoomId) ? selectedRoomId : (matches[0]?.id ?? ""));
    setResult(null);
    cancelExplanation();
  };

  const messages = getSlotMessages(startTime, endTime, currentTime);
  const showFieldErrors = result !== null && !result.available;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-xs font-medium text-sky-700 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Smart Campus
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Room Availability Checker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
            Select a room and time slot to check if it's available. Times are in 24-hour format.
          </p>
        </header>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-7">
          <div className="flex flex-col gap-5">
            <RoomFilters filter={roomFilter} onChange={handleFilterChange} />

            {selectedRoom ? (
              <>
                <RoomSelector rooms={matchingRooms} selectedId={selectedRoom.id} onSelect={handleRoomChange} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TimePicker
                    id="start-time"
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                    helperText={messages.startHint}
                    error={showFieldErrors ? messages.startError : undefined}
                  />
                  <TimePicker
                    id="end-time"
                    label="End Time"
                    value={endTime}
                    onChange={setEndTime}
                    helperText={messages.endHint}
                    error={showFieldErrors ? messages.endError : undefined}
                  />
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <TimePicker
                    id="current-time"
                    label="Current Time (adjustable for testing)"
                    value={currentTime}
                    onChange={setCurrentTime}
                  />
                </div>

                {/* Duration preview */}
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>Duration: <span className={`font-medium ${duration <= 0 || duration > MAX_DURATION ? "text-red-600" : "text-slate-700"}`}>{duration <= 0 ? "Invalid slot" : formatDuration(duration)}</span></span>
                  <span className="text-slate-300">|</span>
                  <span>Slot: <span className="font-medium text-slate-700">{minutesToHHMM(startTime)}–{minutesToHHMM(endTime)}</span></span>
                </div>

                <button
                  onClick={handleCheck}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99] focus:ring-2 focus:ring-sky-300 focus:outline-none"
                >
                  <Search className="w-4 h-4" />
                  Check Availability
                </button>
              </>
            ) : (
              <NoMatchingRooms />
            )}
          </div>

          {result && (
            <div className="mt-5">
              <ResultBanner result={result} />
              <button
                onClick={handleExplain}
                disabled={explanationLoading}
                className="mt-3 flex items-center justify-center gap-2 w-full rounded-xl border-2 border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50 active:scale-[0.99] focus:ring-2 focus:ring-sky-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Explain Availability
              </button>
              <ExplanationPanel result={explanation} loading={explanationLoading} />
            </div>
          )}
        </div>

        {selectedRoom && (
          <>
            <SectionCard
              title="Day Timeline"
              subtitle={`Visual overview of existing bookings and your requested slot for ${selectedRoom.name}.`}
            >
              <Timeline
                bookings={selectedRoom.bookings}
                requestedStart={validSlot ? startTime : null}
                requestedEnd={validSlot ? endTime : null}
                currentTime={currentTime}
              />
            </SectionCard>

            <SectionCard
              title="Existing Bookings"
              subtitle={`Current schedule for ${selectedRoom.name}.`}
            >
              <BookingList bookings={selectedRoom.bookings} />
            </SectionCard>
          </>
        )}

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data for demonstration purposes only.
        </footer>
      </div>
    </div>
  );
}
