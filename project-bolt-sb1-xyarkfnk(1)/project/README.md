# Smart Campus Room Availability Checker

A React and TypeScript web application that helps students check classroom availability and find suitable rooms for their meetings or study sessions.

## Project Overview

The Smart Campus Room Availability Checker allows users to select a room, choose a time period, and check whether the room is available.

The application uses predefined booking data and deterministic validation rules. It also includes an AI-style explanation feature that helps users understand why a room is available or unavailable.

**Important:** The availability checker makes the final decision. The explanation feature only explains the result and cannot change it.

## Features

### 1. Room Selection
- Displays five fictional campus rooms.
- Shows room information and existing bookings.
- Allows users to select a room.

### 2. Room Filtering
- Filter rooms by minimum capacity.
- Filter rooms by required equipment.
- Show an empty state when no rooms match the selected filters.

### 3. Availability Checking
The application checks room availability using the following rules:

- Start time must be earlier than the end time.
- The requested time must be in the future.
- The booking duration cannot exceed 120 minutes.
- Blocked rooms cannot be booked.
- Overlapping bookings are not allowed.
- Bookings that touch at their endpoints are allowed.
- Existing booking data must not be modified.

### 4. AI Availability Explanation
The application includes an Explain Availability feature.

It provides a simple explanation of the availability result.

Main features:
- Explains why a room is available or unavailable.
- Uses different prompt variants during prompt evaluation.
- Uses a mock LLM adapter.
- Handles invalid input and simulated errors.
- Provides a fallback message when the model is unavailable.
- Does not change the original availability result.

**Note:** This project uses a mock AI adapter. It does not require a real AI API key or backend service.

### 5. Testing and Error Handling
The project includes tests for:

- Availability validation.
- Room filtering.
- Booking overlaps.
- Invalid time inputs.
- AI explanation scenarios.
- API error and timeout simulation.
- Missing API key scenarios.
- UI behavior and loading states.
- Race conditions and stale explanations.

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- Testing Library
- Lucide React

## Project Structure

```text
src/
├── components/
│   ├── BookingList.tsx
│   ├── ExplanationPanel.tsx
│   ├── ResultBanner.tsx
│   ├── RoomSelector.tsx
│   ├── TimePicker.tsx
│   └── Timeline.tsx
│
├── data/
│   └── rooms.ts
│
├── lib/
│   ├── availability.ts
│   ├── explanation.ts
│   ├── explanation.test.ts
│   ├── explanation-scenarios.test.ts
│   ├── room-filter.ts
│   └── time.ts
│
├── App.tsx
├── App.test.tsx
└── index.css
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Open the project folder

```bash
cd YOUR_PROJECT_FOLDER
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build the application |
| `npm run lint` | Check code quality |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run automated tests |
| `npm run preview` | Preview production build |

## Testing Results

The latest recorded test run completed successfully:

- **7 test files passed**
- **92 tests passed**
- **0 failed tests**

Additional quality checks can be run using the build, lint, and typecheck commands.

## Project Limitations

- All room and booking data are fictional.
- Data is stored locally in the project.
- There is no database or backend.
- There is no authentication or payment system.
- The AI explanation uses a mock adapter rather than a real LLM API.

## Main Design Principle

The application follows a simple principle:

**Deterministic logic decides. AI explains.**

This keeps room availability decisions reliable while making the results easier for users to understand.

## Academic Project

Developed as part of the Software Engineering Practice course.
