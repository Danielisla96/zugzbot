import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

// Mock ALL lucide-react icons used across the app
vi.mock("lucide-react", () => ({
  Sun: () => <div data-testid="icon-sun" />,
  Moon: () => <div data-testid="icon-moon" />,
  Plus: () => <div data-testid="icon-plus" />,
  Search: () => <div data-testid="icon-search" />,
  Star: () => <div data-testid="icon-star" />,
  Trash2: () => <div data-testid="icon-trash" />,
  FileText: () => <div data-testid="icon-filetext" />,
  XIcon: () => <div data-testid="icon-x" />,
  CheckCircle2: () => <div data-testid="icon-checkcircle" />,
  Info: () => <div data-testid="icon-info" />,
  XCircle: () => <div data-testid="icon-xcircle" />,
  X: () => <div data-testid="icon-x" />,
  ArrowUpDown: () => <div data-testid="icon-arrow-up-down" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ArrowUpAZ: () => <div data-testid="icon-arrow-up-az" />,
  Clock: () => <div data-testid="icon-clock" />,
  Hash: () => <div data-testid="icon-hash" />,
  Tag: () => <div data-testid="icon-tag" />,
  Pin: () => <div data-testid="icon-pin" />,
  Eye: () => <div data-testid="icon-eye" />,
  Edit: () => <div data-testid="icon-edit" />,
}));

// Mock next-themes useTheme hook for ThemeToggle
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

// Mock @/components/ui/dialog
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogTrigger: ({ children, render, ..._props }: any) => {
    if (render) return <>{render}</>;
    return <div>{children}</div>;
  },
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogFooter: ({ children }: any) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

describe("Typography - TS-01: Layout carga Geist font correctamente", () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof window !== "undefined" && window.crypto) {
      vi.spyOn(window.crypto, "randomUUID").mockReturnValue(
        "test-uuid-xxxx" as `${string}-${string}-${string}-${string}-${string}`,
      );
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza el título con tracking-tight (card-title Vercel)", async () => {
    render(<Home />);

    // Esperar a que el componente cargue (useEffect de localStorage)
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "NOTAS", level: 1 })).toBeInTheDocument();
    });

    const heading = screen.getByRole("heading", { name: "NOTAS", level: 1 });

    // The heading should have Vercel typography classes
    expect(heading.className).toContain("tracking-tight");
    expect(heading.className).toContain("font-semibold");
  });

  it("renderiza el contenido principal (AppLayout con children)", async () => {
    render(<Home />);

    // Verificar que los elementos principales existen
    await waitFor(() => {
      expect(screen.getByText(/no hay notas aún/i)).toBeInTheDocument();
    });
  });
});
