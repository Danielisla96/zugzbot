import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsDashboard } from "@/components/blocks/StatsDashboard";
import type { Note, NoteColor } from "@/types";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  FileText: () => <span data-testid="icon-filetext">FT</span>,
  AlignLeft: () => <span data-testid="icon-alignleft">AL</span>,
  Type: () => <span data-testid="icon-type">T</span>,
  Star: () => <span data-testid="icon-star">S</span>,
  Pin: () => <span data-testid="icon-pin">P</span>,
  PieChart: () => <span data-testid="icon-piechart">PC</span>,
  Hash: () => <span data-testid="icon-hash">H</span>,
  Calendar: () => <span data-testid="icon-calendar">C</span>,
  TrendingUp: () => <span data-testid="icon-trendingup">TU</span>,
  Palette: () => <span data-testid="icon-palette">PAL</span>,
  Activity: () => <span data-testid="icon-activity">ACT</span>,
  Clock: () => <span data-testid="icon-clock">CLK</span>,
  Sparkles: () => <span data-testid="icon-sparkles">SPK</span>,
  Tag: () => <span data-testid="icon-tag">TAG</span>,
}));

const today = new Date();
const daysAgo = (days: number) =>
  new Date(today.getTime() - days * 86400000).toISOString();

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Test 1",
    content: "Hola mundo #test contenido largo con más de 50 caracteres para testear completion rate",
    favorite: true,
    pinned: false,
    color: "indigo" as NoteColor,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },
  {
    id: "2",
    title: "Test 2",
    content: "Segunda nota de prueba #importante",
    favorite: false,
    pinned: true,
    color: "orange" as NoteColor,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "3",
    title: "Test 3",
    content: "Tres",
    favorite: true,
    pinned: false,
    color: "green" as NoteColor,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "4",
    title: "Test 4",
    content: "Nota corta",
    favorite: false,
    pinned: false,
    color: "purple" as NoteColor,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
];

describe("StatsDashboard", () => {
  it("TS-01: renderiza las 8 metric cards con sus labels visibles", () => {
    render(<StatsDashboard notes={mockNotes} />);

    // Verificar que todos los labels de métricas están presentes
    expect(screen.getByText("Total Notas")).toBeDefined();
    expect(screen.getByText("Palabras")).toBeDefined();
    expect(screen.getByText("Caracteres")).toBeDefined();
    expect(screen.getByText("Favoritas")).toBeDefined();
    expect(screen.getByText("Fijadas")).toBeDefined();
    expect(screen.getByText("Hoy")).toBeDefined();
    expect(screen.getByText("Esta Semana")).toBeDefined();
    expect(screen.getByText("% Favoritos")).toBeDefined();
  });

  it("renderiza con array vacío mostrando ceros", () => {
    render(<StatsDashboard notes={[]} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });

  it("TS-01: muestra las secciones de distribución, actividad y hashtags", () => {
    render(<StatsDashboard notes={mockNotes} />);
    // La sección de hashtags debe mostrar hashtags si existen
    expect(screen.getByText("#test")).toBeDefined();
    expect(screen.getByText("#importante")).toBeDefined();
  });
});
