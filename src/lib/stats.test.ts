import { describe, it, expect, vi } from "vitest";
import { computeStats } from "@/lib/stats";
import type { Note, NoteColor } from "@/types";

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Nota 1",
    content: "Este es un contenido #importante #trabajo con varias palabras",
    favorite: true,
    pinned: true,
    color: "indigo" as NoteColor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Nota 2",
    content: "Otro contenido #trabajo más palabras aquí",
    favorite: false,
    pinned: false,
    color: "orange" as NoteColor,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Nota 3",
    content: "Tercera nota #personal sin hashtags repetidos",
    favorite: false,
    pinned: false,
    color: "none" as NoteColor,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("computeStats", () => {
  it("retorna 0s con array vacío", () => {
    const stats = computeStats([]);
    expect(stats.totalNotes).toBe(0);
    expect(stats.totalWords).toBe(0);
    expect(stats.totalChars).toBe(0);
    expect(stats.favoritedCount).toBe(0);
    expect(stats.pinnedCount).toBe(0);
    expect(stats.topHashtags).toEqual([]);
  });

  it("calcula métricas correctamente con 3 notas variadas", () => {
    const stats = computeStats(mockNotes);
    expect(stats.totalNotes).toBe(3);
    // 9 + 6 + 6 = 21 palabras
    expect(stats.totalWords).toBe(21);
    expect(stats.totalChars).toBe(
      mockNotes[0].content.length +
        mockNotes[1].content.length +
        mockNotes[2].content.length
    );
    expect(stats.favoritedCount).toBe(1);
    expect(stats.pinnedCount).toBe(1);
    expect(stats.colorDistribution.indigo).toBe(1);
    expect(stats.colorDistribution.orange).toBe(1);
    expect(stats.colorDistribution.none).toBe(1);
    expect(stats.topHashtags.length).toBeGreaterThan(0);
    expect(stats.topHashtags[0].tag).toBe("#trabajo");
    expect(stats.topHashtags[0].count).toBe(2);
  });
});
