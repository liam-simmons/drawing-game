import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom doesn't implement canvas — provide a minimal stub so Canvas can mount.
// Return the SAME mock context for a given canvas element so that tests can
// grab the context before calling component methods and then assert on it.
HTMLCanvasElement.prototype.getContext = vi.fn(function () {
  if (!this._mockCtx) {
    this._mockCtx = {
      fillStyle: "",
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8Array(4) })),
      putImageData: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    };
  }
  return this._mockCtx;
});
