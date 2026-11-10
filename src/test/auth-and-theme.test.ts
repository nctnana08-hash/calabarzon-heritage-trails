import { describe, it, expect, beforeEach } from "vitest";
import { getStoredTheme, applyTheme } from "@/hooks/use-theme";

describe("Theme and Authentication Utilities", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("defaults to light theme when nothing is stored", () => {
    const theme = getStoredTheme();
    expect(theme).toBe("light");
  });

  it("applies dark mode class to document element", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
