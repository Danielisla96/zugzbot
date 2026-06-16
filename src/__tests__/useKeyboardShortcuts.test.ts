import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let handlers: ReturnType<typeof vi.fn>[];

  beforeEach(() => {
    handlers = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fireKeydown(key: string, options: { target?: HTMLElement; metaKey?: boolean; ctrlKey?: boolean } = {}) {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      metaKey: options.metaKey ?? false,
      ctrlKey: options.ctrlKey ?? false,
    });
    // Override target if provided
    if (options.target) {
      Object.defineProperty(event, "target", { value: options.target, writable: false });
    }
    window.dispatchEvent(event);
    return event;
  }

  it("TS-01: Tecla 'n' llama a onCreateNew cuando no hay foco en input", () => {
    const onCreateNew = vi.fn();
    const onCloseEditor = vi.fn();
    const onDeleteNote = vi.fn();
    const onSearchFocus = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts(
        { onCreateNew, onCloseEditor, onDeleteNote, onSearchFocus },
        false
      )
    );

    fireKeydown("n");

    expect(onCreateNew).toHaveBeenCalledTimes(1);
    expect(onCloseEditor).not.toHaveBeenCalled();
    expect(onDeleteNote).not.toHaveBeenCalled();
    expect(onSearchFocus).not.toHaveBeenCalled();
  });

  it("TS-02: Tecla 'n' NO llama a onCreateNew cuando un input tiene foco", () => {
    const onCreateNew = vi.fn();
    const onCloseEditor = vi.fn();
    const onDeleteNote = vi.fn();
    const onSearchFocus = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts(
        { onCreateNew, onCloseEditor, onDeleteNote, onSearchFocus },
        false
      )
    );

    const input = document.createElement("input");
    fireKeydown("n", { target: input });

    expect(onCreateNew).not.toHaveBeenCalled();
  });

  it("TS-02b: Tecla 'n' NO llama a onCreateNew cuando un textarea tiene foco", () => {
    const onCreateNew = vi.fn();
    const onCloseEditor = vi.fn();
    const onDeleteNote = vi.fn();
    const onSearchFocus = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts(
        { onCreateNew, onCloseEditor, onDeleteNote, onSearchFocus },
        false
      )
    );

    const textarea = document.createElement("textarea");
    fireKeydown("n", { target: textarea });

    expect(onCreateNew).not.toHaveBeenCalled();
  });

  it("TS-02c: Tecla 'n' NO llama a onCreateNew cuando un contenteditable tiene foco", () => {
    const onCreateNew = vi.fn();
    const onCloseEditor = vi.fn();
    const onDeleteNote = vi.fn();
    const onSearchFocus = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts(
        { onCreateNew, onCloseEditor, onDeleteNote, onSearchFocus },
        false
      )
    );

    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    fireKeydown("n", { target: editable });

    expect(onCreateNew).not.toHaveBeenCalled();
  });

  it("TS-03: Escape llama a onCloseEditor cuando editor está abierto, pero no cuando está cerrado", () => {
    const onCreateNew = vi.fn();
    const onCloseEditor = vi.fn();
    const onDeleteNote = vi.fn();
    const onSearchFocus = vi.fn();

    const { rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) =>
        useKeyboardShortcuts(
          { onCreateNew, onCloseEditor, onDeleteNote, onSearchFocus },
          isOpen
        ),
      { initialProps: { isOpen: true } }
    );

    // With editor open, Escape should call onCloseEditor
    fireKeydown("Escape");
    expect(onCloseEditor).toHaveBeenCalledTimes(1);

    onCloseEditor.mockClear();

    // Now set isEditorOpen to false
    rerender({ isOpen: false });
    fireKeydown("Escape");
    expect(onCloseEditor).not.toHaveBeenCalled();
  });

  it("TS-04: Cleanup remueve event listeners al desmontar el hook", () => {
    const onCreateNew = vi.fn();
    const onCloseEditor = vi.fn();
    const onDeleteNote = vi.fn();
    const onSearchFocus = vi.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts(
        { onCreateNew, onCloseEditor, onDeleteNote, onSearchFocus },
        false
      )
    );

    // Unmount the hook
    unmount();

    // Fire keydown after unmount
    fireKeydown("n");
    fireKeydown("Escape");
    fireKeydown("Delete");

    expect(onCreateNew).not.toHaveBeenCalled();
    expect(onCloseEditor).not.toHaveBeenCalled();
    expect(onDeleteNote).not.toHaveBeenCalled();
  });
});
