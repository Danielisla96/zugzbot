import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TemplateSelector } from "@/components/blocks/TemplateSelector";

describe("TemplateSelector", () => {
  it("TS-03: renderiza 4 templates en grid", () => {
    const onSelectTemplate = vi.fn();

    render(<TemplateSelector onSelectTemplate={onSelectTemplate} />);

    // Should show 4 template names
    expect(screen.getByText("Reunión")).toBeInTheDocument();
    expect(screen.getByText("Diario")).toBeInTheDocument();
    expect(screen.getByText("TODO List")).toBeInTheDocument();
    expect(screen.getByText("Idea")).toBeInTheDocument();

    // Should show blank note option
    expect(screen.getByText(/Nota en blanco/i)).toBeInTheDocument();

    // Should show emojis for each template
    expect(screen.getByText("📋")).toBeInTheDocument();
    expect(screen.getByText("📔")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();
  });
});
