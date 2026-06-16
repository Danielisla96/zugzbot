"use client";
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NoteCard } from "./NoteCard";
import { EmptyState } from "./EmptyState";
import { SortControls } from "./SortControls";
import { Note, SortBy } from "@/types";

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCreateNew: () => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  onFilteredCountChange: (count: number) => void;
}

export function NotesList({ notes, onEdit, onDelete, onToggleFavorite, onCreateNew, sortBy, onSortChange, onFilteredCountChange }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "oldest":
        return a.updatedAt.localeCompare(b.updatedAt);
      case "a-z":
        return a.title.localeCompare(b.title);
      case "favorites-first":
        if (a.favorite !== b.favorite) {
          return b.favorite ? 1 : -1;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      default:
        return 0;
    }
  });

  useEffect(() => {
    onFilteredCountChange(sorted.length);
  }, [sorted.length, onFilteredCountChange]);

  if (notes.length === 0 && !searchQuery) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-base"
          />
        </div>
        <Button onClick={onCreateNew} className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-active)] text-white shrink-0">
          <Plus className="size-4 mr-1" /> Nueva nota
        </Button>
      </div>

      <SortControls sortBy={sortBy} onSortChange={onSortChange} />

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron notas para &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
