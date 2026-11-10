import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KrpanoViewer } from "@/components/krpano-viewer";

describe("KrpanoViewer mobile full-screen 360 view", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enters and exits full-viewport 360 mode on mobile browsers without native requestFullscreen (iOS Safari / WebViews)", () => {
    const { container } = render(<KrpanoViewer />);
    const stage = container.firstElementChild as HTMLElement;

    expect(stage.className).not.toContain("krpano-fullscreen-stage");

    const openBtn = screen.getByRole("button", { name: /open full screen 360 view/i });
    fireEvent.click(openBtn);

    expect(stage.className).toContain("krpano-fullscreen-stage");
    expect(document.body.style.overflow).toBe("hidden");

    const exitBtn = screen.getByRole("button", { name: /exit full screen 360 view/i });
    fireEvent.click(exitBtn);

    expect(stage.className).not.toContain("krpano-fullscreen-stage");
    expect(document.body.style.overflow).toBe("");
  });

  it("allows exiting mobile pseudo-fullscreen with Escape and via the bottom dock button", () => {
    const { container } = render(<KrpanoViewer />);
    const stage = container.firstElementChild as HTMLElement;

    const dockToggle = screen.getByRole("button", { name: /toggle fullscreen/i });
    fireEvent.click(dockToggle);
    expect(stage.className).toContain("krpano-fullscreen-stage");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(stage.className).not.toContain("krpano-fullscreen-stage");
  });
});
