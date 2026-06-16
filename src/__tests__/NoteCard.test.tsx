import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NoteCard } from "@/components/blocks/NoteCard";
import type { Note } from "@/types";

function makeNote(overrides: Partial<Note> = {}): Note {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  return {
    id: "note-1",
    title: "Mi nota",
    content: "Hola mundo esto es un test",
    favorite: false,
    createdAt: fiveMinAgo,
    updatedAt: fiveMinAgo,
    ...overrides,
  };
}

describe("NoteCard", () => {
  it("TS-01: renderiza con título, contenido, fecha relativa y word count badge", () => {
    const note = makeNote({
      title: "Mi nota",
      content: "Hola mundo esto es un test",
    });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText("Mi nota")).toBeInTheDocument();

    // Content preview appears (at least part of it)
    expect(screen.getByText(/Hola mundo esto es un test/)).toBeInTheDocument();

    // Relative date: "hace 5 min" should be rendered
    expect(screen.getByText(/hace 5 min/)).toBeInTheDocument();

    // Word count badge: 5 words in "Hola mundo esto es un test"
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("TS-02: muestra 'Sin título' en italic cuando title está vacío", () => {
    const note = makeNote({ title: "", content: "contenido válido" });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    const sinTitulo = screen.getByText("Sin título");
    expect(sinTitulo).toBeInTheDocument();
    expect(sinTitulo.className).toContain("italic");
  });

  it("TS-03: click en Trash2 llama a onDelete con el id", () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const note = makeNote({ id: "note-1" });

    render(
      <NoteCard
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={vi.fn()}
      />
    );

    // Find the Trash2 button (destructive button inside the card)
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    // Use more generic selector — trash icon button
    const buttons = document.querySelectorAll("button");
    // The delete button is the one with a trash icon — typically second button or has destructive class
    const trashBtn = Array.from(buttons).find(
      (btn) =>
        btn.innerHTML.includes("Trash2") ||
        btn.innerHTML.includes("trash") ||
        btn.className.includes("destructive")
    );
    expect(trashBtn).toBeInTheDocument();

    if (trashBtn) {
      fireEvent.click(trashBtn);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("note-1");
      // onEdit should NOT have been called (stopPropagation)
      expect(onEdit).toHaveBeenCalledTimes(0);
    }
  });

  it("TS-04: Star favorito siempre visible sin hover, click llama onToggleFavorite", () => {
    const onToggleFavorite = vi.fn();
    const note = makeNote({
      id: "note-fav-1",
      favorite: true,
    });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );

    // Star should be visible (not hidden via opacity-0 group-hover pattern)
    const starButton = screen.getByRole("button", { name: /favorito/i });
    expect(starButton).toBeInTheDocument();

    // The star button should NOT have opacity-0 class (always visible)
    expect(starButton.className).not.toContain("opacity-0");

    // Click the star button
    fireEvent.click(starButton);
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("note-fav-1");
  });

  it("TS-05: hashtags en contenido se muestran como badges/pills", () => {
    const note = makeNote({
      content: "Proyecto #react #tailwind en desarrollo",
    });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    // Hashtag pills should be rendered with the tag text (without #)
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("tailwind")).toBeInTheDocument();
  });

  it("TS-06: word count badge muestra número correcto de palabras", () => {
    const note = makeNote({
      content: "Esto es una nota de prueba con ocho palabras",
    });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    // 8 words → the "8" should appear in the metadata
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
