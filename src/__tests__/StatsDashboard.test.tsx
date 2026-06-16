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
}));

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Test 1",
    content: "Hola mundo #test",
    favorite: true,
    pinned: false,
    color: "indigo" as NoteColor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Test 2",
    content: "Segunda nota de prueba #importante",
    favorite: false,
    pinned: true,
    color: "orange" as NoteColor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("StatsDashboard", () => {
  it("renderiza con notas y muestra métricas", () => {
    render(<StatsDashboard notes={mockNotes} />);
    // totalNotes = 2 aparece al menos una vez (también en "Creadas hoy" y "Esta semana")
    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza con array vacío", () => {
    render(<StatsDashboard notes={[]} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
