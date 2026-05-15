import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("../skribble/api", () => ({
  subscribeToTimer: vi.fn(),
}));

import { subscribeToTimer } from "../skribble/api";
import Timer from "../skribble/components/Timer";

beforeEach(() => {
  subscribeToTimer.mockClear();
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

  it("updates with server-authoritative timer ticks", () => {
    render(<Timer />);
    const timerCallback = subscribeToTimer.mock.calls[0][0];

    act(() => timerCallback({ time: 10 }));
    act(() => timerCallback({ time: 9 }));
    act(() => timerCallback({ time: 8 }));
    act(() => timerCallback({ time: 7 }));
    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 7");
  });

  it("displays 0 when server sends 0", () => {
    render(<Timer />);
    const timerCallback = subscribeToTimer.mock.calls[0][0];
    act(() => timerCallback({ time: 2 }));
    act(() => timerCallback({ time: 1 }));
    act(() => timerCallback({ time: 0 }));

    expect(screen.getByText(/time left/i)).toHaveTextContent("Time left: 0");
  });
});
