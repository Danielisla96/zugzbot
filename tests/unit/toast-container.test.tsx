import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastContainer } from "@/components/blocks/ToastContainer";
import type { Toast } from "@/types";

// Mock lucide-react icons used by ToastContainer
vi.mock("lucide-react", () => ({
  CheckCircle2: () => <div data-testid="icon-checkcircle" />,
  Info: () => <div data-testid="icon-info" />,
  XCircle: () => <div data-testid="icon-xcircle" />,
  X: () => <div data-testid="icon-x" />,
}));

describe("ToastContainer (Contract Scenario TS-03)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const createMockToast = (
    overrides: Partial<Toast> = {},
  ): Toast => ({
    id: "toast-1",
    message: "Nota creada correctamente",
    type: "success",
    createdAt: Date.now(),
    ...overrides,
  });

  it("TS-03: Auto-dismiss dispara removeToast después de 3000ms", () => {
    const onRemove = vi.fn();
    const toast = createMockToast();

    // Given: se ha añadido un toast
    render(
      <ToastContainer toasts={[toast]} onRemove={onRemove} />,
    );

    // El toast es visible
    expect(screen.getByText("Nota creada correctamente")).toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();

    // When: avanzamos 2500ms (aún no debe dispararse)
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(onRemove).not.toHaveBeenCalled();

    // When: avanzamos otros 1000ms (total 3500ms, ya pasaron 3000ms desde created)
    // Nota: se cuentan 3000ms desde createdAt (Date.now())
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Then: removeToast se llamó con el id del toast
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("toast-1");
  });

  it("TS-03b: ToastContainer renderiza el toast con el mensaje e icono correctos", () => {
    const onRemove = vi.fn();
    const toast = createMockToast({
      message: "Nota eliminada",
      type: "destructive",
    });

    render(
      <ToastContainer toasts={[toast]} onRemove={onRemove} />,
    );

    // El mensaje se muestra
    expect(screen.getByText("Nota eliminada")).toBeInTheDocument();
    // El icono X existe (botón de cierre manual)
    expect(screen.getByTestId("icon-x")).toBeInTheDocument();
  });

  it("TS-03c: Botón de cierre manual elimina el toast inmediatamente", () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ id: "toast-manual" });

    render(
      <ToastContainer toasts={[toast]} onRemove={onRemove} />,
    );

    // When: el usuario hace clic en el botón de cierre
    const closeButton = screen.getByTestId("icon-x").closest("button");
    expect(closeButton).toBeDefined();
    closeButton!.click();

    // Then: removeToast se llamó inmediatamente
    expect(onRemove).toHaveBeenCalledWith("toast-manual");
  });

  it("TS-03d: ToastContainer con toasts vacío no renderiza nada", () => {
    const { container } = render(
      <ToastContainer toasts={[]} onRemove={vi.fn()} />,
    );

    // No debe haber contenido visible
    expect(container.textContent).toBe("");
  });
});
