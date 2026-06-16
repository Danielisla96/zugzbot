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

  // ─── ANIM-01: NoteCards se renderizan con animate-fade-slide-up y animationDelay progresivo ───
  it("ANIM-01: NoteCards se renderizan con animate-fade-slide-up y animationDelay progresivo", () => {
    // Given: NotesList recibe 3 notas válidas
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

    // When: se renderiza el grid de NoteCards
    const cards = screen.getAllByRole("article");

    // Then: cada NoteCard tiene la clase CSS animate-fade-slide-up
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.className).toContain("animate-fade-slide-up");
    });

    // Then: cada card tiene animationDelay progresivo (0ms, 60ms, 120ms)
    expect(cards[0].style.animationDelay).toBe("0ms");
    expect(cards[1].style.animationDelay).toBe("60ms");
    expect(cards[2].style.animationDelay).toBe("120ms");
  });

  // ─── ANIM-02: Filtros de color aparecen escalonados con fade-slide-up rápido y hover scale ───
  it("ANIM-02: Los filtros de color tienen animate-fade-slide-up-fast, animationDelay y hover scale", () => {
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

    // Encontrar los botones de color pill (Indigo, Orange, Green, Red, Purple, Gray)
    const colorLabels = ["Indigo", "Orange", "Green", "Red", "Purple", "Gray"];
    const colorPills = colorLabels.map((label) =>
      screen.getByRole("button", { name: new RegExp(label, "i") }),
    );
    expect(colorPills).toHaveLength(6);

    // Then: cada botón de color tiene clase 'animate-fade-slide-up-fast'
    colorPills.forEach((pill) => {
      expect(pill.className).toContain("animate-fade-slide-up-fast");
    });

    // Then: animationDelay progresivo (index * 40ms)
    colorPills.forEach((pill, index) => {
      expect(pill.style.animationDelay).toBe(`${index * 40}ms`);
    });

    // Then: hover:scale-105 con transition-all duration-200 ease-out
    colorPills.forEach((pill) => {
      expect(pill.className).toContain("hover:scale-105");
      expect(pill.className).toContain("transition-all");
      expect(pill.className).toContain("duration-200");
      expect(pill.className).toContain("ease-out");
    });

    // Then: El botón "Todas" también tiene animate-fade-slide-up-fast y hover:scale-105
    const todasButton = screen.getByRole("button", { name: /todas/i });
    expect(todasButton.className).toContain("animate-fade-slide-up-fast");
    expect(todasButton.className).toContain("hover:scale-105");
    expect(todasButton.className).toContain("transition-all");
  });

  // ─── ANIM-04: Animación no rompe funcionalidad de búsqueda y filtrado por color ───
  it("ANIM-04: Búsqueda y filtro de color funcionan correctamente con animaciones", async () => {
    const user = userEvent.setup();

    // Given: Notas con colores diferentes
    const coloredNotes: Note[] = [
      { ...notes[0], title: "Nota Indigo", color: "indigo" },
      { ...notes[1], title: "Nota Orange", color: "orange" },
      { ...notes[2], title: "Nota Gray", color: "gray" },
    ];

    render(
      <NotesList
        notes={coloredNotes}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleFavorite={vi.fn()}
        onCreateNew={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onFilteredCountChange={vi.fn()}
      />,
    );

    // Then: las 3 notas se renderizan con animate-fade-slide-up
    let cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.className).toContain("animate-fade-slide-up");
    });

    // When: el usuario escribe 'Indigo' en el search input
    const searchInput = screen.getByPlaceholderText(/buscar notas/i);
    await user.type(searchInput, "Indigo");

    // Then: solo se muestra la nota "Nota Indigo"
    expect(screen.getByText("Nota Indigo")).toBeInTheDocument();
    expect(screen.queryByText("Nota Orange")).not.toBeInTheDocument();
    expect(screen.queryByText("Nota Gray")).not.toBeInTheDocument();

    // Las notas filtradas siguen teniendo animate-fade-slide-up
    cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(1);
    expect(cards[0].className).toContain("animate-fade-slide-up");

    // When: limpia búsqueda y filtra por color
    await user.clear(searchInput);
    const orangeFilter = screen.getByRole("button", { name: /orange/i });
    await user.click(orangeFilter);

    // Then: solo se muestra la nota Naranja
    expect(screen.getByText("Nota Orange")).toBeInTheDocument();
    expect(screen.queryByText("Nota Indigo")).not.toBeInTheDocument();
    expect(screen.queryByText("Nota Gray")).not.toBeInTheDocument();

    // Las cards filtradas tienen animate-fade-slide-up sin errores
    cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(1);
    expect(cards[0].className).toContain("animate-fade-slide-up");
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
