# Smart Campus Room Availability Checker

A fictional, frontend-only room availability checker built with React, TypeScript, Vite, and Tailwind CSS.

## Requirements
- Node.js 20+ and npm
- No backend, database, authentication, payments, or external API are required.

## Setup
```bash
npm install
```

## Run locally
```bash
npm run dev
```

## Quality checks
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Features
- Fictional catalog of five rooms, each with an ID, name, building, capacity, equipment, blocked status, and room-specific bookings.
- Capacity filter: room capacity must be greater than or equal to the requested attendee count.
- Equipment filter: a room must contain every selected equipment item.
- Empty state when no rooms satisfy the filters.
- Availability validation for time boundaries, future start time, 120-minute maximum, blocked rooms, and booking overlaps.
- Endpoint-touching intervals are allowed.
- Changing the selected room clears the previous result and displays that room's own bookings.
- Responsive layout with no real reservation creation or persistence.

## Project structure
- `src/data/rooms.ts` — room and booking types plus fictional catalog.
- `src/lib/availability.ts` — availability and booking-conflict rules.
- `src/lib/roomFilters.ts` — capacity and equipment filtering.
- `src/lib/time.ts` — time conversion and duration formatting.
- `src/components/` — reusable UI components.
- `src/App.tsx` — page composition and UI state.

## Scope
All room and booking information is fictional. The application only checks availability; it does not create, save, or confirm reservations.
