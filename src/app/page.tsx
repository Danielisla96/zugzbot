"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotesList } from "@/components/blocks/NotesList";
import { NoteEditor } from "@/components/blocks/NoteEditor";
import { useToast } from "@/hooks/useToast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Note, SortBy, NoteColor } from "@/types";

const STORAGE_KEY = "notas-app";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filteredCount, setFilteredCount] = useState(0);
  const [_deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const deleteTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const { toasts, addToast, removeToast } = useToast();
  const activeNoteId = editingNote?.id ?? null;

  useEffect(() => {
    setNotes(loadNotes());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveNotes(notes);
  }, [notes, loaded]);

  useEffect(() => {
    return () => {
      deleteTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      deleteTimeoutsRef.current.clear();
    };
  }, []);

  const handleCreateNew = useCallback(() => {
    setEditingNote(null);
    setIsEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingNote(null);
  }, []);

  const handleSearchFocus = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]');
    searchInput?.focus();
  }, []);

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: { id?: string; title: string; content: string; color?: NoteColor }) => {
      const now = new Date().toISOString();
      if (data.id) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === data.id ? { ...n, title: data.title, content: data.content, color: data.color || n.color || "none", updatedAt: now } : n
          )
        );
      } else {
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: data.title,
          content: data.content,
          favorite: false,
          pinned: false,
          color: data.color || "none",
          createdAt: now,
          updatedAt: now,
        };
        setNotes((prev) => [newNote, ...prev]);
      }
      setTimeout(() => addToast(data.id ? "Nota actualizada correctamente" : "Nota creada correctamente", "success"), 0);
    },
    [addToast]
  );

  const restoreNote = useCallback((note: Note) => {
    setDeletedNotes((prev) => prev.filter((n) => n.id !== note.id));
    setNotes((prev) => [note, ...prev]);
    const timeout = deleteTimeoutsRef.current.get(note.id);
    if (timeout) {
      clearTimeout(timeout);
      deleteTimeoutsRef.current.delete(note.id);
    }
    addToast("Nota restaurada", "success");
  }, [addToast]);

  const handleDelete = useCallback((id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    setDeletedNotes((prev) => [...prev, noteToDelete]);
    setNotes((prev) => prev.filter((n) => n.id !== id));

    addToast("Nota eliminada", "info", {
      label: "Deshacer",
      onClick: () => restoreNote(noteToDelete),
    });

    const timeout = setTimeout(() => {
      setDeletedNotes((prev) => prev.filter((n) => n.id !== id));
      deleteTimeoutsRef.current.delete(id);
    }, 5000);
    deleteTimeoutsRef.current.set(id, timeout);
  }, [notes, addToast, restoreNote]);

  const handleTogglePin = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
      );
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      const newFavorite = !note?.favorite;
      setTimeout(() => addToast(newFavorite ? "Añadida a favoritos" : "Eliminada de favoritos", "success"), 0);
      return prev.map((n) =>
        n.id === id ? { ...n, favorite: newFavorite, updatedAt: new Date().toISOString() } : n
      );
    });
  }, [addToast]);

  useKeyboardShortcuts(
    {
      onCreateNew: handleCreateNew,
      onCloseEditor: handleCloseEditor,
      onDeleteNote: handleDelete,
      onSearchFocus: handleSearchFocus,
    },
    isEditorOpen,
    activeNoteId
  );

  return (
    <AppLayout
      notesCount={notes.length}
      filteredNotesCount={filteredCount}
      searchActive={filteredCount !== notes.length}
      toasts={toasts}
      onRemoveToast={removeToast}
    >
      <NotesList
        notes={notes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={handleTogglePin}
        onCreateNew={handleCreateNew}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onFilteredCountChange={setFilteredCount}
      />
      <NoteEditor
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
