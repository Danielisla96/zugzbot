import { describe, it, expect } from "vitest";
import { validateEmail } from "../../src/validators.js";

describe("validateEmail", () => {
  it("should return true for valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("should return false for invalid email without @", () => {
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("should return false for null without throwing", () => {
    expect(validateEmail(null)).toBe(false);
  });
});
