import { describe, it, expect } from "vitest";
import { countWords } from "./countWords";

describe("countWords", () => {
  it("cuenta palabras correctamente", () => {
    expect(countWords("Esto es una nota de prueba con ocho palabras")).toBe(9);
  });

  it("retorna 0 para string vacío", () => {
    expect(countWords("")).toBe(0);
  });

  it("retorna 0 para solo espacios", () => {
    expect(countWords("   ")).toBe(0);
  });

  it("cuenta palabras con espacios múltiples", () => {
    expect(countWords("hola    mundo")).toBe(2);
  });

  it("cuenta correctamente una sola palabra", () => {
    expect(countWords("hola")).toBe(1);
  });
});
