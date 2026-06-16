import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/hooks/useToast";

describe("useToast Tests (Undo Delete Contract Scenarios)", () => {
  // Clear shared singleton state between tests
  beforeEach(() => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toasts.forEach((t) => result.current.removeToast(t.id));
    });
  });

  // TS-01 (Undo Delete): addToast con action guarda la acción en el objeto Toast
  // Given: el hook useToast está disponible
  // When: se llama addToast('Nota eliminada', 'info', { label: 'Deshacer', onClick: () => {} })
  // Then: el toast retornado incluye la propiedad action con label 'Deshacer' y la función onClick
  it("TS-01: addToast con action guarda la acción en el objeto Toast", () => {
    const { result } = renderHook(() => useToast());
    const onClick = vi.fn();

    act(() => {
      result.current.addToast("Nota eliminada", "info", {
        label: "Deshacer",
        onClick,
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    const toast = result.current.toasts[0];
    expect(toast.message).toBe("Nota eliminada");
    expect(toast.type).toBe("info");
    expect(toast.action).toBeDefined();
    expect(toast.action!.label).toBe("Deshacer");
    expect(toast.action!.onClick).toBe(onClick);
  });

  // TS-01b: addToast sin action no incluye la propiedad action
  it("TS-01b: addToast sin action no incluye action", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Nota creada", "success");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].action).toBeUndefined();
  });

  // TS-02 (Undo Delete - removeToast consistency): removeToast sigue funcionando con toasts que tienen action
  it("TS-02: removeToast funciona con toasts que tienen action", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Nota eliminada", "info", {
        label: "Deshacer",
        onClick: vi.fn(),
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.removeToast(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});
