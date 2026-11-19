import { describe, it, expect } from "vitest";
import { filterRooms } from "@/lib/room-filter";
import { rooms } from "@/data/rooms";
import type { Room } from "@/data/rooms";

const ids = (list: Room[]) => list.map((r) => r.id);

describe("filterRooms", () => {
  it("keeps rooms whose capacity equals the attendee count", () => {
    const result = filterRooms(rooms, { attendees: 12, requiredEquipment: [] });
    expect(ids(result)).toContain("conf-c");
  });

  it("drops rooms whose capacity is below the attendee count", () => {
    const result = filterRooms(rooms, { attendees: 13, requiredEquipment: [] });
    expect(ids(result)).not.toContain("conf-c");
    expect(ids(result)).toContain("eng-101");
  });

  it("requires every selected equipment item, not just one", () => {
    const result = filterRooms(rooms, {
      attendees: 1,
      requiredEquipment: ["Projector", "Microphone"],
    });
    expect(ids(result)).toEqual(["aud-a"]);
  });

  it("returns all rooms that meet capacity when no equipment is selected", () => {
    const result = filterRooms(rooms, { attendees: 1, requiredEquipment: [] });
    expect(result).toHaveLength(rooms.length);
  });

  it("returns an empty list when no room matches", () => {
    const result = filterRooms(rooms, { attendees: 1000, requiredEquipment: [] });
    expect(result).toEqual([]);
  });

  it("does not remove blocked rooms from results", () => {
    const result = filterRooms(rooms, { attendees: 200, requiredEquipment: [] });
    expect(ids(result)).toContain("aud-a");
  });
});
