# ColorSwatch

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/color-swatch
> A visual preview of a color value with accessibility support


## Import

```tsx
import { ColorSwatch } from '@heroui/react';

```

### Usage

```tsx
import {ColorSwatch} from "@heroui/react";

export function ColorSwatchBasic() {
  return (
    <div className="flex items-center gap-3">
      <ColorSwatch aria-label="Blue" color="#0485F7" />
      <ColorSwatch aria-label="Red" color="#EF4444" />
      <ColorSwatch aria-label="Amber" color="#F59E0B" />
      <ColorSwatch aria-label="Green" color="#10B981" />
      <ColorSwatch aria-label="Fuchsia" color="#D946EF" />
    </div>
  );
}

```

### Sizes

```tsx
import {ColorSwatch} from "@heroui/react";

export function ColorSwatchSizes() {
  return (
    <div className="flex items-center gap-3">
      <ColorSwatch color="#0485F7" size="xs" />
      <ColorSwatch color="#EF4444" size="sm" />
      <ColorSwatch color="#F59E0B" size="md" />
      <ColorSwatch color="#10B981" size="lg" />
      <ColorSwatch color="#D946EF" size="xl" />
    </div>
  );
}

```

### Shapes

```tsx
import {ColorSwatch} from "@heroui/react";

export function ColorSwatchShapes() {
  return (
    <div className="flex items-center gap-3">
      <ColorSwatch color="#0485F7" shape="circle" />
      <ColorSwatch color="#0485F7" shape="square" />
    </div>
  );
}

```

### Transparency

```tsx
import {ColorSwatch} from "@heroui/react";

export function ColorSwatchTransparency() {
  return (
    <div className="flex items-center gap-3">
      <ColorSwatch aria-label="100% opacity" color="rgba(4, 133, 247, 1)" />
      <ColorSwatch aria-label="75% opacity" color="rgba(4, 133, 247, 0.75)" />
      <ColorSwatch aria-label="50% opacity" color="rgba(4, 133, 247, 0.5)" />
      <ColorSwatch aria-label="25% opacity" color="rgba(4, 133, 247, 0.25)" />
      <ColorSwatch aria-label="0% opacity" color="rgba(4, 133, 247, 0)" />
    </div>
  );
}

```

### Custom Styles with Render Props

You can use the `style` render props to access the color value and create custom visual effects.

```tsx
"use client";

import {ColorSwatch} from "@heroui/react";

export function ColorSwatchCustomStyles() {
  const colors = ["#0485F7", "#EF4444", "#F59E0B", "#10B981", "#D946EF"];

  return (
    <div className="flex flex-col gap-8">
      {/* Glow effect */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Glow Effect</span>
        <div className="flex items-center gap-4">
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              size="xl"
              style={() => ({
                boxShadow: `0 0 20px 2px ${color}`,
              })}
            />
          ))}
        </div>
      </div>

      {/* Gradient swatch */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Gradient</span>
        <div className="flex items-center gap-4">
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              size="xl"
              style={({color: c}) => ({
                background: `linear-gradient(135deg, ${c.toString("css")}, white)`,
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

```

### Accessibility

Use `colorName` to provide a custom accessible name for the color, and `aria-label` to add context about how the color is used.

```tsx
import {ColorSwatch} from "@heroui/react";

export function ColorSwatchAccessibility() {
  return (
    <div className="flex items-center gap-3">
      <ColorSwatch aria-label="Primary brand color" color="#0485F7" colorName="Ocean Blue" />
      <ColorSwatch aria-label="Error state color" color="#EF4444" colorName="Coral Red" />
      <ColorSwatch aria-label="Warning color" color="#F59E0B" colorName="Sunset Orange" />
    </div>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {ColorSwatch} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <div className="flex items-center gap-3">
      <ColorSwatch
        aria-label="Blue"
        color="#0485F7"
        render={(props) => <div {...props} data-custom="blue" />}
      />
      <ColorSwatch
        aria-label="Red"
        color="#EF4444"
        render={(props) => <div {...props} data-custom="red" />}
      />
      <ColorSwatch
        aria-label="Amber"
        color="#F59E0B"
        render={(props) => <div {...props} data-custom="amber" />}
      />
      <ColorSwatch
        aria-label="Green"
        color="#10B981"
        render={(props) => <div {...props} data-custom="green" />}
      />
      <ColorSwatch
        aria-label="Fuchsia"
        color="#D946EF"
        render={(props) => <div {...props} data-custom="fuchsia" />}
      />
    </div>
  );
}

```

## Related Components

* **ColorSwatchPicker**: Color swatch selection from a list of colors
* **ColorField**: Input for entering color values with hex format
* **ColorArea**: 2D color picker for selecting colors from a gradient area

## Styling

### Passing Tailwind CSS classes

```tsx
import {ColorSwatch} from '@heroui/react';

function CustomColorSwatch() {
  return (
    <ColorSwatch
      className="size-12 rounded-lg"
      color="#0485F7"
    />
  );
}

```

### Customizing the component classes

To customize the ColorSwatch component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .color-swatch {
    @apply border-2 border-white;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ColorSwatch component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/color-swatch.css)):

#### Base Classes

* `.color-swatch` - Base swatch styles with checkered background for transparency

#### Shape Classes

* `.color-swatch--circle` - Circular shape (default)
* `.color-swatch--square` - Square shape with rounded corners

#### Size Classes

* `.color-swatch--xs` - Extra small (16px)
* `.color-swatch--sm` - Small (24px)
* `.color-swatch--md` - Medium (32px, default)
* `.color-swatch--lg` - Large (36px)
* `.color-swatch--xl` - Extra large (40px)

## API Reference

### ColorSwatch Props

| Prop         | Type                                                                           | Default    | Description                                                          |
| ------------ | ------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------- |
| `color`      | `string \| Color`                                                              | -          | The color value to display (hex, rgb, hsl, etc.)                     |
| `colorName`  | `string`                                                                       | -          | Accessible name for the color (overrides auto-generated description) |
| `className`  | `string`                                                                       | -          | Additional CSS classes                                               |
| `shape`      | `"circle" \| "square"`                                                         | `"circle"` | Shape of the swatch                                                  |
| `size`       | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                                         | `"md"`     | Size of the swatch                                                   |
| `style`      | `CSSProperties \| ((renderProps) => CSSProperties)`                            | -          | Inline styles or render props function with access to color          |
| `aria-label` | `string`                                                                       | -          | Accessible label for the swatch                                      |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ColorSwatchRenderProps>` | -          | Overrides the default DOM element with a custom render function.     |

### Style Render Props

When using the `style` prop as a function, you receive render props with access to the color:

```tsx
<ColorSwatch
  color="#0485F7"
  style={({ color }) => ({
    boxShadow: `0 4px 14px ${color.toString("css")}80`,
  })}
/>

```

The `color` object provides methods like:

* `color.toString("css")` - Returns CSS color string
* `color.toString("hex")` - Returns hex color string
* `color.getChannelValue("alpha")` - Returns alpha channel value
