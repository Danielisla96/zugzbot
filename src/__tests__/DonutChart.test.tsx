import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DonutChart } from "@/components/blocks/DonutChart";
import type { NoteColor } from "@/types";

// Mock NOTE_COLORS for deterministic tests
vi.mock("@/lib/colors", () => ({
  NOTE_COLORS: {
    indigo: { label: "Indigo", dot: "bg-[#5e6ad2]", lightBg: "bg-[#5e6ad2]/5", hex: "#5e6ad2" },
    orange: { label: "Orange", dot: "bg-[#f59e0b]", lightBg: "bg-[#f59e0b]/5", hex: "#f59e0b" },
    green: { label: "Green", dot: "bg-[#22c55e]", lightBg: "bg-[#22c55e]/5", hex: "#22c55e" },
    purple: { label: "Purple", dot: "bg-[#a855f7]", lightBg: "bg-[#a855f7]/5", hex: "#a855f7" },
    none: { label: "Sin color", dot: "", lightBg: "", hex: "" },
  },
}));

describe("DonutChart", () => {
  it("TS-ANIM-02: renderiza un conic-gradient con los segmentos de colores correctos", () => {
    const distribution: Record<NoteColor, number> = {
      indigo: 5,
      orange: 3,
      green: 2,
      purple: 0,
      gray: 0,
      red: 0,
      none: 0,
    };
    const totalNotes = 10;

    render(
      <DonutChart
        colorDistribution={distribution}
        totalNotes={totalNotes}
        onToggle={() => {}}
        showDonut={true}
      />
    );

    // El total de notas con color debe mostrarse en el centro del donut
    expect(screen.getByText("10")).toBeDefined(); // 5 + 3 + 2 = 10 (excluye "none", que vale 0)

    // El conic-gradient debe estar presente con los colores correctos
    const donutElement = document.querySelector("[data-donut-chart]");
    expect(donutElement).toBeDefined();

    // Verificar que el gradient string contiene los colores esperados
    const gradientStyle = donutElement?.getAttribute("style") || "";
    expect(gradientStyle).toContain("conic-gradient");
    expect(gradientStyle).toContain("#5e6ad2"); // indigo
    expect(gradientStyle).toContain("#f59e0b"); // orange
    expect(gradientStyle).toContain("#22c55e"); // green
  });

  it("muestra el total correcto cuando todos los colores están presentes", () => {
    const distribution: Record<NoteColor, number> = {
      indigo: 3,
      orange: 0,
      green: 0,
      purple: 0,
      gray: 0,
      red: 0,
      none: 5,
    };
    const totalNotes = 8;

    render(
      <DonutChart
        colorDistribution={distribution}
        totalNotes={totalNotes}
        onToggle={() => {}}
        showDonut={true}
      />
    );

    // Solo 3 notas con color (indigo)
    expect(screen.getByText("3")).toBeDefined();
  });

  it("muestra 0 en el centro cuando no hay notas con color", () => {
    const distribution: Record<NoteColor, number> = {
      indigo: 0,
      orange: 0,
      green: 0,
      purple: 0,
      gray: 0,
      red: 0,
      none: 5,
    };
    const totalNotes = 5;

    render(
      <DonutChart
        colorDistribution={distribution}
        totalNotes={totalNotes}
        onToggle={() => {}}
        showDonut={true}
      />
    );

    expect(screen.getByText("0")).toBeDefined();
  });
});
