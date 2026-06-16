import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesList } from "@/components/blocks/NotesList";
import type { Note } from "@/types";

// Mock lucide-react icons used by NotesList
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="icon-search" />,
  Plus: () => <div data-testid="icon-plus" />,
  Star: () => <div data-testid="icon-star" />,
  Trash2: () => <div data-testid="icon-trash" />,
  ArrowUpDown: () => <div data-testid="icon-arrow-up-down" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ArrowUpAZ: () => <div data-testid="icon-arrow-up-az" />,
  Clock: () => <div data-testid="icon-clock" />,
  FileText: () => <div data-testid="icon-filetext" />,
  Hash: () => <div data-testid="icon-hash" />,
  Tag: () => <div data-testid="icon-tag" />,
  Pin: () => <div data-testid="icon-pin" />,
  Eye: () => <div data-testid="icon-eye" />,
  Edit: () => <div data-testid="icon-edit" />,
}));

const notes: Note[] = [
  {
    id: "1",
    title: "Compras",
    content: "leche",
    favorite: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Trabajo",
    content: "reunión",
    favorite: false,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Ideas",
    content: "proyecto",
    favorite: false,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
];

describe("NotesList Tests (Contract Scenarios)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("TS-04: Filtra notas por texto de búsqueda", async () => {
    const user = userEvent.setup();

    // Given: hay 3 notas
    render(
      <NotesList
        notes={notes}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onCreateNew={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onFilteredCountChange={vi.fn()}
      />,
    );

    // Verificar que las 3 notas se muestran inicialmente
    expect(screen.getByText("Compras")).toBeInTheDocument();
    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.getByText("Ideas")).toBeInTheDocument();

    // When: el usuario escribe 'tra' en el input de búsqueda
    const searchInput = screen.getByPlaceholderText(/buscar notas/i);
    await user.type(searchInput, "tra");

    // Then: solo se muestra 'Trabajo' porque contiene 'tra' en el título
    // 'Compras' (title="Compras", content="leche") → no contiene 'tra'
    // 'Trabajo' (title="Trabajo", content="reunión") → sí contiene 'tra'
    // 'Ideas' (title="Ideas", content="proyecto") → no contiene 'tra'
    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.queryByText("Compras")).not.toBeInTheDocument();
    expect(screen.queryByText("Ideas")).not.toBeInTheDocument();
  });

  it("TS-04b: Filtra notas por contenido también", async () => {
    const user = userEvent.setup();

    render(
      <NotesList
        notes={notes}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onCreateNew={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onFilteredCountChange={vi.fn()}
      />,
    );

    // Buscar 'leche' → debe encontrar 'Compras' (por contenido)
    const searchInput = screen.getByPlaceholderText(/buscar notas/i);
    await user.type(searchInput, "leche");

    expect(screen.getByText("Compras")).toBeInTheDocument();
    expect(screen.queryByText("Trabajo")).not.toBeInTheDocument();
    expect(screen.queryByText("Ideas")).not.toBeInTheDocument();
  });

  it("TS-04c: Muestra mensaje cuando no hay resultados", async () => {
    const user = userEvent.setup();

    render(
      <NotesList
        notes={notes}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onCreateNew={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onFilteredCountChange={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/buscar notas/i);
    await user.type(searchInput, "xyz123noexiste");

    // Debe mostrar el mensaje de "No se encontraron notas"
    expect(
      screen.getByText(/no se encontraron notas/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/xyz123noexiste/i),
    ).toBeInTheDocument();
  });
});
