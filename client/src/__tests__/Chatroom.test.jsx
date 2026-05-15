import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSendChatMessage = vi.hoisted(() => vi.fn());

vi.mock("../skribble/api", () => ({
  subscribeToChat: vi.fn(),
  sendChatMessage: mockSendChatMessage,
}));

import { subscribeToChat } from "../skribble/api";
import Chatroom from "../skribble/components/Chatroom";

beforeEach(() => {
  mockSendChatMessage.mockClear();
  subscribeToChat.mockClear();
});

const getChatCallback = () => subscribeToChat.mock.calls[0][0];

describe("Chatroom", () => {
  it("renders a chat input", () => {
    render(<Chatroom />);
    expect(
      screen.getByPlaceholderText("Type a message here")
    ).toBeInTheDocument();
  });

  it("updates the input value as the user types", async () => {
    render(<Chatroom />);
    const input = screen.getByPlaceholderText("Type a message here");
    await userEvent.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("sends the message and clears the input on Enter", async () => {
    render(<Chatroom />);
    const input = screen.getByPlaceholderText("Type a message here");
    await userEvent.type(input, "hello{Enter}");
    expect(mockSendChatMessage).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
  });

  it("does not send an empty message on Enter", async () => {
    render(<Chatroom />);
    const input = screen.getByPlaceholderText("Type a message here");
    await userEvent.type(input, "{Enter}");
    expect(mockSendChatMessage).not.toHaveBeenCalled();
  });

  it("displays received chat messages", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() =>
      chatCallback({ type: "message", username: "alice", message: "hi there", id: 1 })
    );
    expect(screen.getByText("hi there")).toBeInTheDocument();
    expect(screen.getByText("alice:")).toBeInTheDocument();
  });

  it("displays a join notification", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() => chatCallback({ type: "joinerMessage", username: "bob", id: 2 }));
    expect(screen.getByText(/bob has connected/)).toBeInTheDocument();
  });

  it("displays a leave notification", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() => chatCallback({ type: "leaverMessage", username: "carol", id: 3 }));
    expect(screen.getByText(/carol has left/)).toBeInTheDocument();
  });

  it("displays a correct-guess notification", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() =>
      chatCallback({ type: "guessedMessage", username: "dave", id: 4 })
    );
    expect(screen.getByText(/dave has guessed the word/i)).toBeInTheDocument();
  });

  it("displays the word when everyone has guessed", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() =>
      chatCallback({ type: "everyoneGuessedMessage", word: "elephant", id: 5 })
    );
    expect(screen.getByText(/the word was elephant/i)).toBeInTheDocument();
  });

  it("displays the word when the timer runs out", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() =>
      chatCallback({ type: "timerRanOutMessage", word: "giraffe", id: 6 })
    );
    expect(screen.getByText(/the word was giraffe/i)).toBeInTheDocument();
  });

  it("accumulates multiple messages", () => {
    render(<Chatroom />);
    const chatCallback = getChatCallback();
    act(() => chatCallback({ type: "message", username: "a", message: "first", id: 1 }));
    act(() => chatCallback({ type: "message", username: "b", message: "second", id: 2 }));
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });
});
