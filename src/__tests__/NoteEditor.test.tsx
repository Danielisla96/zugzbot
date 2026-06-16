import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NoteEditor } from "@/components/blocks/NoteEditor";

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
});
