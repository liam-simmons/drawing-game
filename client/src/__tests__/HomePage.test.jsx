import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";

const renderHomePage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

describe("HomePage", () => {
  it("renders the game title", () => {
    renderHomePage();
    expect(screen.getByText("Drawing Game!")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    renderHomePage();
    expect(
      screen.getByText("Invite your friends and guess some drawings!")
    ).toBeInTheDocument();
  });

  it("renders a Play now button", () => {
    renderHomePage();
    expect(screen.getByRole("button", { name: /play now/i })).toBeInTheDocument();
  });

  it("the play button links to /play", () => {
    renderHomePage();
    const link = screen.getByRole("link", { name: /play now/i });
    expect(link).toHaveAttribute("href", "/play");
  });
});
