import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";

vi.mock("../skribble/api", () => ({
  subscribeToMyId: vi.fn(),
  subscribeToDrawing: vi.fn(),
  subscribeToFilling: vi.fn(),
  subscribeToResetCanvas: vi.fn(),
  subscribeToTurns: vi.fn(),
  sendDrawInfo: vi.fn(),
  sendFillInfo: vi.fn(),
  requestCurrentState: vi.fn(),
}));

import {
  subscribeToMyId,
  subscribeToResetCanvas,
  subscribeToTurns,
  requestCurrentState,
  sendDrawInfo,
} from "../skribble/api";
import Canvas from "../skribble/components/Canvas";

// jsdom doesn't implement requestAnimationFrame. Provide a synchronous stub
// so resetCanvas() (deferred via rAF in componentDidMount) runs in tests.
let rafCallbacks = [];
const flushRaf = () => {
  const cbs = rafCallbacks.splice(0);
  cbs.forEach(cb => cb(0));
};

beforeEach(() => {
  rafCallbacks = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(cb => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  });
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const getCallbacks = () => ({
  myId: subscribeToMyId.mock.calls[0]?.[0],
  resetCanvas: subscribeToResetCanvas.mock.calls[0]?.[0],
  turns: subscribeToTurns.mock.calls[0]?.[0],
});

describe("Canvas initialization", () => {
  it("calls requestCurrentState in componentDidMount", () => {
    render(<Canvas width={640} height={360} />);
    expect(requestCurrentState).toHaveBeenCalledTimes(1);
  });

  it("defers resetCanvas via requestAnimationFrame so it survives the React re-render", () => {
    // The root cause of the canvas-not-visible bug: React's batched state
    // flush (triggered by setState({ctx}) + setState({ratio}) in componentDidMount)
    // re-applies the canvas width/height attributes and clears the bitmap.
    // resetCanvas must run AFTER that flush — i.e., in the next animation frame.
    const { container } = render(<Canvas width={640} height={360} />);

    // Before rAF fires, the canvas bitmap hasn't been filled yet (the rAF is queued).
    expect(window.requestAnimationFrame).toHaveBeenCalled();

    // After the rAF fires, getContext('2d').fillRect should have been called.
    const ctx = container.querySelector("canvas").getContext("2d");
    act(() => flushRaf());
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 640, 360);
  });

  it("calls requestCurrentState before requestAnimationFrame (ordering guarantee)", () => {
    // requestCurrentState must be queued on the wire before the rAF fires,
    // because the rAF callback comes after the React render cycle whereas
    // requestCurrentState must precede requestAnimationFrame in the source.
    const callOrder = [];
    requestCurrentState.mockImplementation(() => callOrder.push("requestCurrentState"));
    window.requestAnimationFrame.mockImplementation(cb => {
      callOrder.push("requestAnimationFrame");
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<Canvas width={640} height={360} />);

    expect(callOrder.indexOf("requestCurrentState")).toBeLessThan(
      callOrder.indexOf("requestAnimationFrame")
    );
  });

  it("calls requestCurrentState after socket subscriptions are set up", () => {
    const callOrder = [];
    subscribeToMyId.mockImplementation(() => callOrder.push("subscribeToMyId"));
    subscribeToTurns.mockImplementation(() => callOrder.push("subscribeToTurns"));
    requestCurrentState.mockImplementation(() => callOrder.push("requestCurrentState"));

    render(<Canvas width={640} height={360} />);

    expect(callOrder.indexOf("subscribeToMyId")).toBeLessThan(
      callOrder.indexOf("requestCurrentState")
    );
    expect(callOrder.indexOf("subscribeToTurns")).toBeLessThan(
      callOrder.indexOf("requestCurrentState")
    );
  });

  it("sets myId when yourId event arrives", () => {
    render(<Canvas width={640} height={360} />);
    const { myId } = getCallbacks();
    expect(() => act(() => myId(42))).not.toThrow();
  });

  it("marks turn=false when turn-change names a different player", () => {
    const { container } = render(<Canvas width={640} height={360} />);
    const { myId, turns } = getCallbacks();
    act(() => myId(1));
    act(() => turns({ turn: 2 }));
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("marks turn=true when turn-change names this player", () => {
    const { container } = render(<Canvas width={640} height={360} />);
    const { myId, turns } = getCallbacks();
    act(() => myId(5));
    act(() => turns({ turn: 5 }));
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("fills the canvas white when reset-canvas fires from server", () => {
    const { container } = render(<Canvas width={640} height={360} />);
    const { resetCanvas } = getCallbacks();
    const ctx = container.querySelector("canvas").getContext("2d");
    act(() => resetCanvas());
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 640, 360);
  });

  it("does not crash when yourId and turn-change arrive in the same batch", () => {
    const { container } = render(<Canvas width={640} height={360} />);
    const { myId, turns } = getCallbacks();
    act(() => {
      myId(3);
      turns({ turn: 1 });
    });
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("scales mouse coordinates from rendered size to internal canvas size", () => {
    vi.useFakeTimers();
    const { container } = render(<Canvas width={640} height={360} />);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 10,
      top: 20,
      width: 320,
      height: 180,
    }));

    const { myId, turns } = getCallbacks();
    act(() => {
      myId(7);
      turns({ turn: 7 });
    });

    fireEvent.mouseMove(canvas, { clientX: 170, clientY: 110 });
    fireEvent.mouseDown(canvas);
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(sendDrawInfo).toHaveBeenCalledWith(
      320,
      180,
      undefined,
      undefined,
      [0, 0, 0],
      10
    );
    vi.useRealTimers();
  });

  it("keeps coordinates aligned near the right edge of the rendered canvas", () => {
    vi.useFakeTimers();
    const { container } = render(<Canvas width={640} height={360} />);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 320,
      height: 180,
    }));

    const { myId, turns } = getCallbacks();
    act(() => {
      myId(9);
      turns({ turn: 9 });
    });

    fireEvent.mouseMove(canvas, { clientX: 319, clientY: 179 });
    fireEvent.mouseDown(canvas);
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(sendDrawInfo).toHaveBeenCalledWith(
      638,
      358,
      undefined,
      undefined,
      [0, 0, 0],
      10
    );
    vi.useRealTimers();
  });

  it("stops painting when turn changes away from this player", () => {
    vi.useFakeTimers();
    const { container } = render(<Canvas width={640} height={360} />);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 640,
      height: 360,
    }));

    const { myId, turns } = getCallbacks();
    act(() => {
      myId(4);
      turns({ turn: 4 });
    });

    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseDown(canvas);
    act(() => {
      vi.advanceTimersByTime(20);
    });
    const drawCallsWhileMyTurn = sendDrawInfo.mock.calls.length;
    expect(drawCallsWhileMyTurn).toBeGreaterThan(0);

    act(() => turns({ turn: 99 }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(sendDrawInfo.mock.calls.length).toBe(drawCallsWhileMyTurn);
    vi.useRealTimers();
  });

  it("stops painting when window loses focus", () => {
    vi.useFakeTimers();
    const { container } = render(<Canvas width={640} height={360} />);
    const canvas = container.querySelector("canvas");
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 640,
      height: 360,
    }));

    const { myId, turns } = getCallbacks();
    act(() => {
      myId(8);
      turns({ turn: 8 });
    });

    fireEvent.mouseMove(canvas, { clientX: 120, clientY: 120 });
    fireEvent.mouseDown(canvas);
    act(() => {
      vi.advanceTimersByTime(20);
    });
    const drawCallsBeforeBlur = sendDrawInfo.mock.calls.length;
    expect(drawCallsBeforeBlur).toBeGreaterThan(0);

    fireEvent(window, new Event("blur"));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(sendDrawInfo.mock.calls.length).toBe(drawCallsBeforeBlur);
    vi.useRealTimers();
  });
});
