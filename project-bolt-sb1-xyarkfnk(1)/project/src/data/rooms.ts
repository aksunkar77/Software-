export interface Booking {
  start: number;
  end: number;
  label: string;
}

export const EQUIPMENT_OPTIONS = [
  "Projector",
  "Whiteboard",
  "Video Conferencing",
  "Lab Benches",
  "Microphone",
] as const;

export type Equipment = (typeof EQUIPMENT_OPTIONS)[number];

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: Equipment[];
  blocked: boolean;
  bookings: Booking[];
}

export const CURRENT_TIME_DEFAULT = 540; // 9:00 AM

export const rooms: Room[] = [
  {
    id: "eng-101",
    name: "Engineering Hall 101",
    building: "Engineering Building",
    capacity: 60,
    equipment: ["Projector", "Whiteboard", "Video Conferencing"],
    blocked: false,
    bookings: [
      { start: 510, end: 570, label: "CS 201 Lecture" },
      { start: 600, end: 660, label: "Faculty Meeting" },
      { start: 780, end: 840, label: "Project Review" },
    ],
  },
  {
    id: "lib-b",
    name: "Library Study Room B",
    building: "Main Library",
    capacity: 6,
    equipment: ["Whiteboard"],
    blocked: false,
    bookings: [
      { start: 480, end: 540, label: "Group Study" },
      { start: 720, end: 780, label: "Book Club" },
    ],
  },
  {
    id: "sci-lab-3",
    name: "Science Lab 3",
    building: "Science Complex",
    capacity: 24,
    equipment: ["Lab Benches", "Projector"],
    blocked: false,
    bookings: [
      { start: 540, end: 630, label: "Chemistry Lab Session" },
      { start: 900, end: 960, label: "Research Group" },
    ],
  },
  {
    id: "aud-a",
    name: "Auditorium A",
    building: "Arts Center",
    capacity: 300,
    equipment: ["Projector", "Microphone", "Video Conferencing"],
    blocked: true,
    bookings: [
      { start: 480, end: 600, label: "Maintenance - Closed" },
    ],
  },
  {
    id: "conf-c",
    name: "Conference Room C",
    building: "Administration Block",
    capacity: 12,
    equipment: ["Video Conferencing", "Projector", "Whiteboard"],
    blocked: false,
    bookings: [
      { start: 570, end: 630, label: "Budget Review" },
      { start: 690, end: 750, label: "HR Interview" },
      { start: 840, end: 930, label: "Board Meeting" },
    ],
  },
];
