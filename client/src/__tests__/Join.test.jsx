import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Join from "../skribble/components/Join";

describe("Join", () => {
  it("renders a text input for the player name", () => {
    render(<Join setName={vi.fn()} />);
    expect(screen.getByPlaceholderText("Pick a name!")).toBeInTheDocument();
  });

  it("renders a join button", () => {
    render(<Join setName={vi.fn()} />);
    expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
  });

  it("updates the input as the user types", async () => {
    render(<Join setName={vi.fn()} />);
    const input = screen.getByPlaceholderText("Pick a name!");
    await userEvent.type(input, "alice");
    expect(input).toHaveValue("alice");
  });

  it("calls setName with the typed name on form submit", async () => {
    const setName = vi.fn();
    render(<Join setName={setName} />);
    const input = screen.getByPlaceholderText("Pick a name!");
    await userEvent.type(input, "alice");
    fireEvent.submit(input.closest("form"));
    expect(setName).toHaveBeenCalledWith("alice");
  });

  it("calls setName with empty string if submitted with no input", () => {
    const setName = vi.fn();
    render(<Join setName={setName} />);
    fireEvent.submit(screen.getByRole("button").closest("form"));
    expect(setName).toHaveBeenCalledWith("");
  });
});
