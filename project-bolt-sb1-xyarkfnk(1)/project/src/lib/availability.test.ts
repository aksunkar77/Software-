import { describe, it, expect } from "vitest";
import { checkAvailability } from "@/lib/availability";
import type { Room, Booking } from "@/data/rooms";

const NOW = 540;

function makeRoom(
  id: string,
  blocked: boolean,
  bookings: Booking[],
  name = id
): Room {
  return {
    id,
    name,
    building: "Test Building",
    capacity: 30,
    equipment: [],
    blocked,
    bookings,
  };
}

const ENG101_BOOKINGS: Booking[] = [
  { start: 510, end: 570, label: "CS 201 Lecture" },
  { start: 600, end: 660, label: "Faculty Meeting" },
  { start: 780, end: 840, label: "Project Review" },
];

const FROZEN_BOOKINGS: ReadonlyArray<Booking> = Object.freeze(
  ENG101_BOOKINGS.map((b) => Object.freeze({ ...b }))
);

const frozenRoom: Room = makeRoom("eng-101-frozen", false, [
  ...FROZEN_BOOKINGS,
] as Booking[]);

const blockedRoom: Room = makeRoom("blocked-room", true, [
  { start: 480, end: 600, label: "Maintenance" },
]);

const emptyRoom: Room = makeRoom("empty-room", false, []);

// Room with a single early booking so 720+ slots are free for AC2 duration tests
const durationRoom: Room = makeRoom("duration-room", false, [
  { start: 480, end: 540, label: "Morning Session" },
]);

// Room with a single booking at 600–660 so 541–600 touches its start
const touchRoom: Room = makeRoom("touch-room", false, [
  { start: 600, end: 660, label: "Seminar" },
]);

const eng101: Room = makeRoom("eng-101", false, ENG101_BOOKINGS);

describe("checkAvailability", () => {
  it("T01: 660–720 is available (after all bookings, before next)", () => {
    const res = checkAvailability(eng101, 660, 720, NOW);
    expect(res.available).toBe(true);
  });

  it("T02: 540–570 start not strictly after current time (NOW=540)", () => {
    const res = checkAvailability(eng101, 540, 570, NOW);
    expect(res.available).toBe(false);
  });

  it("T03: 720–720 start equals end", () => {
    const res = checkAvailability(eng101, 720, 720, NOW);
    expect(res.available).toBe(false);
  });

  it("T04: 750–720 end before start", () => {
    const res = checkAvailability(eng101, 750, 720, NOW);
    expect(res.available).toBe(false);
  });

  it("T05: 1380–1441 end exceeds 1440", () => {
    const res = checkAvailability(eng101, 1380, 1441, NOW);
    expect(res.available).toBe(false);
  });

  it("T06: 720–840 exactly 120 minutes is available (fresh fixture, no overlap)", () => {
    const res = checkAvailability(durationRoom, 720, 840, NOW);
    expect(res.available).toBe(true);
  });

  it("T07: 720–841 duration 121 minutes is unavailable (fresh fixture, no overlap)", () => {
    const res = checkAvailability(durationRoom, 720, 841, NOW);
    expect(res.available).toBe(false);
  });

  it("T08: 570–600 touches end of CS 201 Lecture and start of Faculty Meeting", () => {
    const res = checkAvailability(eng101, 570, 600, NOW);
    expect(res.available).toBe(true);
  });

  it("T09: 630–690 overlaps Faculty Meeting (600–660)", () => {
    const res = checkAvailability(eng101, 630, 690, NOW);
    expect(res.available).toBe(false);
  });

  it("T10: 570–690 overlaps Faculty Meeting (600–660)", () => {
    const res = checkAvailability(eng101, 570, 690, NOW);
    expect(res.available).toBe(false);
  });

  it("T11: 615–645 is fully inside Faculty Meeting (600–660)", () => {
    const res = checkAvailability(eng101, 615, 645, NOW);
    expect(res.available).toBe(false);
  });

  it("T12: 600–660 exactly matches Faculty Meeting", () => {
    const res = checkAvailability(eng101, 600, 660, NOW);
    expect(res.available).toBe(false);
  });

  it("T13: blocked room 660–720 is unavailable", () => {
    const res = checkAvailability(blockedRoom, 660, 720, NOW);
    expect(res.available).toBe(false);
  });

  it("T14: empty bookings room 630–690 is available", () => {
    const res = checkAvailability(emptyRoom, 630, 690, NOW);
    expect(res.available).toBe(true);
  });

  it("T15: room and booking data remain unchanged after overlapping and non-overlapping requests", () => {
    const roomSnapshot = JSON.parse(JSON.stringify(frozenRoom)) as Room;
    const bookingsSnapshot = JSON.parse(
      JSON.stringify(frozenRoom.bookings)
    ) as Booking[];

    const overlapRes = checkAvailability(frozenRoom, 620, 640, NOW);
    expect(overlapRes.available).toBe(false);

    const availRes = checkAvailability(frozenRoom, 660, 720, NOW);
    expect(availRes.available).toBe(true);

    expect(JSON.parse(JSON.stringify(frozenRoom))).toEqual(roomSnapshot);
    expect(JSON.parse(JSON.stringify(frozenRoom.bookings))).toEqual(
      bookingsSnapshot
    );

    expect(Object.isFrozen(frozenRoom.bookings[0])).toBe(true);
    expect(Object.isFrozen(frozenRoom.bookings[1])).toBe(true);
    expect(() => {
      (frozenRoom.bookings[0] as Booking).start = 999;
    }).toThrow(TypeError);
  });

  it("T16: 1380–1440 end at boundary 1440 is available", () => {
    const res = checkAvailability(eng101, 1380, 1440, NOW);
    expect(res.available).toBe(true);
  });

  it("T17: 541–600 start strictly after NOW (540) and touches booking start (fresh fixture)", () => {
    const res = checkAvailability(touchRoom, 541, 600, NOW);
    expect(res.available).toBe(true);
  });

  it("T18: start -10, end 30, currentTime -60 is unavailable (start < 0)", () => {
    const res = checkAvailability(eng101, -10, 30, -60);
    expect(res.available).toBe(false);
  });

  it("T19: 420–480 starts well before current time (NOW=540) and is unavailable", () => {
    const res = checkAvailability(eng101, 420, 480, NOW);
    expect(res.available).toBe(false);
  });
});
