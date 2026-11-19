import type { Equipment, Room } from "@/data/rooms";

export interface RoomFilter {
  attendees: number;
  requiredEquipment: Equipment[];
}

export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= filter.attendees &&
      filter.requiredEquipment.every((item) => room.equipment.includes(item))
  );
}
