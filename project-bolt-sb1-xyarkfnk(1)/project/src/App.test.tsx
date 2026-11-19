// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "@/App";

afterEach(cleanup);

const roomSelect = () => screen.getByLabelText("Select Room") as HTMLSelectElement;
const roomOptionNames = () =>
  within(roomSelect())
    .getAllByRole("option")
    .map((option) => option.textContent ?? "");
const checkButton = () => screen.getByRole("button", { name: /Check Availability/ });
const attendeeInput = () => screen.getByLabelText("Number of Attendees") as HTMLInputElement;
const explainButton = () => screen.getByRole("button", { name: /Explain Availability/ });

describe("room switching", () => {
  it("clears the old result and checks the newly selected room's own bookings", () => {
    render(<App />);

    fireEvent.click(checkButton());
    expect(screen.getByText("Unavailable")).toBeTruthy();

    fireEvent.change(roomSelect(), { target: { value: "lib-b" } });
    expect(screen.queryByText("Unavailable")).toBeNull();
    expect(screen.queryByText("Available")).toBeNull();

    fireEvent.click(checkButton());
    expect(screen.getByText("Available")).toBeTruthy();
  });

  it("shows only the selected room's bookings", () => {
    render(<App />);
    expect(screen.getByText("CS 201 Lecture")).toBeTruthy();

    fireEvent.change(roomSelect(), { target: { value: "sci-lab-3" } });
    expect(screen.getByText("Chemistry Lab Session")).toBeTruthy();
    expect(screen.queryByText("CS 201 Lecture")).toBeNull();
  });

  it("clears the result when the attendee filter changes", () => {
    render(<App />);

    fireEvent.click(checkButton());
    expect(screen.getByText("Unavailable")).toBeTruthy();

    fireEvent.change(attendeeInput(), { target: { value: "2" } });
    expect(screen.queryByText("Unavailable")).toBeNull();
  });
});

describe("blocked rooms", () => {
  it("reports a blocked room as unavailable even when its time slot is otherwise free", () => {
    render(<App />);

    fireEvent.change(roomSelect(), { target: { value: "aud-a" } });
    fireEvent.click(checkButton());

    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.getByText(/currently blocked and unavailable/)).toBeTruthy();
    expect(screen.queryByText("Available")).toBeNull();
  });
});

describe("capacity and equipment filters", () => {
  it("removes rooms whose capacity is below the attendee count", () => {
    render(<App />);

    fireEvent.change(attendeeInput(), { target: { value: "13" } });
    const names = roomOptionNames().join(" | ");
    expect(names).not.toContain("Conference Room C");
    expect(names).not.toContain("Library Study Room B");
    expect(names).toContain("Engineering Hall 101");
  });

  it("keeps rooms whose capacity exactly matches the attendee count", () => {
    render(<App />);

    fireEvent.change(attendeeInput(), { target: { value: "12" } });
    expect(roomOptionNames().join(" | ")).toContain("Conference Room C");
  });

  it("shows only rooms that contain every selected equipment item", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Projector" }));
    expect(roomOptionNames()).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "Microphone" }));
    expect(roomOptionNames()).toHaveLength(1);
    expect(roomOptionNames()[0]).toContain("Auditorium A");
  });
});

describe("empty state", () => {
  it("shows a clear message when no rooms match and recovers when filters are relaxed", () => {
    render(<App />);

    fireEvent.change(attendeeInput(), { target: { value: "1000" } });
    expect(screen.getByText("No rooms match your filters")).toBeTruthy();
    expect(screen.queryByLabelText("Select Room")).toBeNull();
    expect(screen.queryByRole("button", { name: /Check Availability/ })).toBeNull();

    fireEvent.change(attendeeInput(), { target: { value: "1" } });
    expect(screen.queryByText("No rooms match your filters")).toBeNull();
    expect(screen.getByLabelText("Select Room")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// AI explanation — UI integration tests
// ---------------------------------------------------------------------------

describe("AI explanation UI", () => {
  it("does not show the Explain button before checking availability", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: /Explain Availability/ })).toBeNull();
  });

  it("shows the Explain button after checking availability", () => {
    render(<App />);
    fireEvent.click(checkButton());
    expect(explainButton()).toBeTruthy();
  });

  it("renders an AI-generated explanation labeled correctly after clicking Explain", async () => {
    render(<App />);
    fireEvent.click(checkButton());
    fireEvent.click(explainButton());

    // Wait for the async explanation to appear
    const label = await screen.findByText(/AI-generated explanation/i, undefined, { timeout: 3000 });
    expect(label).toBeTruthy();
  });

  it("clears the explanation when switching rooms", () => {
    render(<App />);
    fireEvent.click(checkButton());
    fireEvent.click(explainButton());

    // Switch room — should clear both result and explanation
    fireEvent.change(roomSelect(), { target: { value: "lib-b" } });
    expect(screen.queryByText(/AI-generated explanation/i)).toBeNull();
    expect(screen.queryByText("Unavailable")).toBeNull();
    expect(screen.queryByText("Available")).toBeNull();
  });

  it("clears the explanation when the attendee filter changes", () => {
    render(<App />);
    fireEvent.click(checkButton());
    fireEvent.click(explainButton());

    fireEvent.change(attendeeInput(), { target: { value: "2" } });
    expect(screen.queryByText(/AI-generated explanation/i)).toBeNull();
    expect(screen.queryByText("Unavailable")).toBeNull();
  });

  it("clears the previous explanation when re-checking availability", () => {
    render(<App />);
    fireEvent.click(checkButton());
    fireEvent.click(explainButton());

    // Click Check Availability again — old explanation should be cleared
    // (button still present, explanation panel cleared until Explain clicked again)
    fireEvent.click(checkButton());
    // The result banner should still show (Unavailable), but no AI explanation panel
    expect(screen.queryByText(/AI-generated explanation/i)).toBeNull();
    expect(screen.getByText("Unavailable")).toBeTruthy();
  });
});
