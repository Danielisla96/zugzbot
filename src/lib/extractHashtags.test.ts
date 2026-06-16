import { describe, it, expect } from "vitest";
import { extractHashtags } from "./extractHashtags";

describe("extractHashtags", () => {
  it("extrae hashtags de un texto", () => {
    expect(extractHashtags("Proyecto #react #tailwind en desarrollo")).toEqual(["react", "tailwind"]);
  });

  it("retorna array vacío si no hay hashtags", () => {
    expect(extractHashtags("Texto sin hashtags")).toEqual([]);
  });

  it("retorna array vacío para string vacío", () => {
    expect(extractHashtags("")).toEqual([]);
  });

  it("extrae hashtags con caracteres especiales (ñ, tildes)", () => {
    expect(extractHashtags("#españa #málaga")).toEqual(["españa", "málaga"]);
  });
});
