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

    // Find the delete button by its aria-label
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("note-1");
    // onEdit should NOT have been called (stopPropagation)
    expect(onEdit).toHaveBeenCalledTimes(0);
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

    // 9 words → the "9" should appear in the metadata
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("TS-07: Pin toggle llama a onTogglePin con el id correcto", () => {
    const onTogglePin = vi.fn();
    const note = makeNote({ id: "note-pin-1" });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onTogglePin={onTogglePin}
      />
    );

    const pinButton = screen.getByRole("button", { name: /fijar nota/i });
    expect(pinButton).toBeInTheDocument();

    fireEvent.click(pinButton);
    expect(onTogglePin).toHaveBeenCalledTimes(1);
    expect(onTogglePin).toHaveBeenCalledWith("note-pin-1");
  });

  it("TS-08: Nota pinned muestra icono Pin con fill (acento) y rotación", () => {
    const note = makeNote({ id: "note-pinned-1", pinned: true });

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onTogglePin={vi.fn()}
      />
    );

    const pinButton = screen.getByRole("button", { name: /fijar nota/i });
    expect(pinButton).toBeInTheDocument();

    // The inner Pin icon should have fill class indicating pinned state
    const pinIcon = pinButton.querySelector("svg");
    expect(pinIcon).toBeInTheDocument();
    expect(pinIcon!.className).toContain("fill");
  });
});
