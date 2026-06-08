# Typography

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/typography
> A semantic typography primitive for headings, body copy, and inline code built on React Aria Components Text.


## Import

```tsx
import {Typography} from "@heroui/react";

```

## Usage

```tsx
import {Typography} from "@heroui/react";

const scale = [
  {
    label: "h1",
    meta: "36px / 600 / 1.11 / tight",
    sample: "Build better interfaces",
    type: "h1" as const,
  },
  {
    label: "h2",
    meta: "30px / 600 / 1.17 / tight",
    sample: "Built for the intelligence age",
    type: "h2" as const,
  },
  {
    label: "h3",
    meta: "24px / 600 / 1.25 / tight",
    sample: "Pricing on your terms",
    type: "h3" as const,
  },
  {
    label: "h4",
    meta: "20px / 600 / 1.33 / tight",
    sample: "Apply to the startup program",
    type: "h4" as const,
  },
  {
    label: "h5",
    meta: "18px / 600 / 1.39 / tight",
    sample: "Card titles",
    type: "h5" as const,
  },
  {
    label: "h6",
    meta: "16px / 600 / 1.50 / tight",
    sample: "Smaller feature headers",
    type: "h6" as const,
  },
  {
    label: "body",
    meta: "16px / 400 / 1.75",
    sample: "Primary body text used across documentation, marketing copy, and descriptions.",
    type: "body" as const,
  },
  {
    label: "body-sm",
    meta: "14px / 400 / 1.50",
    sample: "Secondary body, table cells, navigation, and sidebar items.",
    type: "body-sm" as const,
  },
  {
    label: "body-xs",
    meta: "12px / 400 / 1.25",
    sample: "Captions, badges, helper text, and fine print.",
    type: "body-xs" as const,
  },
  {
    label: "code",
    meta: "14px / mono",
    sample: "pnpm add @heroui/react",
    type: "code" as const,
  },
] as const;

export const TypographyScale = () => {
  return (
    <div className="flex w-full flex-col divide-y divide-border">
      {scale.map((row) => (
        <div key={row.label} className="grid grid-cols-[160px_1fr] items-center gap-8 py-5">
          <div className="flex shrink-0 flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{row.label}</span>
            <span className="text-xs whitespace-nowrap text-muted">{row.meta}</span>
          </div>
          <Typography type={row.type}>{row.sample}</Typography>
        </div>
      ))}
    </div>
  );
};

```

`Typography` maps visual `type` values to semantic elements by default.

## Primitives

```tsx
import {Typography} from "@heroui/react";

export const Primitives = () => {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Typography.Heading level={1}>Dashboard</Typography.Heading>
      <Typography.Paragraph>
        Convenience primitives are thin wrappers over Typography, so you can choose explicit
        composition without learning a second styling system.
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Paragraph supports base, sm, and xs sizes.
      </Typography.Paragraph>
      <Typography.Code>Typography.Code</Typography.Code>
    </div>
  );
};

```

* `Typography.Heading` maps `level={1..6}` to `type="h1"` through `type="h6"`.
* `Typography.Paragraph` maps `size="base" | "sm" | "xs"` to body text styles.
* `Typography.Code` maps to the inline code style.
* `Typography.Prose` styles rich content passed as regular HTML children.

## Prose

```tsx
import {Typography} from "@heroui/react";

export const Prose = () => {
  return (
    <Typography.Prose className="flex max-w-xl flex-col gap-3">
      <h1>Prose title</h1>
      <p>
        Prose is for authored content where the markup is already semantic and HeroUI applies the
        default typography rhythm.
      </p>
      <h2>Section title</h2>
      <p>
        Inline code like <code>render</code> receives the same code treatment as the Typography
        primitive.
      </p>
    </Typography.Prose>
  );
};

```

## Render Prop

```tsx
"use client";

import {Typography} from "@heroui/react";

export const RenderProps = () => {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Typography render={({children, ...domProps}) => <h2 {...domProps}>{children}</h2>} type="h1">
        H1 visual style, h2 semantic element
      </Typography>
      <Typography render={({children, ...domProps}) => <span {...domProps}>{children}</span>}>
        The render prop can swap the underlying element while preserving HeroUI props and styles.
      </Typography>
    </div>
  );
};

```

Use the React Aria Components-style `render` prop when you need to customize the rendered element.

## CSS Classes

### Base Classes

* `.typography` - Base typography primitive
* `.typography-prose` - Rich prose container

### Type Classes

* `.typography--h1` through `.typography--h6`
* `.typography--body`, `.typography--body-sm`, `.typography--body-xs`
* `.typography--code`

### Modifier Classes

* `.typography--align-start`, `.typography--align-center`, `.typography--align-end`, `.typography--align-justify`
* `.typography--color-default`, `.typography--color-muted`
* `.typography--truncate`
* `.typography--weight-normal`, `.typography--weight-medium`, `.typography--weight-semibold`, `.typography--weight-bold`

## API Reference

### Typography Props

| Prop       | Type                                                                                         | Default     | Description                                   |
| ---------- | -------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------- |
| `type`     | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'body' \| 'body-sm' \| 'body-xs' \| 'code'` | `'body'`    | Semantic typography style.                    |
| `align`    | `'start' \| 'center' \| 'end' \| 'justify'`                                                  | `'start'`   | Text alignment.                               |
| `color`    | `'default' \| 'muted'`                                                                       | `'default'` | Text color.                                   |
| `weight`   | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                               | -           | Font weight override.                         |
| `truncate` | `boolean`                                                                                    | -           | Truncates the text to one line with ellipsis. |
| `render`   | `DOMRenderFunction`                                                                          | -           | Custom render function from React Aria.       |
| `children` | `ReactNode`                                                                                  | -           | Text content.                                 |
