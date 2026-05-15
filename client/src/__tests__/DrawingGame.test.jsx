import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("../skribble/api", () => ({
  sendName: vi.fn(),
  requestCurrentState: vi.fn(),
  subscribeToMyId: vi.fn(),
  subscribeToDrawing: vi.fn(),
  subscribeToFilling: vi.fn(),
  subscribeToResetCanvas: vi.fn(),
  subscribeToTurns: vi.fn(),
  subscribeToChat: vi.fn(),
  subscribeToPlayerList: vi.fn(),
  subscribeToWords: vi.fn(),
  subscribeToTimer: vi.fn(),
  sendDrawInfo: vi.fn(),
  sendFillInfo: vi.fn(),
  sendChatMessage: vi.fn(),
}));

import {
  sendName,
  requestCurrentState,
  subscribeToMyId,
} from "../skribble/api";
import DrawingGame from "../skribble/DrawingGame";

beforeEach(() => {
  vi.clearAllMocks();
});

const submitName = (name) => {
  const input = screen.getByPlaceholderText("Pick a name!");
  fireEvent.change(input, { target: { value: name } });
  fireEvent.submit(input.closest("form"));
};

describe("DrawingGame", () => {
  it("shows the Join form before a name is entered", () => {
    render(<DrawingGame width={640} height={360} />);
    expect(screen.getByPlaceholderText("Pick a name!")).toBeInTheDocument();
  });

  it("hides the Join form and shows the game UI after submitting a name", () => {
    render(<DrawingGame width={640} height={360} />);
    act(() => submitName("alice"));
    expect(
      screen.queryByPlaceholderText("Pick a name!")
    ).not.toBeInTheDocument();
    expect(document.querySelector("canvas")).toBeInTheDocument();
  });

  it("calls sendName with the submitted name", () => {
    render(<DrawingGame width={640} height={360} />);
    act(() => submitName("bob"));
    expect(sendName).toHaveBeenCalledWith("bob");
  });

  it("calls sendName before requestCurrentState so the server handler is registered first", () => {
    // sendName emits 'name' to the server, which registers the
    // 'request-current-state' handler. requestCurrentState must be called
    // AFTER sendName so the server has a handler ready to respond.
    const callOrder = [];
    sendName.mockImplementation(() => callOrder.push("sendName"));
    requestCurrentState.mockImplementation(() =>
      callOrder.push("requestCurrentState")
    );

    render(<DrawingGame width={640} height={360} />);
    act(() => submitName("carol"));

    expect(callOrder).toContain("sendName");
    expect(callOrder).toContain("requestCurrentState");
    expect(callOrder.indexOf("sendName")).toBeLessThan(
      callOrder.indexOf("requestCurrentState")
    );
  });

  it("calls requestCurrentState after socket subscriptions are set up", () => {
    // subscribeToMyId is called in Canvas's constructor during mount.
    // requestCurrentState fires from componentDidMount — after all constructors.
    const callOrder = [];
    subscribeToMyId.mockImplementation(() => callOrder.push("subscribeToMyId"));
    requestCurrentState.mockImplementation(() =>
      callOrder.push("requestCurrentState")
    );

    render(<DrawingGame width={640} height={360} />);
    act(() => submitName("dave"));

    expect(callOrder.indexOf("subscribeToMyId")).toBeLessThan(
      callOrder.indexOf("requestCurrentState")
    );
  });

  it("does not call sendName before the name is submitted", () => {
    render(<DrawingGame width={640} height={360} />);
    expect(sendName).not.toHaveBeenCalled();
  });

  it("keeps showing the game UI after joining — name state persists", () => {
    render(<DrawingGame width={640} height={360} />);
    act(() => submitName("eve"));
    expect(
      screen.queryByPlaceholderText("Pick a name!")
    ).not.toBeInTheDocument();
    expect(document.querySelector("canvas")).toBeInTheDocument();
  });
});
