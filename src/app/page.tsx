"use client";
import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotesList } from "@/components/blocks/NotesList";
import { NoteEditor } from "@/components/blocks/NoteEditor";
import type { Note } from "@/types";

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

  useEffect(() => {
    setNotes(loadNotes());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveNotes(notes);
  }, [notes, loaded]);

  const handleCreateNew = useCallback(() => {
    setEditingNote(null);
    setIsEditorOpen(true);
  }, []);

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: { id?: string; title: string; content: string }) => {
      const now = new Date().toISOString();
      if (data.id) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === data.id ? { ...n, title: data.title, content: data.content, updatedAt: now } : n
          )
        );
      } else {
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: data.title,
          content: data.content,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        };
        setNotes((prev) => [newNote, ...prev]);
      }
    },
    []
  );

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("¿Eliminar esta nota?")) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, favorite: !n.favorite, updatedAt: new Date().toISOString() } : n
      )
    );
  }, []);

  return (
    <AppLayout>
      <NotesList
        notes={notes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onCreateNew={handleCreateNew}
      />
      <NoteEditor
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
