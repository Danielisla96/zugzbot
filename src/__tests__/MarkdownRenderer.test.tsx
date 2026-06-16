import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "@/components/blocks/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("TS-01: renderiza headings, bold, lists correctamente", () => {
    const markdown = [
      "## Título nivel 2",
      "",
      "Esto es **texto en negrita**",
      "",
      "- Item 1",
      "- Item 2",
      "- Item 3",
    ].join("\n");

    const { container } = render(<MarkdownRenderer content={markdown} />);

    // Heading h2 should exist
    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Título nivel 2");

    // Bold/strong text should exist
    const strong = container.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong).toHaveTextContent("texto en negrita");

    // List items should exist
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBeGreaterThanOrEqual(3);
    expect(listItems[0]).toHaveTextContent("Item 1");
    expect(listItems[1]).toHaveTextContent("Item 2");
    expect(listItems[2]).toHaveTextContent("Item 3");
  });

  it("TS-02: no renderiza HTML raw (XSS safety)", () => {
    const markdown = [
      "# Título seguro",
      "",
      '<script>alert("xss")</script>',
      "",
      '<img onerror="alert(1)" src="x" />',
      "",
      "texto normal",
    ].join("\n");

    const { container } = render(<MarkdownRenderer content={markdown} />);

    // The script tag should NOT be present as an actual HTML element
    const scripts = container.querySelectorAll("script");
    expect(scripts.length).toBe(0);

    // The img tag should NOT be present as an actual HTML element
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);

    // The raw HTML should appear as escaped text (the text content should contain it)
    expect(container.textContent).toContain("alert");
    expect(container.textContent).toContain("xss");
  });
});
