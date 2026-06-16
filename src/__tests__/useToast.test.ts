import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useToast } from "@/hooks/useToast";

describe("useToast", () => {
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

  it("addToast sin action no incluye action en el Toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast("Nota creada", "success");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].action).toBeUndefined();
  });

  it("removeToast sigue funcionando con toasts que tienen action", () => {
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

  it("addToast con action retorna un id string válido", () => {
    const { result } = renderHook(() => useToast());

    let id = "";
    act(() => {
      id = result.current.addToast("Test", "info", {
        label: "Deshacer",
        onClick: vi.fn(),
      });
    });

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    expect(result.current.toasts[0].id).toBe(id);
  });
});
