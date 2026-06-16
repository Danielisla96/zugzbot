import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// NOTE: This file tests the useToast hook (TS-01, TS-02).
// The hook will be implemented in src/hooks/useToast.ts
// These tests validate the contract behavior: addToast creates a toast,
// removeToast removes it, and the module-level state is shared.

// The type below mirrors the Toast interface the coder must export from @/types
interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "destructive";
  createdAt: number;
}

interface UseToastReturn {
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "info" | "destructive") => string;
  removeToast: (id: string) => void;
}

// Import mock — the real hook is implemented by the coder.
// We test against the actual import path.
import { useToast } from "@/hooks/useToast";

describe("Toast Hook (Contract Scenarios TS-01, TS-02)", () => {
  beforeEach(() => {
    // Clear all toasts between tests by removing all toasts
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toasts.forEach((toast: Toast) => result.current.removeToast(toast.id));
    });
  });

  it("TS-01: addToast crea un toast con message y type correctos", () => {
    const { result } = renderHook(() => useToast());

    // Given: hook inicializado con toasts vacío
    expect(result.current.toasts).toHaveLength(0);

    // When: se llama a addToast
    act(() => {
      result.current.addToast("Nota creada correctamente", "success");
    });

    // Then: toasts contiene el nuevo item
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe(
      "Nota creada correctamente",
    );
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].id).toBeDefined();
    expect(typeof result.current.toasts[0].id).toBe("string");
    expect(result.current.toasts[0].id.length).toBeGreaterThan(0);
    expect(result.current.toasts[0].createdAt).toBeDefined();
    expect(typeof result.current.toasts[0].createdAt).toBe("number");
  });

  it("TS-01b: addToast sin type usa 'info' por defecto", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Nota actualizada");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("info");
  });

  it("TS-02: removeToast elimina un toast por su id", () => {
    const { result } = renderHook(() => useToast());

    // Given: existe un toast
    let toastId = "";
    act(() => {
      toastId = result.current.addToast("Nota eliminada", "destructive");
    });
    expect(result.current.toasts).toHaveLength(1);

    // When: se llama removeToast con ese id
    act(() => {
      result.current.removeToast(toastId);
    });

    // Then: el array ya no contiene ese toast
    expect(result.current.toasts).toHaveLength(0);
    expect(
      result.current.toasts.find((toast: Toast) => toast.id === toastId),
    ).toBeUndefined();
  });

  it("TS-02b: removeToast con id inexistente no lanza error", () => {
    const { result } = renderHook(() => useToast());

    // Given: un toast existente
    act(() => {
      result.current.addToast("Test toast");
    });
    expect(result.current.toasts).toHaveLength(1);

    // When/Then: eliminar un id que no existe no causa error
    expect(() => {
      act(() => {
        result.current.removeToast("non-existent-id");
      });
    }).not.toThrow();

    // El toast original sigue existiendo
    expect(result.current.toasts).toHaveLength(1);
  });
});
