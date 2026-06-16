import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortControls } from "@/components/blocks/SortControls";

// Mock lucide-react icons used by SortControls
vi.mock("lucide-react", () => ({
  ArrowUpDown: () => <div data-testid="icon-arrow-up-down" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ArrowUpAZ: () => <div data-testid="icon-arrow-up-az" />,
  Star: () => <div data-testid="icon-star" />,
}));

describe("SortControls Tests (Contract Scenarios)", () => {
  // ANIM-03: SortControls tiene animación de entrada y hover scale(1.05)
  it("ANIM-03: SortControls tiene animación de entrada y hover scale(1.05)", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();

    // Given: SortControls se renderiza con sortBy='newest'
    const { container } = render(
      <SortControls sortBy="newest" onSortChange={onSortChange} />
    );

    // Then: el contenedor tiene clase 'animate-fade-slide-up-fast'
    const wrapperDiv = container.firstChild as HTMLElement;
    expect(wrapperDiv.className).toContain("animate-fade-slide-up-fast");

    // Then: cada botón tiene hover:scale-105 y transition-all duration-200 ease-out
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
    buttons.forEach((btn) => {
      expect(btn.className).toContain("hover:scale-105");
      expect(btn.className).toContain("transition-all");
      expect(btn.className).toContain("duration-200");
      expect(btn.className).toContain("ease-out");
    });

    // Then: mantiene la funcionalidad de cambio de sort activo
    const azButton = screen.getByRole("button", { name: /a-z/i });
    await user.click(azButton);
    expect(onSortChange).toHaveBeenCalledWith("a-z");
  });
});
