import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteStats } from "@/components/blocks/NoteStats";

describe("NoteStats (Contract Scenario TS-06)", () => {
  it("TS-06: Muestra contador '12 notas' cuando totalCount=12 y no hay búsqueda activa", () => {
    // Given: totalCount=12, filteredCount=12, searchActive=false
    render(
      <NoteStats
        totalCount={12}
        filteredCount={12}
        searchActive={false}
      />,
    );

    // When: se renderiza NoteStats
    // Then: el texto visible contiene '12 notas'
    expect(screen.getByText("12 notas")).toBeInTheDocument();
  });

  it("TS-06b: Muestra '0 notas' cuando no hay notas", () => {
    render(
      <NoteStats
        totalCount={0}
        filteredCount={0}
        searchActive={false}
      />,
    );

    expect(screen.getByText("0 notas")).toBeInTheDocument();
  });

  it("TS-06: Muestra '8 de 12 notas' cuando searchActive=true y filteredCount=8", () => {
    // Given: totalCount=12, filteredCount=8, searchActive=true
    render(
      <NoteStats
        totalCount={12}
        filteredCount={8}
        searchActive={true}
      />,
    );

    // When: se renderiza NoteStats con búsqueda activa
    // Then: el texto visible contiene '8 de 12 notas'
    expect(screen.getByText("8 de 12 notas")).toBeInTheDocument();
  });

  it("TS-06c: Muestra '1 nota' (singular) cuando hay exactamente 1 nota", () => {
    render(
      <NoteStats
        totalCount={1}
        filteredCount={1}
        searchActive={false}
      />,
    );

    // Singular: debe decir '1 nota', no '1 notas'
    expect(screen.getByText("1 nota")).toBeInTheDocument();
  });

  it("TS-06d: Muestra '1 de 3 notas' cuando searchActive y filteredCount=1", () => {
    render(
      <NoteStats
        totalCount={3}
        filteredCount={1}
        searchActive={true}
      />,
    );

    expect(screen.getByText("1 de 3 notas")).toBeInTheDocument();
  });
});
