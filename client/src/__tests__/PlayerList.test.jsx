import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("../skribble/api", () => ({
  subscribeToPlayerList: vi.fn(),
  subscribeToTurns: vi.fn(),
}));

import { subscribeToPlayerList, subscribeToTurns } from "../skribble/api";
import PlayerList from "../skribble/components/PlayerList";

beforeEach(() => {
  subscribeToPlayerList.mockClear();
  subscribeToTurns.mockClear();
});

const getCallbacks = () => ({
  playerList: subscribeToPlayerList.mock.calls[0][0],
  turns: subscribeToTurns.mock.calls[0][0],
});

describe("PlayerList", () => {
  it("renders nothing when the list is empty", () => {
    const { container } = render(<PlayerList />);
    expect(container.querySelectorAll(".list-group-item")).toHaveLength(0);
  });

  it("renders player names from the initial player-list event", () => {
    render(<PlayerList />);
    const { playerList } = getCallbacks();
    act(() =>
      playerList({
        type: "playerList",
        list: [
          { id: 0, username: "alice" },
          { id: 1, username: "bob" },
        ],
      })
    );
    expect(screen.getByText(/alice/)).toBeInTheDocument();
    expect(screen.getByText(/bob/)).toBeInTheDocument();
  });

  it("adds a newly joined player", () => {
    render(<PlayerList />);
    const { playerList } = getCallbacks();
    act(() => playerList({ type: "playerJoin", username: "carol", id: 2 }));
    expect(screen.getByText(/carol/)).toBeInTheDocument();
  });

  it("removes a player who leaves", () => {
    render(<PlayerList />);
    const { playerList } = getCallbacks();
    act(() =>
      playerList({
        type: "playerList",
        list: [
          { id: 0, username: "alice" },
          { id: 1, username: "bob" },
        ],
      })
    );
    act(() => playerList({ type: "playerLeave", id: 0 }));
    expect(screen.queryByText(/alice/)).not.toBeInTheDocument();
    expect(screen.getByText(/bob/)).toBeInTheDocument();
  });

  it("marks the current drawer with a 'Currently drawing' label", () => {
    render(<PlayerList />);
    const { playerList, turns } = getCallbacks();
    act(() =>
      playerList({
        type: "playerList",
        list: [
          { id: 0, username: "alice" },
          { id: 1, username: "bob" },
        ],
      })
    );
    act(() => turns({ turn: 0 }));
    expect(screen.getByText(/currently drawing/i)).toBeInTheDocument();
  });

  it("shows a green background for a player who guessed correctly", () => {
    const { container } = render(<PlayerList />);
    const { playerList } = getCallbacks();
    act(() =>
      playerList({
        type: "playerList",
        list: [{ id: 0, username: "alice" }],
      })
    );
    act(() => playerList({ type: "playerGuessed", playerId: 0 }));
    const item = container.querySelector(".list-group-item");
    expect(item).toHaveStyle({ backgroundColor: "#00FF00" });
  });

  it("resets guessed state on a new turn", () => {
    const { container } = render(<PlayerList />);
    const { playerList } = getCallbacks();
    act(() =>
      playerList({
        type: "playerList",
        list: [{ id: 0, username: "alice" }],
      })
    );
    act(() => playerList({ type: "playerGuessed", playerId: 0 }));
    act(() => playerList({ type: "newTurn", turn: 0 }));
    const item = container.querySelector(".list-group-item");
    expect(item).not.toHaveStyle({ backgroundColor: "#00FF00" });
  });
});
