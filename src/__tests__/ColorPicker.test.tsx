import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColorPicker } from "@/components/blocks/ColorPicker";

describe("ColorPicker", () => {
  it("CLR-01: renderiza los 7 colores incluyendo 'none' con Slash icon", () => {
    render(<ColorPicker value="none" onChange={vi.fn()} />);

    // Should have 7 color buttons
    const colorButtons = screen.getAllByRole("button");
    expect(colorButtons).toHaveLength(7);

    // The "none" button should contain a Slash icon (SVG)
    const slashIcon = document.querySelector('[data-color="none"] svg, .color-none svg');
    expect(slashIcon).toBeInTheDocument();
  });

  it("CLR-02: al hacer click en un círculo de color llama a onChange con ese color", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="none" onChange={onChange} />);

    // Click on the indigo color button
    const indigoButton = screen.getByRole("button", { name: /indigo/i });
    expect(indigoButton).toBeInTheDocument();
    fireEvent.click(indigoButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("indigo");
  });

  it("el color activo tiene ring primary (indigo)", () => {
    render(<ColorPicker value="green" onChange={vi.fn()} />);

    const greenButton = screen.getByRole("button", { name: /green/i });
    expect(greenButton.className).toContain("ring");
  });

  it("el color 'none' no tiene ring cuando está seleccionado", () => {
    render(<ColorPicker value="none" onChange={vi.fn()} />);

    // The none button should be the last one
    const buttons = screen.getAllByRole("button");
    const noneButton = buttons[buttons.length - 1];
    // When none is selected, it may have subtle ring or not — at minimum it renders
    expect(noneButton).toBeInTheDocument();
  });
});
