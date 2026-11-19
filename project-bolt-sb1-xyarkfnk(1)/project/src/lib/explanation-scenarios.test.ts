import { describe, it, expect } from "vitest";
import { explainAvailability, deriveReasonCode, type ExplanationInput } from "@/lib/explanation";
import { checkAvailability } from "@/lib/availability";
import { rooms, type Room, type Booking } from "@/data/rooms";

const NOW = 540;

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

// ---------------------------------------------------------------------------
// TC-01 .. TC-10 — explicit scenario tests for the testing report
// ---------------------------------------------------------------------------

describe("Explanation scenarios (TC-01 .. TC-10)", () => {
  // TC-01: Available room — explanation correctly confirms availability
  it("TC-01: available room explanation confirms availability", async () => {
    const input = validInput({
      roomName: "Engineering Hall 101",
      startTime: "11:00",
      endTime: "12:00",
      isAvailable: true,
      reasonCode: "available",
    });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(true);
    expect(res.text).toContain("Engineering Hall 101");
    expect(res.text).toContain("free");
    expect(res.text).toContain("11:00");
    expect(res.text).toContain("12:00");
  });

  // TC-02: Overlapping booking — explanation correctly explains the conflict
  it("TC-02: overlapping booking explanation mentions the conflict", async () => {
    const input = validInput({
      isAvailable: false,
      reasonCode: "overlap",
      startTime: "10:30",
      endTime: "11:15",
    });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(true);
    expect(res.text.toLowerCase()).toContain("overlap");
    expect(res.text).toContain("10:30");
    expect(res.text).toContain("11:15");
  });

  // TC-03: Blocked room — explanation correctly identifies the blocked status
  it("TC-03: blocked room explanation identifies blocked status", async () => {
    const input = validInput({
      roomName: "Auditorium A",
      isAvailable: false,
      reasonCode: "blocked",
    });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(true);
    expect(res.text).toContain("Auditorium A");
    expect(res.text.toLowerCase()).toContain("blocked");
  });

  // TC-04: Invalid time — invalid requests are rejected
  it("TC-04: invalid time format is rejected", async () => {
    const input = validInput({ startTime: "25:99", endTime: "abc" });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
    expect(res.text).toContain("Invalid request");
  });

  // TC-05: Past time — past start times are rejected
  it("TC-05: past start time explanation guides the student", async () => {
    const input = validInput({
      isAvailable: false,
      reasonCode: "past_start",
      startTime: "08:00",
      endTime: "09:00",
    });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(true);
    expect(res.text.toLowerCase()).toContain("after the current time");
  });

  // TC-06: Empty room name is rejected
  it("TC-06: empty room name is rejected", async () => {
    const input = validInput({ roomName: "" });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
    expect(res.text).toContain("room name is required");
  });

  // TC-07: Overly long input is rejected
  it("TC-07: overly long room name is rejected", async () => {
    const input = validInput({ roomName: "X".repeat(101) });
    const res = await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("invalid_input");
    expect(res.text).toContain("too long");
  });

  // TC-08: Simulated timeout produces a safe fallback
  it("TC-08: simulated timeout produces a safe fallback", async () => {
    const res = await explainAvailability(validInput(), { mode: "timeout", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("timeout");
    expect(res.text).toContain("too long to respond");
    expect(res.text).toContain("availability result above is still valid");
  });

  // TC-09: Simulated API failure produces a safe fallback
  it("TC-09: simulated API error produces a safe fallback", async () => {
    const res = await explainAvailability(validInput(), { mode: "api_error", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("api_error");
    expect(res.text).toContain("encountered an error");
    expect(res.text).toContain("availability result above is still valid");
  });

  // TC-10: Missing API key produces a safe fallback
  it("TC-10: missing API key produces a safe fallback", async () => {
    const res = await explainAvailability(validInput(), { mode: "no_api_key", delayMs: 0 });
    expect(res.ok).toBe(false);
    expect(res.fallbackReason).toBe("no_api_key");
    expect(res.text).toContain("no API key is configured");
    expect(res.text).toContain("availability result above is still valid");
  });
});

// ---------------------------------------------------------------------------
// Integration: AI explanation never changes the deterministic availability
// ---------------------------------------------------------------------------

describe("AI explanation never overrides deterministic availability", () => {
  it("checkAvailability result is identical before and after explainAvailability", async () => {
    const room = rooms[0]; // Engineering Hall 101
    const before = checkAvailability(room, 660, 720, NOW);
    expect(before.available).toBe(true);

    const code = deriveReasonCode(before);
    await explainAvailability(
      {
        roomName: room.name,
        startTime: "11:00",
        endTime: "12:00",
        isAvailable: before.available,
        reasonCode: code,
      },
      { mode: "normal", delayMs: 0 }
    );

    const after = checkAvailability(room, 660, 720, NOW);
    expect(after).toEqual(before);
  });

  it("an unavailable result stays unavailable regardless of explanation", async () => {
    const room = rooms[0];
    const det = checkAvailability(room, 630, 690, NOW);
    expect(det.available).toBe(false);

    const code = deriveReasonCode(det);
    const res = await explainAvailability(
      {
        roomName: room.name,
        startTime: "10:30",
        endTime: "11:30",
        isAvailable: det.available,
        reasonCode: code,
      },
      { mode: "normal", delayMs: 0 }
    );
    expect(res.ok).toBe(true);
    expect(res.text.toLowerCase()).not.toContain("is free");
    expect(res.text.toLowerCase()).not.toMatch(/\bavailable\b/);
  });
});

// ---------------------------------------------------------------------------
// Integration: booking data is not modified by the explanation flow
// ---------------------------------------------------------------------------

describe("Booking data is not modified by the explanation flow", () => {
  it("room bookings array and contents are unchanged after explainAvailability", async () => {
    const room: Room = rooms[2]; // Science Lab 3
    const snapshot: Booking[] = JSON.parse(JSON.stringify(room.bookings));

    const det = checkAvailability(room, 660, 720, NOW);
    const code = deriveReasonCode(det);
    await explainAvailability(
      {
        roomName: room.name,
        startTime: "11:00",
        endTime: "12:00",
        isAvailable: det.available,
        reasonCode: code,
      },
      { mode: "normal", delayMs: 0 }
    );

    expect(JSON.parse(JSON.stringify(room.bookings))).toEqual(snapshot);
  });

  it("explanation adapter does not mutate the input object", async () => {
    const input = validInput();
    const inputSnapshot = JSON.parse(JSON.stringify(input));
    await explainAvailability(input, { mode: "normal", delayMs: 0 });
    expect(JSON.parse(JSON.stringify(input))).toEqual(inputSnapshot);
  });
});

// ---------------------------------------------------------------------------
// Two-sentence constraint for all reason codes
// ---------------------------------------------------------------------------

describe("All reason-code explanations respect the two-sentence limit", () => {
  const reasonCodes: ExplanationInput["reasonCode"][] = [
    "available",
    "blocked",
    "overlap",
    "duration_exceeded",
    "past_start",
    "start_after_end",
    "out_of_range",
    "invalid_input",
  ];

  for (const code of reasonCodes) {
    it(`${code} produces at most two sentences`, async () => {
      const res = await explainAvailability(
        validInput({ isAvailable: code === "available", reasonCode: code }),
        { mode: "normal", delayMs: 0 }
      );
      expect(res.ok).toBe(true);
      const sentences = res.text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      expect(sentences.length).toBeLessThanOrEqual(2);
    });
  }
});
