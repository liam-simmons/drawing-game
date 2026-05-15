import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("../skribble/api", () => ({
  subscribeToTimer: vi.fn(),
  subscribeToTurns: vi.fn(),
}));

import { subscribeToTimer, subscribeToTurns } from "../skribble/api";
import Timer from "../skribble/components/Timer";

beforeEach(() => {
  vi.useFakeTimers();
  subscribeToTimer.mockClear();
  subscribeToTurns.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Timer", () => {
  it("renders 'Time left: 0' initially", () => {
    render(<Timer />);
    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 0");
  });

  it("displays the time received from the server", () => {
    render(<Timer />);
    const timerCallback = subscribeToTimer.mock.calls[0][0];
    act(() => timerCallback({ time: 80 }));
    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 80");
  });

  it("counts down by 1 every second when the turn is active", () => {
    render(<Timer />);
    const timerCallback = subscribeToTimer.mock.calls[0][0];
    const turnCallback = subscribeToTurns.mock.calls[0][0];

    act(() => timerCallback({ time: 10 }));
    act(() => turnCallback({ turn: 1 }));

    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 7");
  });

  it("does not count down when no turn is active (turn: -1)", () => {
    render(<Timer />);
    const timerCallback = subscribeToTimer.mock.calls[0][0];
    const turnCallback = subscribeToTurns.mock.calls[0][0];

    act(() => timerCallback({ time: 10 }));
    act(() => turnCallback({ turn: -1 }));

    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 10");
  });

  it("does not go below 0", () => {
    render(<Timer />);
    const timerCallback = subscribeToTimer.mock.calls[0][0];
    const turnCallback = subscribeToTurns.mock.calls[0][0];

    act(() => timerCallback({ time: 2 }));
    act(() => turnCallback({ turn: 1 }));

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 0");
  });
});
