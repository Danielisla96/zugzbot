import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NoteEditor } from "@/components/blocks/NoteEditor";
import type { Note } from "@/types";

function makeNote(overrides: Partial<Note> = {}): Note {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  return {
    id: "note-1",
    title: "Nota existente",
    content: "Contenido existente",
    favorite: false,
    createdAt: fiveMinAgo,
    updatedAt: fiveMinAgo,
    ...overrides,
  };
}

describe("NoteEditor", () => {
  it("TS-04: al seleccionar template, pre-llena título y contenido", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    // Open NoteEditor in create mode (note=null)
    render(
      <NoteEditor
        note={null}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // TemplateSelector should be visible (dialogue title says "Nueva nota")
    expect(screen.getByText("Nueva nota")).toBeInTheDocument();

    // Click on the "Reunión" template card
    const reunionButton = screen.getByText("Reunión");
    expect(reunionButton).toBeInTheDocument();
    fireEvent.click(reunionButton);

    // Title should be pre-filled with "📋 Reunión:" followed by date
    const titleInput = screen.getByPlaceholderText("Título de la nota");
    expect(titleInput).toBeInTheDocument();
    expect((titleInput as HTMLInputElement).value).toContain("📋 Reunión");

    // Content should be pre-filled with meeting structure (Asistentes, Orden del día, etc.)
    const contentArea = screen.getByPlaceholderText("Escribe tu nota aquí...");
    expect(contentArea).toBeInTheDocument();
    const contentValue = (contentArea as HTMLTextAreaElement).value;
    expect(contentValue).toContain("Asistentes");
    expect(contentValue).toContain("Orden del día");
    expect(contentValue).toContain("Acuerdos");
    expect(contentValue).toContain("Próximos pasos");
  });

  it("CLR-03: guarda nota con color seleccionado", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <NoteEditor
        note={null}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // Fill title and content
    const titleInput = screen.getByPlaceholderText("Título de la nota");
    fireEvent.change(titleInput, { target: { value: "Mi nota colorida" } });

    const contentArea = screen.getByPlaceholderText("Escribe tu nota aquí...");
    fireEvent.change(contentArea, { target: { value: "Contenido de prueba" } });

    // Click on a color (green)
    const greenButton = screen.getByRole("button", { name: /green/i });
    fireEvent.click(greenButton);

    // Click Guardar
    const saveButton = screen.getByText("Guardar");
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Mi nota colorida",
        content: "Contenido de prueba",
        color: "green",
      })
    );
  });

  it("CLR-06: inicializa color desde nota existente", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const existingNote = makeNote({ id: "note-color", color: "orange" as const });

    render(
      <NoteEditor
        note={existingNote}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // The ColorPicker should show orange as selected (has ring/active class)
    const orangeButton = screen.getByRole("button", { name: /orange/i });
    expect(orangeButton).toBeInTheDocument();
    expect(orangeButton.className).toContain("ring");
  });
});
