import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToastContainer } from "@/components/blocks/ToastContainer";
import type { Toast } from "@/hooks/useToast";

function makeToast(
  overrides: Partial<Toast> & { action?: Toast["action"] } = {}
): Toast {
  return {
    id: "test-1",
    message: "Nota eliminada",
    type: "info",
    createdAt: Date.now(),
    ...overrides,
  };
}

describe("ToastContainer", () => {
  it("TS-02: renderiza botón de acción cuando toast tiene action", () => {
    const toasts = [
      makeToast({
        action: { label: "Deshacer", onClick: vi.fn() },
      }),
    ];

    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />);

    const btn = screen.getByText("Deshacer");
    expect(btn).toBeInTheDocument();
    // The action button should have underline and text-xs styles
    expect(btn.className).toContain("underline");
    expect(btn.className).toContain("text-xs");
  });

  it("TS-03: el botón de acción ejecuta onClick al ser clickeado", () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const toasts = [
      makeToast({
        id: "test-action-1",
        action: { label: "Deshacer", onClick },
      }),
    ];

    render(<ToastContainer toasts={toasts} onRemove={onRemove} />);

    const btn = screen.getByText("Deshacer");
    fireEvent.click(btn);

    // onClick should fire exactly once
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("TS-04: toast sin action no renderiza botón extra y mantiene estructura original", () => {
    const toasts = [
      makeToast({ type: "success", message: "Nota creada", action: undefined }),
    ];

    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />);

    // The message is rendered
    expect(screen.getByText("Nota creada")).toBeInTheDocument();

    // There should be no "Deshacer" button
    expect(screen.queryByText("Deshacer")).not.toBeInTheDocument();

    // The close button (X icon wrapped in Shadcn Button) should still exist
    const closeButton = document.querySelector("button");
    expect(closeButton).toBeInTheDocument();
  });

  it("renderiza múltiples toasts y solo los que tienen action muestran el botón", () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const toasts = [
      makeToast({
        id: "t1",
        message: "Nota eliminada",
        action: { label: "Deshacer", onClick },
      }),
      makeToast({
        id: "t2",
        message: "Nota actualizada",
        type: "success",
        action: undefined,
      }),
    ];

    render(<ToastContainer toasts={toasts} onRemove={onRemove} />);

    expect(screen.getByText("Nota eliminada")).toBeInTheDocument();
    expect(screen.getByText("Nota actualizada")).toBeInTheDocument();
    expect(screen.getByText("Deshacer")).toBeInTheDocument();

    // Clicking Deshacer on the first toast
    fireEvent.click(screen.getByText("Deshacer"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
