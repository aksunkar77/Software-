import type { AvailabilityResult } from "@/lib/availability";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReasonCode =
  | "available"
  | "invalid_input"
  | "out_of_range"
  | "start_after_end"
  | "past_start"
  | "blocked"
  | "duration_exceeded"
  | "overlap";

export interface ExplanationInput {
  roomName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export type MockMode = "normal" | "timeout" | "api_error" | "no_api_key";

export type FallbackReason = "invalid_input" | "no_api_key" | "timeout" | "api_error";

export interface ExplanationResult {
  text: string;
  ok: boolean;
  fallbackReason?: FallbackReason;
}

export interface MockConfig {
  mode?: MockMode;
  delayMs?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_API_KEY = "mock-key-smart-campus-2026";

const MAX_ROOM_NAME_LENGTH = 100;
const MAX_TIME_LENGTH = 5;
const DEFAULT_DELAY_MS = 500;

const VALID_REASON_CODES: ReadonlyArray<ReasonCode> = [
  "available",
  "invalid_input",
  "out_of_range",
  "start_after_end",
  "past_start",
  "blocked",
  "duration_exceeded",
  "overlap",
];

// ---------------------------------------------------------------------------
// System prompt variations (Task 04)
// ---------------------------------------------------------------------------

const PROMPT_A = `You are a helpful campus assistant. A student wants to know if a room is available. Explain the result using only the facts provided: room name, requested time, availability status, and the reason. Do not invent any booking details or times. Do not change the availability decision. Keep your explanation to at most two sentences in simple, friendly language.`;

const PROMPT_B = `Hey! You're a friendly campus guide. A student asked about room availability. Using only what you're told — the room, the time slot, whether it's available, and why — give them a quick, warm explanation. Don't make up any bookings or times. Don't override the availability. Two sentences max, keep it easy to understand!`;

const PROMPT_C = `Explain room availability to a student. Follow these rules exactly:
1. Use only the supplied facts (room name, time slot, availability, reason).
2. Never invent booking information or times.
3. Never override the availability status.
4. Maximum two sentences.
5. Use simple, friendly language.`;

export interface PromptVariation {
  id: "A" | "B" | "C";
  label: string;
  text: string;
}

export const PROMPT_VARIATIONS: ReadonlyArray<PromptVariation> = [
  { id: "A", label: "Role-based prose", text: PROMPT_A },
  { id: "B", label: "Conversational warm", text: PROMPT_B },
  { id: "C", label: "Constraint list", text: PROMPT_C },
];

export const SELECTED_PROMPT = PROMPT_C;

// ---------------------------------------------------------------------------
// Derive reasonCode from the deterministic AvailabilityResult
// ---------------------------------------------------------------------------

export function deriveReasonCode(result: AvailabilityResult): ReasonCode {
  if (result.available) return "available";
  const r = result.reason.toLowerCase();
  if (r.includes("blocked")) return "blocked";
  if (r.includes("exceeds") || r.includes("120-minute")) return "duration_exceeded";
  if (r.includes("overlap")) return "overlap";
  if (r.includes("after the current time") || r.includes("after current time")) return "past_start";
  if (r.includes("before end time") || r.includes("start time must be before")) return "start_after_end";
  if (r.includes("between 00:00") || r.includes("24:00")) return "out_of_range";
  return "invalid_input";
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

function isValidHHMM(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_TIME_LENGTH) {
    return false;
  }
  if (value === "24:00") return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validateInput(input: unknown): string | null {
  if (!input || typeof input !== "object") {
    return "Invalid request: no input data provided.";
  }
  const i = input as Partial<ExplanationInput>;

  if (!i.roomName || typeof i.roomName !== "string" || i.roomName.trim().length === 0) {
    return "Invalid request: room name is required.";
  }
  if (i.roomName.length > MAX_ROOM_NAME_LENGTH) {
    return "Invalid request: room name is too long.";
  }
  if (!isValidHHMM(i.startTime)) {
    return "Invalid request: start time must be in HH:MM format.";
  }
  if (!isValidHHMM(i.endTime)) {
    return "Invalid request: end time must be in HH:MM format.";
  }
  if (typeof i.isAvailable !== "boolean") {
    return "Invalid request: availability status must be a boolean.";
  }
  if (!i.reasonCode || !VALID_REASON_CODES.includes(i.reasonCode)) {
    return "Invalid request: unknown reason code.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mock explanation generation (simulated LLM output)
// ---------------------------------------------------------------------------

function generateExplanation(input: ExplanationInput): string {
  const { roomName, startTime, endTime, isAvailable, reasonCode } = input;

  if (isAvailable || reasonCode === "available") {
    return `Good news! ${roomName} is free from ${startTime} to ${endTime}, so you can go ahead and use it for your session.`;
  }

  switch (reasonCode) {
    case "blocked":
      return `${roomName} is currently blocked and can't be booked. Try a different room or check back later.`;
    case "overlap":
      return `${roomName} already has a booking that overlaps with ${startTime}\u2013${endTime}. Choose a different time slot that doesn't conflict.`;
    case "duration_exceeded":
      return `Your requested booking is longer than the 120-minute maximum. Shorten it to two hours or less and try again.`;
    case "past_start":
      return `The start time needs to be after the current time. Pick a later start and check again.`;
    case "start_after_end":
      return `The start time has to be before the end time. Fix the order and try again.`;
    case "out_of_range":
      return `Times must be between 00:00 and 24:00. Adjust your slot to stay within the day and try again.`;
    case "invalid_input":
    default:
      return `Some of the time input was missing or invalid. Enter proper start and end times and try again.`;
  }
}

// ---------------------------------------------------------------------------
// Mock LLM adapter
// ---------------------------------------------------------------------------

export async function explainAvailability(
  input: unknown,
  config: MockConfig = {}
): Promise<ExplanationResult> {
  const mode: MockMode = config.mode ?? "normal";
  const delay = config.delayMs ?? DEFAULT_DELAY_MS;

  // 1. Validate inputs first — reject empty, malformed, or overly long values
  const validationError = validateInput(input);
  if (validationError) {
    return { text: validationError, ok: false, fallbackReason: "invalid_input" };
  }

  const validInput = input as ExplanationInput;

  // 2. Simulate unavailable API key
  if (mode === "no_api_key" || !MOCK_API_KEY) {
    return {
      text: "AI explanation is unavailable because no API key is configured. The availability result above is still valid.",
      ok: false,
      fallbackReason: "no_api_key",
    };
  }

  // 3. Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 4. Simulate timeout
  if (mode === "timeout") {
    return {
      text: "The AI explanation service took too long to respond. The availability result above is still valid.",
      ok: false,
      fallbackReason: "timeout",
    };
  }

  // 5. Simulate API error
  if (mode === "api_error") {
    return {
      text: "The AI explanation service encountered an error. The availability result above is still valid.",
      ok: false,
      fallbackReason: "api_error",
    };
  }

  // 6. Normal: generate the explanation using the selected prompt
  return { text: generateExplanation(validInput), ok: true };
}
