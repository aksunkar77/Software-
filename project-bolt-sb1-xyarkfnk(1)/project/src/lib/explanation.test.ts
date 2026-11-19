import { describe, it, expect } from "vitest";
import {
  explainAvailability,
  deriveReasonCode,
  type ExplanationInput,
  type ReasonCode,
} from "@/lib/explanation";
import type { AvailabilityResult } from "@/lib/availability";

function validInput(overrides: Partial<ExplanationInput> = {}): ExplanationInput {
  return {
    roomName: "Engineering Hall 101",
    startTime: "11:00",
    endTime: "12:00",
    isAvailable: true,
    reasonCode: "available",
    ...overrides,
  };
}

describe("explainAvailability — normal mode", () => {
  it("returns a student-friendly explanation for available rooms", async () => {
    const res = await explainAvailability(validInput(), { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(true);
    expect(res.text).toContain("Engineering Hall 101");
    expect(res.text).toContain("11:00");
    expect(res.text).toContain("12:00");
  });

  it("returns at most two sentences", async () => {
    const res = await explainAvailability(validInput(), { mode: "normal", delayMs: 0 });
    const sentences = res.text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    expect(sentences.length).toBeLessThanOrEqual(2);
  });

  it("explains blocked rooms", async () => {
    const res = await explainAvailability(
      validInput({ isAvailable: false, reasonCode: "blocked" }),
      { mode: "normal", delayMs: 0 }
    );
    expect(res.ok).toBe(true);
    expect(res.text.toLowerCase()).toContain("blocked");
  });

  it("explains overlap", async () => {
    const res = await explainAvailability(
      validInput({ isAvailable: false, reasonCode: "overlap" }),
      { mode: "normal", delayMs: 0 }
    );
    expect(res.ok).toBe(true);
    expect(res.text.toLowerCase()).toContain("overlap");
  });

  it("explains duration exceeded", async () => {
    const res = await explainAvailability(
      validInput({ isAvailable: false, reasonCode: "duration_exceeded" }),
      { mode: "normal", delayMs: 0 }
    );
    expect(res.ok).toBe(true);
    expect(res.text).toContain("120");
  });

  it("never overrides availability in the explanation", async () => {
    const res = await explainAvailability(
      validInput({ isAvailable: false, reasonCode: "overlap" }),
      { mode: "normal", delayMs: 0 }
    );
    expect(res.text.toLowerCase()).not.toContain("is free");
    expect(res.text.toLowerCase()).not.toContain("available");
  });
});

describe("explainAvailability — input validation", () => {
  it("rejects null input", async () => {
    const res = await explainAvailability(null, { delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("rejects empty room name", async () => {
    const res = await explainAvailability(validInput({ roomName: "  " }), { delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("rejects overly long room name", async () => {
    const res = await explainAvailability(
      validInput({ roomName: "x".repeat(101) }),
      { delayMs: 0 }
    );
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("rejects malformed start time", async () => {
    const res = await explainAvailability(validInput({ startTime: "99:99" }), { delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("rejects malformed end time", async () => {
    const res = await explainAvailability(validInput({ endTime: "abc" }), { delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("rejects non-boolean isAvailable", async () => {
    const res = await explainAvailability(
      validInput({ isAvailable: "yes" as unknown as boolean }),
      { delayMs: 0 }
    );
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("rejects unknown reason code", async () => {
    const res = await explainAvailability(
      validInput({ reasonCode: "unknown" as unknown as ReasonCode }),
      { delayMs: 0 }
    );
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
  });

  it("accepts 24:00 as a valid end time", async () => {
    const res = await explainAvailability(
      validInput({ endTime: "24:00" }),
      { delayMs: 0 }
    );
    expect(res.ok).toBe(true);
  });
});

describe("explainAvailability — fallback behavior", () => {
  it("returns timeout fallback", async () => {
    const res = await explainAvailability(validInput(), { mode: "timeout", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("timeout");
    expect(res.text).toContain("availability result above is still valid");
  });

  it("returns api_error fallback", async () => {
    const res = await explainAvailability(validInput(), { mode: "api_error", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("api_error");
    expect(res.text).toContain("availability result above is still valid");
  });

  it("returns no_api_key fallback", async () => {
    const res = await explainAvailability(validInput(), { mode: "no_api_key", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("no_api_key");
    expect(res.text).toContain("availability result above is still valid");
  });
});

describe("deriveReasonCode", () => {
  const cases: Array<{ result: AvailabilityResult; expected: ReasonCode }> = [
    { result: { available: true, reason: "Engineering Hall 101 is available for this time slot." }, expected: "available" },
    { result: { available: false, reason: "Auditorium A is currently blocked and unavailable for booking." }, expected: "blocked" },
    { result: { available: false, reason: "Booking duration is 150 minutes, which exceeds the 120-minute maximum." }, expected: "duration_exceeded" },
    { result: { available: false, reason: 'Overlaps with "Faculty Meeting" (10:00–11:00).' }, expected: "overlap" },
    { result: { available: false, reason: "Start time must be after the current time (9:00)." }, expected: "past_start" },
    { result: { available: false, reason: "Start time must be before end time." }, expected: "start_after_end" },
    { result: { available: false, reason: "Times must be between 00:00 and 24:00." }, expected: "out_of_range" },
    { result: { available: false, reason: "Please enter valid start and end times." }, expected: "invalid_input" },
  ];

  for (const { result, expected } of cases) {
    it(`maps "${result.reason.slice(0, 40)}…" to ${expected}`, () => {
      expect(deriveReasonCode(result)).toBe(expected);
    });
  }
});
