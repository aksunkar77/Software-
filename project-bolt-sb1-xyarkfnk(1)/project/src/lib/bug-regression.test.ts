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
  return { id, name, building: "Test Building", capacity: 30, equipment: [], blocked, bookings };
}

describe("BUG-A — Endpoint touching", () => {
  it("new booking 660–720 touching existing 600–660 should be available", () => {
    const room = makeRoom("bug-a-room", false, [
      { start: 600, end: 660, label: "Seminar" },
    ]);

    const res = checkAvailability(room, 660, 720, NOW);

    expect(res.available).toBe(true);
  });
});

describe("BUG-B — Mutation of original booking data", () => {
  it("room and booking data remain unchanged after the call", () => {
    const bookings: Booking[] = [
      { start: 510, end: 570, label: "CS 201 Lecture" },
      { start: 600, end: 660, label: "Faculty Meeting" },
    ];
    const room = makeRoom("bug-b-room", false, bookings);

    const roomSnapshot = JSON.parse(JSON.stringify(room)) as Room;
    const bookingsSnapshot = JSON.parse(JSON.stringify(bookings)) as Booking[];

    checkAvailability(room, 620, 640, NOW);

    expect(JSON.parse(JSON.stringify(room))).toEqual(roomSnapshot);
    expect(JSON.parse(JSON.stringify(bookings))).toEqual(bookingsSnapshot);

    expect(bookings[0].start).toBe(510);
    expect(bookings[0].end).toBe(570);
    expect(bookings[0].label).toBe("CS 201 Lecture");
    expect(bookings[1].start).toBe(600);
    expect(bookings[1].end).toBe(660);
    expect(bookings[1].label).toBe("Faculty Meeting");
    expect(room.blocked).toBe(false);
    expect(room.id).toBe("bug-b-room");
  });
});
