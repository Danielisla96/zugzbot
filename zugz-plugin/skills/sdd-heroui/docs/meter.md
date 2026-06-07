# Meter

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/meter
> A meter represents a quantity within a known range, or a fractional value.


## Import

```tsx
import { Meter, Label } from '@heroui/react';

```

### Usage

```tsx
import {Label, Meter} from "@heroui/react";

export function Basic() {
  return (
    <Meter aria-label="Storage" className="w-64" value={60}>
      <Label>Storage</Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}

```

### Anatomy

```tsx
import { Meter, Label } from '@heroui/react';

export default () => (
  <Meter value={60}>
    <Label>Storage</Label>
    <Meter.Output />
    <Meter.Track>
      <Meter.Fill />
    </Meter.Track>
  </Meter>
);

```

### Sizes

```tsx
import {Label, Meter} from "@heroui/react";

export function Sizes() {
  return (
    <div className="flex w-64 flex-col gap-6">
      <Meter color="success" size="sm" value={40}>
        <Label>Small</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="accent" size="md" value={60}>
        <Label>Medium</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="warning" size="lg" value={80}>
        <Label>Large</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
    </div>
  );
}

```

### Colors

```tsx
import {Label, Meter} from "@heroui/react";

export function Colors() {
  return (
    <div className="flex w-64 flex-col gap-6">
      <Meter color="default" value={50}>
        <Label>Default</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="accent" value={50}>
        <Label>Accent</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="success" value={50}>
        <Label>Success</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="warning" value={50}>
        <Label>Warning</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="danger" value={50}>
        <Label>Danger</Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
    </div>
  );
}

```

### Custom Value Scale

Use `minValue`, `maxValue`, and `formatOptions` to customize the value range and display format.

```tsx
import {Label, Meter} from "@heroui/react";

export function CustomValue() {
  return (
    <Meter
      className="w-64"
      formatOptions={{currency: "USD", style: "currency"}}
      maxValue={1000}
      minValue={0}
      value={750}
    >
      <Label>Revenue</Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}

```

### Without Label

When no visible label is needed, use `aria-label` for accessibility.

```tsx
import {Meter} from "@heroui/react";

export function WithoutLabel() {
  return (
    <Meter aria-label="Storage usage" className="w-64" value={45}>
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}

```

## Styling

### Passing Tailwind CSS classes

You can customize individual Meter parts:

```tsx
import { Meter, Label } from '@heroui/react';

function CustomMeter() {
  return (
    <Meter value={60}>
      <Label>Storage</Label>
      <Meter.Output />
      <Meter.Track className="bg-purple-100 dark:bg-purple-900">
        <Meter.Fill className="bg-purple-500" />
      </Meter.Track>
    </Meter>
  );
}

```

### Customizing the component classes

To customize the Meter component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .meter {
    @apply w-full gap-2;
  }

  .meter__track {
    @apply h-3 rounded-full;
  }

  .meter__fill {
    @apply rounded-full;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Meter component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/meter.css)):

#### Base & Element Classes

* `.meter` - Base container (grid layout)
* `.meter__output` - Value text display
* `.meter__track` - Track background
* `.meter__fill` - Filled portion of the track

#### Size Classes

* `.meter--sm` - Small size variant (thinner track)
* `.meter--md` - Medium size variant (default)
* `.meter--lg` - Large size variant (thicker track)

#### Color Classes

* `.meter--default` - Default color variant
* `.meter--accent` - Accent color variant
* `.meter--success` - Success color variant
* `.meter--warning` - Warning color variant
* `.meter--danger` - Danger color variant

## API Reference

### Meter Props

Inherits from [React Aria Meter](https://react-spectrum.adobe.com/react-aria/Meter.html).

| Prop            | Type                                                          | Default              | Description                         |
| --------------- | ------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `value`         | `number`                                                      | `0`                  | The current value                   |
| `minValue`      | `number`                                                      | `0`                  | The minimum value                   |
| `maxValue`      | `number`                                                      | `100`                | The maximum value                   |
| `size`          | `"sm" \| "md" \| "lg"`                                        | `"md"`               | Size of the meter track             |
| `color`         | `"default" \| "accent" \| "success" \| "warning" \| "danger"` | `"accent"`           | Color of the fill bar               |
| `formatOptions` | `Intl.NumberFormatOptions`                                    | `{style: 'percent'}` | Number format for the value display |
| `valueLabel`    | `ReactNode`                                                   | -                    | Custom value label content          |
| `children`      | `ReactNode \| (values: MeterRenderProps) => ReactNode`        | -                    | Content or render prop              |

### MeterRenderProps

When using the render prop pattern, these values are provided:

| Prop         | Type     | Description                         |
| ------------ | -------- | ----------------------------------- |
| `percentage` | `number` | The percentage of the meter (0-100) |
| `valueText`  | `string` | The formatted value text            |
