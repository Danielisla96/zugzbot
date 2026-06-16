import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotesList } from "@/components/blocks/NotesList";

// Mock lucide-react icons used by NotesList and EmptyState and NoteCard
vi.mock("lucide-react", () => ({
  FileText: () => <div data-testid="icon-filetext" />,
  Search: () => <div data-testid="icon-search" />,
  Plus: () => <div data-testid="icon-plus" />,
  Star: () => <div data-testid="icon-star" />,
  Trash2: () => <div data-testid="icon-trash" />,
  ArrowUpDown: () => <div data-testid="icon-arrow-up-down" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ArrowUpAZ: () => <div data-testid="icon-arrow-up-az" />,
}));

describe("EmptyState Tests (Contract Scenarios)", () => {
  it("TS-02: EmptyState usa jerarquía tipográfica Vercel (tracking-tight en título)", () => {
    render(
      <NotesList
        notes={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onCreateNew={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onFilteredCountChange={vi.fn()}
      />,
    );
    const title = screen.getByRole("heading", { name: /no hay notas aún/i });
    expect(title.className).toContain("tracking-tight");
    expect(title.className).toContain("font-semibold");
  });

  it("TS-01: Renderiza EmptyState cuando no hay notas", () => {
    render(
      <NotesList
        notes={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onCreateNew={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onFilteredCountChange={vi.fn()}
      />,
    );

    // Then: se muestra el componente EmptyState con el mensaje 'No hay notas aún.'
    expect(
      screen.getByRole("heading", { name: /no hay notas aún/i }),
    ).toBeInTheDocument();

    // El texto secundario del EmptyState
    expect(
      screen.getByText(/crea tu primera nota para empezar/i),
    ).toBeInTheDocument();

    // EmptyState tiene el icono FileText de lucide-react
    expect(screen.getByTestId("icon-filetext")).toBeInTheDocument();

    // EmptyState tiene un botón "Crear nota"
    expect(
      screen.getByRole("button", { name: /crear nota/i }),
    ).toBeInTheDocument();
  });
});
