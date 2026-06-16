import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsButton } from "@/components/ui/StatsButton";
import type { Note } from "@/types";

vi.mock("lucide-react", () => ({
  BarChart3: () => <span data-testid="icon-barchart3">BC3</span>,
}));

// Mock Dialog from shadcn
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({ children, render, ..._props }: any) => {
    if (render) return <>{render}</>;
    return <div>{children}</div>;
  },
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogClose: () => null,
}));

vi.mock("@/components/blocks/StatsDashboard", () => ({
  StatsDashboard: () => <div data-testid="stats-dashboard">Dashboard</div>,
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

describe("StatsButton", () => {
  it("renderiza el botón de estadísticas", () => {
    render(<StatsButton notes={[]} />);
    expect(screen.getByTitle("Estadísticas")).toBeDefined();
  });
});
