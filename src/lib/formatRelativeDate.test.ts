import { describe, it, expect } from "vitest";
import { formatRelativeDate } from "./formatRelativeDate";

describe("formatRelativeDate", () => {
  it("devuelve 'hace 1 minuto' para fecha de hace 1 minuto", () => {
    const date = new Date(Date.now() - 60000).toISOString();
    expect(formatRelativeDate(date)).toBe("hace 1 minuto");
  });

  it("devuelve 'hace 5 minutos' para fecha de hace 5 minutos", () => {
    const date = new Date(Date.now() - 300000).toISOString();
    expect(formatRelativeDate(date)).toBe("hace 5 minutos");
  });

  it("devuelve 'hace 1 hora' para fecha de hace 1 hora", () => {
    const date = new Date(Date.now() - 3600000).toISOString();
    expect(formatRelativeDate(date)).toBe("hace 1 hora");
  });

  it("devuelve 'ayer' para fecha de hace 1 día", () => {
    const date = new Date(Date.now() - 86400000).toISOString();
    expect(formatRelativeDate(date)).toBe("ayer");
  });

  it("devuelve fecha formateada para más de 30 días", () => {
    const date = new Date("2025-01-15T12:00:00").toISOString();
    const result = formatRelativeDate(date);
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
