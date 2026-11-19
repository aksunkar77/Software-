import type { Room, Booking } from "@/data/rooms";
import { DAY_MINUTES } from "@/lib/time";

export interface AvailabilityResult {
  available: boolean;
  reason: string;
}

export const MAX_DURATION = 120;

function intervalsOverlap(start: number, end: number, booking: Booking): boolean {
  return start < booking.end && end > booking.start;
}

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number
): AvailabilityResult {
  // AC1: Accept only when 0 <= start < end <= 1440 and start > currentTime
  if (isNaN(start) || isNaN(end)) {
    return { available: false, reason: "Please enter valid start and end times." };
  }
  if (start < 0 || end > DAY_MINUTES) {
    return { available: false, reason: "Times must be between 00:00 and 24:00." };
  }
  if (start >= end) {
    return { available: false, reason: "Start time must be before end time." };
  }
  if (start <= currentTime) {
    return {
      available: false,
      reason: `Start time must be after the current time (${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, "0")}).`,
    };
  }

  // AC3: Reject when the selected room is blocked
  if (room.blocked) {
    return {
      available: false,
      reason: `${room.name} is currently blocked and unavailable for booking.`,
    };
  }

  // AC2: Reject bookings longer than 120 minutes
  const duration = end - start;
  if (duration > MAX_DURATION) {
    return {
      available: false,
      reason: `Booking duration is ${duration} minutes, which exceeds the 120-minute maximum.`,
    };
  }

  // AC4: Reject intervals that overlap existing bookings (touching allowed)
  for (const booking of room.bookings) {
    if (intervalsOverlap(start, end, booking)) {
      return {
        available: false,
        reason: `Overlaps with "${booking.label}" (${Math.floor(booking.start / 60)}:${String(booking.start % 60).padStart(2, "0")}–${Math.floor(booking.end / 60)}:${String(booking.end % 60).padStart(2, "0")}).`,
      };
    }
  }

  // AC5: All checks pass - available (no booking data was modified)
  return {
    available: true,
    reason: `${room.name} is available for this time slot.`,
  };
}

export interface SlotMessages {
  startError?: string;
  endError?: string;
  startHint?: string;
  endHint?: string;
}

export function getSlotMessages(start: number, end: number, currentTime: number): SlotMessages {
  const validSlot = start < end;
  const duration = end - start;

  let startError: string | undefined;
  if (start <= currentTime) {
    startError = "Start must be after current time";
  } else if (!validSlot) {
    startError = "Start must be before end time";
  } else if (start < 0) {
    startError = "Start must be >= 00:00";
  }

  let endError: string | undefined;
  if (!validSlot) {
    endError = "End must be after start time";
  } else if (end > DAY_MINUTES) {
    endError = "End must be <= 24:00";
  } else if (duration > MAX_DURATION) {
    endError = "Exceeds 120 min max booking";
  }

  return {
    startError,
    endError,
    startHint: start <= currentTime ? "Must be after current time" : undefined,
    endHint: !validSlot
      ? "Must be after start time"
      : duration > MAX_DURATION
        ? "Exceeds 120 min limit"
        : undefined,
  };
}
