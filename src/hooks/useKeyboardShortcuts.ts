"use client";

import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onCreateNew: () => void;
  onCloseEditor: () => void;
  onDeleteNote: (id: string) => void;
  onSearchFocus: () => void;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  isEditorOpen: boolean,
  activeNoteId: string | null = null
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      switch (e.key) {
        case "n":
          if (!isInputFocused) {
            handlers.onCreateNew();
          }
          break;

        case "Escape":
          if (isEditorOpen) {
            handlers.onCloseEditor();
          }
          break;

        case "Delete":
          if (isEditorOpen && !isInputFocused && activeNoteId) {
            handlers.onDeleteNote(activeNoteId);
          }
          break;

        case "f": {
          const isMac = navigator.platform.includes("Mac");
          if (isMac ? e.metaKey : e.ctrlKey) {
            e.preventDefault();
            handlers.onSearchFocus();
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers, isEditorOpen, activeNoteId]);
}
