# ColorSwatchPicker

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/color-swatch-picker
> A list of color swatches that allows users to select a color from a predefined palette.


## Import

```tsx
import { ColorSwatchPicker, parseColor } from '@heroui/react';

```

### Usage

```tsx
import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function Basic() {
  return (
    <ColorSwatchPicker>
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}

```

### Anatomy

Import the ColorSwatchPicker component and access all parts using dot notation.

```tsx
import { ColorSwatchPicker } from '@heroui/react';

export default () => (
  <ColorSwatchPicker>
    <ColorSwatchPicker.Item color="#F43F5E">
      <ColorSwatchPicker.Swatch />
      <ColorSwatchPicker.Indicator />
    </ColorSwatchPicker.Item>
    <ColorSwatchPicker.Item color="#D946EF">
      <ColorSwatchPicker.Swatch />
      <ColorSwatchPicker.Indicator />
    </ColorSwatchPicker.Item>
    <ColorSwatchPicker.Item color="#8B5CF6">
      <ColorSwatchPicker.Swatch />
      <ColorSwatchPicker.Indicator />
    </ColorSwatchPicker.Item>
  </ColorSwatchPicker>
);

```

### Variants

```tsx
import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function Variants() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Circle (default)</span>
        <ColorSwatchPicker variant="circle">
          {colors.map((color) => (
            <ColorSwatchPicker.Item key={color} color={color}>
              <ColorSwatchPicker.Swatch />
              <ColorSwatchPicker.Indicator />
            </ColorSwatchPicker.Item>
          ))}
        </ColorSwatchPicker>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Square</span>
        <ColorSwatchPicker variant="square">
          {colors.map((color) => (
            <ColorSwatchPicker.Item key={color} color={color}>
              <ColorSwatchPicker.Swatch />
              <ColorSwatchPicker.Indicator />
            </ColorSwatchPicker.Item>
          ))}
        </ColorSwatchPicker>
      </div>
    </div>
  );
}

```

### Sizes

```tsx
import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

export function Sizes() {
  return (
    <div className="flex flex-col gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-8 text-sm text-muted">{size}</span>
          <ColorSwatchPicker size={size}>
            {colors.map((color) => (
              <ColorSwatchPicker.Item key={color} color={color}>
                <ColorSwatchPicker.Swatch />
                <ColorSwatchPicker.Indicator />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  );
}

```

### Stack Layout

```tsx
import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function StackLayout() {
  return (
    <ColorSwatchPicker layout="stack">
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}

```

### Default Value

```tsx
import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function DefaultValue() {
  return (
    <ColorSwatchPicker defaultValue="#8B5CF6">
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}

```

### Controlled

```tsx
"use client";

import {ColorSwatchPicker, parseColor} from "@heroui/react";
import {useState} from "react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function Controlled() {
  const [value, setValue] = useState(parseColor("#F43F5E"));

  return (
    <div className="flex flex-col gap-4">
      <ColorSwatchPicker value={value} onChange={setValue}>
        {colors.map((color) => (
          <ColorSwatchPicker.Item key={color} color={color}>
            <ColorSwatchPicker.Swatch />
            <ColorSwatchPicker.Indicator />
          </ColorSwatchPicker.Item>
        ))}
      </ColorSwatchPicker>
      <p className="text-sm text-muted">
        Selected: <span className="font-medium">{value.toString("hex")}</span>
      </p>
    </div>
  );
}

```

### Disabled

```tsx
import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function Disabled() {
  return (
    <ColorSwatchPicker>
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} isDisabled color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}

```

### Custom Indicator

```tsx
import {HeartFill} from "@gravity-ui/icons";
import {ColorSwatchPicker} from "@heroui/react";

export function CustomIndicator() {
  const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

  return (
    <ColorSwatchPicker>
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator>
            <HeartFill />
          </ColorSwatchPicker.Indicator>
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {ColorSwatchPicker} from "@heroui/react";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function CustomRenderFunction() {
  return (
    <ColorSwatchPicker render={(props) => <div {...props} data-custom="foo" />}>
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}

```

## Related Components

* **ColorSwatch**: Visual preview of a color value
* **ColorField**: Input for entering color values with hex format
* **ColorArea**: 2D color picker for selecting colors from a gradient area

## Styling

### Passing Tailwind CSS classes

You can customize the ColorSwatchPicker using className props:

```tsx
import { ColorSwatchPicker } from '@heroui/react';

function CustomColorSwatchPicker() {
  return (
    <ColorSwatchPicker className="gap-4">
      <ColorSwatchPicker.Item color="#F43F5E" className="shadow-lg">
        <ColorSwatchPicker.Swatch />
      </ColorSwatchPicker.Item>
      <ColorSwatchPicker.Item color="#D946EF">
        <ColorSwatchPicker.Swatch />
      </ColorSwatchPicker.Item>
    </ColorSwatchPicker>
  );
}

```

### Customizing the component classes

To customize the ColorSwatchPicker component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .color-swatch-picker {
    @apply gap-4;
  }

  .color-swatch-picker__item {
    @apply shadow-md;
  }

  .color-swatch-picker__swatch {
    @apply border-2 border-white;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ColorSwatchPicker component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/color-swatch-picker.css)):

#### Base & Structure

* `.color-swatch-picker` - Base container (flex layout)
* `.color-swatch-picker__item` - Individual swatch item wrapper
* `.color-swatch-picker__swatch` - The color swatch visual element

#### Size Classes

* `.color-swatch-picker--xs` - Extra small (16px)
* `.color-swatch-picker--sm` - Small (24px)
* `.color-swatch-picker--md` - Medium (32px, default)
* `.color-swatch-picker--lg` - Large (36px)
* `.color-swatch-picker--xl` - Extra large (40px)

#### Shape Variants

* `.color-swatch-picker--circle` - Circle shape (default)
* `.color-swatch-picker--square` - Square shape with rounded corners

#### Layout Classes

* `.color-swatch-picker--grid` - Horizontal wrapping layout (default)
* `.color-swatch-picker--stack` - Vertical stacked layout

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` - Scale up to 1.1 (only when not selected)
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` - Focus ring
* **Selected**: `[data-selected="true"]` - Inner border with same color as swatch
* **Disabled**: `[data-disabled="true"]` - Reduced opacity

## API Reference

### ColorSwatchPicker Props

Inherits from [React Aria ColorSwatchPicker](https://react-spectrum.adobe.com/react-aria/ColorSwatchPicker.html).

| Prop           | Type                                                                                 | Default    | Description                                                      |
| -------------- | ------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------- |
| `value`        | `string \| Color`                                                                    | -          | The current selected color (controlled)                          |
| `defaultValue` | `string \| Color`                                                                    | -          | The default selected color (uncontrolled)                        |
| `onChange`     | `(value: Color) => void`                                                             | -          | Handler called when selection changes                            |
| `size`         | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                                               | `"md"`     | Size of the swatches                                             |
| `variant`      | `"circle" \| "square"`                                                               | `"circle"` | Shape of the swatches                                            |
| `layout`       | `"grid" \| "stack"`                                                                  | `"grid"`   | Layout direction                                                 |
| `className`    | `string`                                                                             | -          | Additional CSS classes                                           |
| `children`     | `React.ReactNode`                                                                    | -          | ColorSwatchPicker.Item elements                                  |
| `render`       | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ColorSwatchPickerRenderProps>` | -          | Overrides the default DOM element with a custom render function. |

### ColorSwatchPicker.Item Props

| Prop         | Type                                                                                     | Default      | Description                                                      |
| ------------ | ---------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------- |
| `color`      | `string \| Color`                                                                        | **Required** | The color of the swatch                                          |
| `isDisabled` | `boolean`                                                                                | `false`      | Whether the item is disabled                                     |
| `className`  | `string`                                                                                 | -            | Additional CSS classes                                           |
| `children`   | `React.ReactNode`                                                                        | -            | ColorSwatchPicker.Swatch element                                 |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ColorSwatchPickerItemRenderProps>` | -            | Overrides the default DOM element with a custom render function. |

### ColorSwatchPicker.Swatch Props

| Prop        | Type     | Default | Description            |
| ----------- | -------- | ------- | ---------------------- |
| `className` | `string` | -       | Additional CSS classes |

### parseColor

The `parseColor` function is re-exported from React Aria Components for convenience:

```tsx
import { parseColor } from '@heroui/react';

// Parse hex color
const red = parseColor('#ff0000');

// Parse RGB
const green = parseColor('rgb(0, 255, 0)');

// Parse HSL
const blue = parseColor('hsl(240, 100%, 50%)');

```
