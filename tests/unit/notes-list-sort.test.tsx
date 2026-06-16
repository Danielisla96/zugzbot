import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesList } from "@/components/blocks/NotesList";
import type { Note } from "@/types";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="icon-search" />,
  Plus: () => <div data-testid="icon-plus" />,
  Star: () => <div data-testid="icon-star" />,
  Trash2: () => <div data-testid="icon-trash" />,
  ArrowUpDown: () => <div data-testid="icon-arrow-up-down" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ArrowUpAZ: () => <div data-testid="icon-arrow-up-az" />,
  FileText: () => <div data-testid="icon-filetext" />,
  Clock: () => <div data-testid="icon-clock" />,
  Hash: () => <div data-testid="icon-hash" />,
  Tag: () => <div data-testid="icon-tag" />,
  Pin: () => <div data-testid="icon-pin" />,
  Eye: () => <div data-testid="icon-eye" />,
  Edit: () => <div data-testid="icon-edit" />,
}));

describe("NotesList Sort (Contract Scenarios TS-04, TS-05)", () => {
  const notesNewestFirst: Note[] = [
    {
      id: "3",
      title: "Zapato",
      content: "zapato contenido",
      favorite: false,
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-15T10:00:00.000Z",
    },
    {
      id: "1",
      title: "Alfombra",
      content: "alfombra contenido",
      favorite: false,
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-10T10:00:00.000Z",
    },
    {
      id: "2",
      title: "Música",
      content: "música contenido",
      favorite: false,
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z",
    },
  ];

  const defaultProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleFavorite: vi.fn(),
    onCreateNew: vi.fn(),
    onFilteredCountChange: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("TS-04: Sort 'newest' ordena por updatedAt descendente", () => {
    // Given: 3 notas con diferentes updatedAt
    // Zapato: updatedAt 2026-06-15
    // Alfombra: updatedAt 2026-06-10
    // Música: updatedAt 2026-06-01
    render(
      <NotesList
        {...defaultProps}
        notes={notesNewestFirst}
        sortBy="newest"
        onSortChange={vi.fn()}
      />,
    );

    // When: sortBy = "newest"
    // Then: el orden debe ser Zapato → Alfombra → Música (más reciente primero)
    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(3);
    expect(titles[0].textContent).toBe("Zapato");
    expect(titles[1].textContent).toBe("Alfombra");
    expect(titles[2].textContent).toBe("Música");
  });

  it("TS-04b: Sort 'oldest' ordena por updatedAt ascendente", () => {
    render(
      <NotesList
        {...defaultProps}
        notes={notesNewestFirst}
        sortBy="oldest"
        onSortChange={vi.fn()}
      />,
    );

    // When: sortBy = "oldest"
    // Then: el orden debe ser Música → Alfombra → Zapato (más antiguo primero)
    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(3);
    expect(titles[0].textContent).toBe("Música");
    expect(titles[1].textContent).toBe("Alfombra");
    expect(titles[2].textContent).toBe("Zapato");
  });

  it("TS-05: Sort 'a-z' ordena alfabéticamente por título", () => {
    render(
      <NotesList
        {...defaultProps}
        notes={notesNewestFirst}
        sortBy="a-z"
        onSortChange={vi.fn()}
      />,
    );

    // When: sortBy = "a-z"
    // Then: el orden debe ser Alfombra → Música → Zapato
    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(3);
    expect(titles[0].textContent).toBe("Alfombra");
    expect(titles[1].textContent).toBe("Música");
    expect(titles[2].textContent).toBe("Zapato");
  });

  it("TS-05b: Sort 'favorites-first' pone favoritas primero", () => {
    const notesWithFav = [
      { ...notesNewestFirst[0], favorite: false }, // Zapato, no fav
      { ...notesNewestFirst[1], favorite: true }, // Alfombra, fav
      { ...notesNewestFirst[2], favorite: false }, // Música, no fav
    ];

    render(
      <NotesList
        {...defaultProps}
        notes={notesWithFav}
        sortBy="favorites-first"
        onSortChange={vi.fn()}
      />,
    );

    // When: sortBy = "favorites-first"
    // Then: Alfombra (fav) debe aparecer primero, luego Zapato y Música
    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(3);
    expect(titles[0].textContent).toBe("Alfombra");
    // El resto puede ir en cualquier orden dentro del grupo
  });

  it("TS-04c: SortControls permite cambiar el criterio de orden", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();

    render(
      <NotesList
        {...defaultProps}
        notes={notesNewestFirst}
        sortBy="newest"
        onSortChange={onSortChange}
      />,
    );

    // Given: el sort actual es "newest"
    // When: el usuario hace clic en "A-Z"
    const azButton = screen.getByRole("button", { name: /a-z/i });
    await user.click(azButton);

    // Then: onSortChange se llama con "a-z"
    expect(onSortChange).toHaveBeenCalledWith("a-z");
  });
});
