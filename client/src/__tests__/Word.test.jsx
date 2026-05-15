import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("../skribble/api", () => ({
  subscribeToWords: vi.fn(),
}));

import { subscribeToWords } from "../skribble/api";
import Word from "../skribble/components/Word";

beforeEach(() => {
  subscribeToWords.mockClear();
});

describe("Word", () => {
  it("renders the default waiting message on mount", () => {
    render(<Word />);
    expect(screen.getByText("Waiting for players...")).toBeInTheDocument();
  });

  it("updates the displayed word when the server sends one", () => {
    render(<Word />);
    const callback = subscribeToWords.mock.calls[0][0];
    act(() => callback("elephant"));
    expect(screen.getByText("elephant")).toBeInTheDocument();
  });

  it("displays blanks for a hidden word (underscores)", () => {
    render(<Word />);
    const callback = subscribeToWords.mock.calls[0][0];
    act(() => callback("___ ___"));
    expect(screen.getByText("___ ___")).toBeInTheDocument();
  });

  it("replaces the word when a new one is received", () => {
    render(<Word />);
    const callback = subscribeToWords.mock.calls[0][0];
    act(() => callback("apple"));
    act(() => callback("banana"));
    expect(screen.queryByText("apple")).not.toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
  });
});
