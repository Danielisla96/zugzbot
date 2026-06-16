import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// Mock ALL lucide-react icons used across the app (AppLayout, NotesList, NoteCard, EmptyState, Dialog)
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
}));

// Mock next-themes useTheme hook for ThemeToggle
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

// Mock @/components/ui/dialog para evitar dependencia de @base-ui/react en test
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) =>
    open ? <div role="dialog">{children}</div> : null,
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

const STORAGE_KEY = "notas-app";

const note1 = {
  id: "note-1",
  title: "Nota 1",
  content: "Contenido de la primera nota",
  favorite: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const note2 = {
  id: "note-2",
  title: "Nota 2",
  content: "Contenido de la segunda nota",
  favorite: true,
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("HomePage Tests (Contract Scenarios)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock window.confirm para happy-dom que no lo implementa
    window.confirm = vi.fn().mockReturnValue(true) as any;

    // Hacer deterministic crypto.randomUUID para las notas creadas en test
    if (typeof window !== "undefined" && window.crypto) {
      vi.spyOn(window.crypto, "randomUUID").mockReturnValue(
        "test-uuid-xxxx" as `${string}-${string}-${string}-${string}-${string}`,
      );
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TS-06: Persiste notas en localStorage entre recargas", async () => {
    // Given: el usuario ha creado 2 notas en la sesión actual
    // (pre-poblamos localStorage como si hubieran sido creadas antes)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([note1, note2]));

    // When: se renderiza la página (simula recarga)
    render(<Home />);

    // Then: las 2 notas se recuperan de localStorage
    await waitFor(() => {
      expect(screen.getByText("Nota 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Nota 2")).toBeInTheDocument();

    // Verificar que localStorage aún contiene los datos
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe("note-1");
    expect(stored[1].id).toBe("note-2");
  });

  it("TS-06b: Crea una nota nueva y la persiste en localStorage", async () => {
    const user = userEvent.setup();

    // Renderizar página vacía
    render(<Home />);

    // Esperar a que cargue (estado vacío)
    await waitFor(() => {
      expect(
        screen.getByText(/no hay notas aún/i),
      ).toBeInTheDocument();
    });

    // Crear una nueva nota
    const crearButton = screen.getByRole("button", { name: /crear nota/i });
    await user.click(crearButton);

    // Llenar el formulario
    const titleInput = screen.getByPlaceholderText(/título de la nota/i);
    await user.type(titleInput, "Nueva nota de prueba");

    const contentArea = screen.getByPlaceholderText(
      /escribe tu nota aquí/i,
    );
    await user.type(contentArea, "Contenido de prueba para persistencia");

    // Guardar
    const saveButton = screen.getByRole("button", { name: /guardar/i });
    await user.click(saveButton);

    // La nota debe aparecer en la lista
    await waitFor(() => {
      expect(
        screen.getByText("Nueva nota de prueba"),
      ).toBeInTheDocument();
    });

    // Verificar que se guardó en localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Nueva nota de prueba");
    expect(stored[0].id).toBe("test-uuid-xxxx");
    expect(stored[0].favorite).toBe(false);
  });

  it("TS-06c: Elimina una nota con buffer undo y persiste el cambio", async () => {
    const user = userEvent.setup();

    // Pre-poblar con 2 notas
    localStorage.setItem(STORAGE_KEY, JSON.stringify([note1, note2]));

    render(<Home />);

    // Esperar a que carguen las notas
    await waitFor(() => {
      expect(screen.getByText("Nota 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Nota 2")).toBeInTheDocument();

    // Nota: con sortBy="newest", Nota 2 (updatedAt más reciente) aparece primero.
    // trashIcons[0] corresponde a la primera NoteCard, que es Nota 2.
    const trashIcons = screen.getAllByTestId("icon-trash");
    await user.click(trashIcons[0].closest("button")!);

    // La nota eliminada (Nota 2) debe desaparecer de la lista (undo buffer)
    await waitFor(() => {
      expect(screen.queryByText("Nota 2")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Nota 1")).toBeInTheDocument();

    // Debe aparecer el toast "Nota eliminada" con botón "Deshacer"
    await waitFor(() => {
      expect(screen.getByText("Nota eliminada")).toBeInTheDocument();
    });
    expect(screen.getByText("Deshacer")).toBeInTheDocument();

    // Verificar que localStorage se actualizó (nota movida a buffer)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("note-1");
  });

  it("TS-06d: Toggle de favorito y persistencia", async () => {
    const user = userEvent.setup();

    // Nota 1 no es favorita, nota 2 sí
    localStorage.setItem(STORAGE_KEY, JSON.stringify([note1, note2]));

    render(<Home />);

    // Esperar a que carguen
    await waitFor(() => {
      expect(screen.getByText("Nota 1")).toBeInTheDocument();
    });

    // Nota: SortControls también usa Star icon ("Favoritos" botón).
    // getAllByTestId("icon-star") devuelve 3 elementos: [SortControls, NoteCard1, NoteCard2]
    // Navegamos al primer NoteCard (index 1) que es "Nota 2" con newest sort.
    // El NoteCard de "Nota 1" está en index 2.
    const starIcons = screen.getAllByTestId("icon-star");
    // Click en el último Star (Nota 1, que no es favorita aún)
    await user.click(starIcons[2].closest("button")!);

    // Verificar que localStorage se actualizó con favorite=true
    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]",
      );
      const updatedNote = stored.find((n: any) => n.id === "note-1");
      expect(updatedNote.favorite).toBe(true);
    });
  });
});
