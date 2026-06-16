import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotesList } from "@/components/blocks/NotesList";
import type { Note, NoteColor, SortBy } from "@/types";

// Mock NoteCard to simplify assertions about order
vi.mock("@/components/blocks/NoteCard", () => ({
  NoteCard: ({ note }: { note: Note }) => (
    <div data-testid={`note-card-${note.id}`} data-pinned={note.pinned ? "true" : "false"}>
      {note.title || "Sin título"}
    </div>
  ),
}));

function makeNote(id: string, overrides: Partial<Note> = {}): Note {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  return {
    id,
    title: `Nota ${id}`,
    content: "Contenido de prueba",
    favorite: false,
    pinned: false,
    createdAt: fiveMinAgo,
    updatedAt: fiveMinAgo,
    ...overrides,
  };
}

function renderNotesList(notes: Note[], sortBy: SortBy = "newest") {
  return render(
    <NotesList
      notes={notes}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onToggleFavorite={vi.fn()}
      onTogglePin={vi.fn()}
      onCreateNew={vi.fn()}
      sortBy={sortBy}
      onSortChange={vi.fn()}
      onFilteredCountChange={vi.fn()}
    />
  );
}

describe("NotesList", () => {
  it("TS-03: Notas pinned aparecen primero con sortBy='newest'", () => {
    const notes = [
      makeNote("old", { pinned: false, updatedAt: "2026-01-01T00:00:00Z" }),
      makeNote("pinned-old", { pinned: true, updatedAt: "2026-01-02T00:00:00Z" }),
      makeNote("pinned-new", { pinned: true, updatedAt: "2026-06-15T00:00:00Z" }),
      makeNote("recent", { pinned: false, updatedAt: "2026-06-16T00:00:00Z" }),
    ];

    renderNotesList(notes, "newest");

    const cards = screen.getAllByTestId(/^note-card-/);
    const cardIds = cards.map((c) => c.getAttribute("data-testid"));

    // Find positions of pinned vs non-pinned
    const pinnedIndexes = cardIds
      .map((id, i) => (id && notes.find((n) => `note-card-${n.id}` === id && n.pinned) ? i : -1))
      .filter((i) => i !== -1);
    const nonPinnedIndexes = cardIds
      .map((id, i) => (id && notes.find((n) => `note-card-${n.id}` === id && !n.pinned) ? i : -1))
      .filter((i) => i !== -1);

    // All pinned should come before any non-pinned
    expect(Math.max(...pinnedIndexes)).toBeLessThan(Math.min(...nonPinnedIndexes));
  });

  it("CLR-05: Filtra correctamente por color 'green'", () => {
    const notes = [
      makeNote("green-1", { color: "green" as NoteColor }),
      makeNote("indigo-1", { color: "indigo" as NoteColor }),
      makeNote("no-color", { color: "none" as NoteColor }),
    ];

    renderNotesList(notes, "newest");

    // Click on the green filter pill/button
    const greenFilter = screen.getByRole("button", { name: /green/i });
    fireEvent.click(greenFilter);

    // Only the green note should be visible
    expect(screen.getByTestId("note-card-green-1")).toBeInTheDocument();
    expect(screen.queryByTestId("note-card-indigo-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("note-card-no-color")).not.toBeInTheDocument();
  });

  it("CLR-05b: Filtro 'Todas' muestra todas las notas", () => {
    const notes = [
      makeNote("note-a", { color: "indigo" as NoteColor }),
      makeNote("note-b", { color: "green" as NoteColor }),
    ];

    renderNotesList(notes, "newest");

    // Default filter shows all
    expect(screen.getByTestId("note-card-note-a")).toBeInTheDocument();
    expect(screen.getByTestId("note-card-note-b")).toBeInTheDocument();
  });

  it("TS-04: Ordenamiento pinned-first con sortBy='favorites-first'", () => {
    const notes = [
      makeNote("fav-pinned", { favorite: true, pinned: true }),
      makeNote("no-fav-pinned", { favorite: false, pinned: true }),
      makeNote("fav-unpinned", { favorite: true, pinned: false }),
      makeNote("no-fav-unpinned", { favorite: false, pinned: false }),
    ];

    renderNotesList(notes, "favorites-first");

    const cards = screen.getAllByTestId(/^note-card-/);

    // First 2 should be pinned
    expect(cards[0]).toHaveAttribute("data-pinned", "true");
    expect(cards[1]).toHaveAttribute("data-pinned", "true");
    // Last 2 should be unpinned
    expect(cards[2]).toHaveAttribute("data-pinned", "false");
    expect(cards[3]).toHaveAttribute("data-pinned", "false");
  });
});
