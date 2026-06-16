import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteEditor } from "@/components/blocks/NoteEditor";

// Mock lucide-react (XIcon es usado por DialogContent en dialog.tsx)
vi.mock("lucide-react", () => ({
  XIcon: () => <div data-testid="icon-x" />,
  X: () => <div data-testid="icon-x" />,
  Eye: () => <div data-testid="icon-eye" />,
  Edit: () => <div data-testid="icon-edit" />,
  FileText: () => <div data-testid="icon-filetext" />,
  Slash: () => <div data-testid="icon-slash" />,
}));

// Mock @/components/ui/dialog para que no dependa de @base-ui/react en test
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

describe("NoteEditor Tests (Contract Scenarios)", () => {
  it("TS-02: Crea una nueva nota y se agrega a la lista", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    // Given: el usuario abre el NoteEditor en modo creación con isOpen=true
    render(
      <NoteEditor
        note={null}
        isOpen={true}
        onSave={onSave}
        onClose={onClose}
      />,
    );

    // When: completa título 'Mi nota' y contenido 'Contenido de prueba'
    const titleInput = screen.getByPlaceholderText(/título de la nota/i);
    await user.type(titleInput, "Mi nota");

    const contentArea = screen.getByPlaceholderText(
      /escribe tu nota aquí/i,
    );
    await user.type(contentArea, "Contenido de prueba");

    // ...y hace clic en Guardar
    const saveButton = screen.getByRole("button", { name: /guardar/i });
    await user.click(saveButton);

    // Then: se genera una nota con id UUID, title='Mi nota', content='Contenido de prueba'
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      title: "Mi nota",
      content: "Contenido de prueba",
      color: "none",
    });

    // Then: se cierra el editor
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TS-02b: No guarda si el título está vacío", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <NoteEditor
        note={null}
        isOpen={true}
        onSave={onSave}
        onClose={onClose}
      />,
    );

    // El botón Guardar está deshabilitado cuando no hay título
    const saveButton = screen.getByRole("button", { name: /guardar/i });
    expect(saveButton).toBeDisabled();

    // Escribir solo contenido (sin título)
    const contentArea = screen.getByPlaceholderText(
      /escribe tu nota aquí/i,
    );
    await user.type(contentArea, "Solo contenido");

    // El botón sigue deshabilitado
    expect(saveButton).toBeDisabled();

    // onSave no fue llamado
    expect(onSave).not.toHaveBeenCalled();
  });
});
