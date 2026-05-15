import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBox from "../skribble/components/MessageBox";

describe("MessageBox", () => {
  it("renders nothing when there are no messages", () => {
    const { container } = render(<MessageBox messages={[]} />);
    expect(container.querySelectorAll("li")).toHaveLength(0);
  });

  it("renders the correct number of messages", () => {
    const messages = [
      { id: 1, username: "alice:", message: "hello" },
      { id: 2, username: "bob:", message: "world" },
    ];
    const { container } = render(<MessageBox messages={messages} />);
    expect(container.querySelectorAll(".list-group-item")).toHaveLength(2);
  });

  it("renders message text", () => {
    const messages = [{ id: 1, username: "alice:", message: "hello there" }];
    render(<MessageBox messages={messages} />);
    expect(screen.getByText("hello there")).toBeInTheDocument();
  });

  it("renders the username in bold", () => {
    const messages = [{ id: 1, username: "alice:", message: "hi" }];
    render(<MessageBox messages={messages} />);
    const strong = screen.getByText("alice:");
    expect(strong.tagName).toBe("STRONG");
  });

  it("renders a system message without a username", () => {
    const messages = [{ id: 1, message: "bob has connected  " }];
    render(<MessageBox messages={messages} />);
    expect(screen.getByText(/bob has connected/)).toBeInTheDocument();
  });

  it("renders multiple messages in order", () => {
    const messages = [
      { id: 1, username: "a:", message: "first" },
      { id: 2, username: "b:", message: "second" },
      { id: 3, username: "c:", message: "third" },
    ];
    const { container } = render(<MessageBox messages={messages} />);
    const items = container.querySelectorAll(".list-group-item");
    expect(items[0]).toHaveTextContent("first");
    expect(items[1]).toHaveTextContent("second");
    expect(items[2]).toHaveTextContent("third");
  });
});
