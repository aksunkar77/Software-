# AGENTS.md

## Project

Smart Campus Room Availability Checker.
A simple one-page application that helps students check the availability of one campus room using fictional booking data.

## Project Structure

- `src/lib/availability.ts` - Main booking validation function.
- `src/lib/time.ts` - Time formatting utilities.
- `src/data/rooms.ts` - Room and booking fixture data.
- `src/App.tsx` - Main application UI.
- `src/components/` - UI components.
- `src/lib/availability.test.ts` - Main validation tests.
- `src/lib/bug-regression.test.ts` - Regression tests.

## Acceptance Criteria (AC1-AC6)

- **AC1:** Reject invalid time intervals. Require 0 <= start < end <= 1440 and start > current time.
- **AC2:** Reject booking durations longer than 120 minutes. Exactly 120 minutes is allowed.
- **AC3:** Reject bookings for blocked rooms.
- **AC4:** Reject overlapping bookings but allow intervals that only touch at endpoints.
- **AC5:** Show clear Available or Unavailable results and never modify existing booking data.
- **AC6:** Keep the UI responsive on desktop and mobile, with understandable validation feedback.

## Engineering Rules

- Keep booking validation separate from UI components.
- Prefer simple and pure functions.
- Use shared constants instead of duplicated rules.
- Do not modify fixture data unnecessarily.
- Avoid unnecessary design patterns.
- Use minimal code changes.

## Forbidden Changes

- No backend or database.
- No login or authentication.
- No actual booking creation.
- Do not redesign the existing UI.
- Do not remove existing functionality or tests.

## Verification

- Use the existing Vitest test framework.
- Run `npm test` and `npm run build` if available.
- Add focused regression tests when needed.
- Check desktop and mobile layouts.
- Report changed files and test results.
