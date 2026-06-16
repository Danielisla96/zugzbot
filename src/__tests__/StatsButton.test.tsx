import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsButton } from "@/components/ui/StatsButton";

vi.mock("lucide-react", () => ({
  BarChart3: () => <span data-testid="icon-barchart3">BC3</span>,
}));

// Mock Dialog from shadcn — must include DialogDescription
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => <div data-open={open}>{children}</div>,
  DialogTrigger: ({ children, render, ..._props }: any) => {
    if (render) return <>{render}</>;
    return <div>{children}</div>;
  },
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogClose: () => null,
}));

vi.mock("@/components/blocks/StatsDashboard", () => ({
  StatsDashboard: () => <div data-testid="stats-dashboard">Dashboard</div>,
}));

// ScrollArea mock ya no es necesario porque se elimina del componente,
// pero lo mantenemos por si el test anterior lo importaba
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

describe("StatsButton", () => {
  it("TS-02: renderiza el botón de estadísticas con título correcto", () => {
    render(<StatsButton notes={[]} />);
    expect(screen.getByTitle("Estadísticas")).toBeDefined();
  });

  it("TS-02: el DialogContent renderiza título 'Estadísticas' y subtítulo 'Resumen de tu actividad'", () => {
    render(<StatsButton notes={[]} />);

    // Verificar título del modal
    expect(screen.getByText("Estadísticas")).toBeDefined();

    // Verificar subtítulo/descripción
    expect(screen.getByText("Resumen de tu actividad")).toBeDefined();
  });

  it("TS-02: el modal incluye el StatsDashboard", () => {
    render(<StatsButton notes={mockNotesForButton} />);
    expect(screen.getByTestId("stats-dashboard")).toBeDefined();
  });
});

// Necesitamos datos mock para el tercer test
const mockNotesForButton = [
  {
    id: "1",
    title: "Nota test",
    content: "Contenido de prueba",
    favorite: false,
    pinned: false,
    color: "indigo" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
