"use client";
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NoteCard } from "./NoteCard";
import { EmptyState } from "./EmptyState";
import { SortControls } from "./SortControls";
import { Note, SortBy, NoteColor } from "@/types";
import { NOTE_COLORS } from "@/lib/colors";

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onCreateNew: () => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  onFilteredCountChange: (count: number) => void;
}

export function NotesList({ notes, onEdit, onDelete, onToggleFavorite, onTogglePin, onCreateNew, sortBy, onSortChange, onFilteredCountChange }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<NoteColor | null>(null);

  const filtered = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const colorFiltered = colorFilter
    ? filtered.filter((n) => n.color === colorFilter)
    : filtered;

  const sortFn = (a: Note, b: Note) => {
    switch (sortBy) {
      case "newest":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "oldest":
        return a.updatedAt.localeCompare(b.updatedAt);
      case "a-z":
        return a.title.localeCompare(b.title);
      case "favorites-first":
        if (a.favorite !== b.favorite) {
          return a.favorite ? -1 : 1;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      default:
        return 0;
    }
  };

  const sorted = [
    ...colorFiltered.filter((n) => n.pinned).sort(sortFn),
    ...colorFiltered.filter((n) => !n.pinned).sort(sortFn),
  ];

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

      {/* Color filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setColorFilter(null)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            colorFilter === null
              ? "bg-[#5e6ad2] text-white"
              : "text-muted-foreground border border-border/50 hover:border-border"
          }`}
        >
          Todas
        </button>
        {(["indigo","orange","green","red","purple","gray"] as NoteColor[]).map((c) => (
          <button
            key={c}
            onClick={() => setColorFilter(c)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              colorFilter === c
                ? "bg-[#5e6ad2] text-white"
                : "text-muted-foreground border border-border/50 hover:border-border"
            }`}
          >
            <span className={`size-2.5 rounded-full ${NOTE_COLORS[c].dot}`} />
            {NOTE_COLORS[c].label}
          </button>
        ))}
      </div>

      <SortControls sortBy={sortBy} onSortChange={onSortChange} />

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron notas para &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onTogglePin={onTogglePin}
              style={{ transitionDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
