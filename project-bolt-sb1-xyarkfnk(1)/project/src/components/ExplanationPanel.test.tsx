// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ExplanationPanel from "@/components/ExplanationPanel";
import type { ExplanationResult } from "@/lib/explanation";

afterEach(cleanup);

describe("ExplanationPanel — UI labeling", () => {
  it("clearly labels the result as AI-generated explanation", () => {
    const result: ExplanationResult = {
      text: "Engineering Hall 101 is free from 11:00 to 12:00.",
      ok: true,
    };
    render(<ExplanationPanel result={result} loading={false} />);
    expect(screen.getByText(/AI-generated explanation/i)).toBeTruthy();
  });

  it("labels fallback results as AI-generated explanation (fallback)", () => {
    const result: ExplanationResult = {
      text: "The AI explanation service encountered an error. The availability result above is still valid.",
      ok: false,
      fallbackReason: "api_error",
    };
    render(<ExplanationPanel result={result} loading={false} />);
    expect(screen.getByText(/AI-generated explanation.*fallback/i)).toBeTruthy();
  });

  it("shows a loading state while generating", () => {
    render(<ExplanationPanel result={null} loading={true} />);
    expect(screen.getByText(/AI-generated explanation/i)).toBeTruthy();
    expect(screen.getByText(/Generating/i)).toBeTruthy();
  });

  it("renders nothing when there is no result and not loading", () => {
    const { container } = render(<ExplanationPanel result={null} loading={false} />);
    expect(container.firstChild).toBeNull();
  });
});
