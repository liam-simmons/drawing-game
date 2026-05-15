import { vi, describe, it, expect, beforeEach } from "vitest";

const mockSocket = vi.hoisted(() => ({
  on: vi.fn(),
  emit: vi.fn(),
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

import {
  sendDrawInfo,
  sendFillInfo,
  sendChatMessage,
  sendName,
  sendResetCanvas,
  subscribeToDrawing,
  subscribeToFilling,
  subscribeToChat,
  subscribeToWords,
  subscribeToTimer,
  subscribeToMyId,
} from "../skribble/api";

beforeEach(() => {
  mockSocket.emit.mockClear();
  mockSocket.on.mockClear();
});

describe("sendDrawInfo", () => {
  it("emits drawInfo with all drawing parameters", () => {
    sendDrawInfo(10, 20, 5, 15, [0, 0, 0], 8);
    expect(mockSocket.emit).toHaveBeenCalledWith("drawInfo", {
      x: 10,
      y: 20,
      lastX: 5,
      lastY: 15,
      colour: [0, 0, 0],
      radius: 8,
    });
  });
});

describe("sendFillInfo", () => {
  it("emits fillInfo with position and colour", () => {
    sendFillInfo(30, 40, [255, 0, 0]);
    expect(mockSocket.emit).toHaveBeenCalledWith("fillInfo", {
      x: 30,
      y: 40,
      colour: [255, 0, 0],
    });
  });
});

describe("sendChatMessage", () => {
  it("emits chat-message with username and message", () => {
    sendChatMessage("alice", "hello world");
    expect(mockSocket.emit).toHaveBeenCalledWith("chat-message", {
      username: "alice",
      message: "hello world",
    });
  });
});

describe("sendName", () => {
  it("emits name event with the player name", () => {
    sendName("bob");
    expect(mockSocket.emit).toHaveBeenCalledWith("name", "bob");
  });
});

describe("sendResetCanvas", () => {
  it("emits reset-canvas", () => {
    sendResetCanvas();
    expect(mockSocket.emit).toHaveBeenCalledWith("reset-canvas");
  });
});

describe("subscribeToDrawing", () => {
  it("registers a handler for the drawInfo event", () => {
    const cb = vi.fn();
    subscribeToDrawing(cb);
    expect(mockSocket.on).toHaveBeenCalledWith("drawInfo", expect.any(Function));
  });

  it("calls the callback with the received data", () => {
    const cb = vi.fn();
    subscribeToDrawing(cb);
    const handler = mockSocket.on.mock.calls.find(([e]) => e === "drawInfo")[1];
    handler({ x: 1, y: 2 });
    expect(cb).toHaveBeenCalledWith({ x: 1, y: 2 });
  });
});

describe("subscribeToFilling", () => {
  it("registers a handler for the fillInfo event", () => {
    const cb = vi.fn();
    subscribeToFilling(cb);
    expect(mockSocket.on).toHaveBeenCalledWith("fillInfo", expect.any(Function));
  });
});

describe("subscribeToWords", () => {
  it("registers a handler for word-update", () => {
    const cb = vi.fn();
    subscribeToWords(cb);
    expect(mockSocket.on).toHaveBeenCalledWith("word-update", expect.any(Function));
  });

  it("passes the word string directly to the callback", () => {
    const cb = vi.fn();
    subscribeToWords(cb);
    const handler = mockSocket.on.mock.calls.find(([e]) => e === "word-update")[1];
    handler("elephant");
    expect(cb).toHaveBeenCalledWith("elephant");
  });
});

describe("subscribeToTimer", () => {
  it("registers a handler for set-timer", () => {
    const cb = vi.fn();
    subscribeToTimer(cb);
    expect(mockSocket.on).toHaveBeenCalledWith("set-timer", expect.any(Function));
  });
});

describe("subscribeToMyId", () => {
  it("registers a handler for yourId", () => {
    const cb = vi.fn();
    subscribeToMyId(cb);
    expect(mockSocket.on).toHaveBeenCalledWith("yourId", expect.any(Function));
  });
});

describe("subscribeToChat", () => {
  it("registers handlers for all chat event types", () => {
    const cb = vi.fn();
    subscribeToChat(cb);
    const registeredEvents = mockSocket.on.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain("chat-message");
    expect(registeredEvents).toContain("user-connected");
    expect(registeredEvents).toContain("user-disconnected");
    expect(registeredEvents).toContain("player-guessed-word");
    expect(registeredEvents).toContain("everyone-guessed-correctly");
    expect(registeredEvents).toContain("timer-ran-out");
  });

  it("wraps a chat message with type 'message'", () => {
    const cb = vi.fn();
    subscribeToChat(cb);
    const handler = mockSocket.on.mock.calls.find(([e]) => e === "chat-message")[1];
    handler({ message: "hi", username: "alice", id: 1 });
    expect(cb).toHaveBeenCalledWith({
      message: "hi",
      username: "alice",
      id: 1,
      type: "message",
    });
  });
});
